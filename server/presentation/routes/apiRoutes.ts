import { Router, type Request, type Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import type {
  GetServiceByIdUseCase,
  ListApprovedServicesUseCase,
  QuoteEscrowUseCase
} from '../../application/catalogUseCases';
import type {
  EnsureConversationUseCase,
  ListConversationsUseCase,
  SendChatMessageUseCase
} from '../../application/chatUseCases';
import type { DispatchOrderNotificationsUseCase } from '../../application/dispatchUseCases';
import type {
  GetCulqiConfigUseCase,
  ListCulqiTransactionsUseCase,
  ProcessCulqiChargeUseCase
} from '../../application/paymentUseCases';
import type { CacheStore, ChatRepository } from '../../domain/ports';
import { openApiSpec } from '../../infrastructure/docs/openapi';

export interface ApiRouterDependencies {
  cache: CacheStore;
  chatRepo: ChatRepository;
  getCulqiConfig: GetCulqiConfigUseCase;
  listCulqiTransactions: ListCulqiTransactionsUseCase;
  processCulqiCharge: ProcessCulqiChargeUseCase;
  listConversations: ListConversationsUseCase;
  ensureConversation: EnsureConversationUseCase;
  sendChatMessage: SendChatMessageUseCase;
  dispatchOrder: DispatchOrderNotificationsUseCase;
  listApprovedServices: ListApprovedServicesUseCase;
  getServiceById: GetServiceByIdUseCase;
  quoteEscrow: QuoteEscrowUseCase;
}

function sendCachedJson<T>(
  req: Request,
  res: Response,
  value: T,
  etag: string,
  cacheHit: boolean,
  cacheControl: string
): void {
  res.setHeader('X-Cache', cacheHit ? 'HIT' : 'MISS');
  res.setHeader('Cache-Control', cacheControl);
  res.setHeader('ETag', etag);
  if (req.headers['if-none-match'] === etag) {
    res.status(304).end();
    return;
  }
  res.json(value);
}

/**
 * Capa de Presentación — Enrutador REST + OpenAPI/Swagger UI (Clean Architecture Capa 4)
 * Los controladores delegan toda lógica de negocio a Casos de Uso (SOLID SRP + DIP).
 */
export function createApiRouter(deps: ApiRouterDependencies): Router {
  const router = Router();

  // Documentación OpenAPI 3.0.3 + Swagger UI interactivo
  router.get('/api/openapi.json', (_req, res) => {
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.json(openApiSpec);
  });

  router.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(openApiSpec, {
      customSiteTitle: 'TrabajaYa Perú — Swagger / OpenAPI 3.0',
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true
      }
    })
  );

  // Healthcheck
  router.get('/api/health', (_req, res) => {
    res.json({
      ok: true,
      conversations: deps.chatRepo.count(),
      architecture: 'Clean Architecture — Monolito Modular en Capas'
    });
  });

  // Observabilidad de Caché (LRU/TTL + Redis-ready Port)
  router.get('/api/cache/stats', (_req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.json({
      ok: true,
      backend: process.env.REDIS_URL ? 'redis-adapter-ready' : 'lru-memory',
      stats: deps.cache.stats()
    });
  });

  // Catálogo Nacional Multioficios (Cache-Aside 60s + ETag / 304)
  router.get('/api/services', (req, res) => {
    const { entry, cacheHit } = deps.listApprovedServices.execute({
      oficio: req.query.oficio ? String(req.query.oficio) : undefined,
      region: req.query.region ? String(req.query.region) : undefined,
      provincia: req.query.provincia ? String(req.query.provincia) : undefined,
      distrito: req.query.distrito ? String(req.query.distrito) : undefined,
      q: req.query.q ? String(req.query.q) : undefined
    });
    sendCachedJson(req, res, entry.value, entry.etag, cacheHit, 'public, max-age=60');
  });

  router.get('/api/services/:id', (req, res) => {
    const { entry, cacheHit } = deps.getServiceById.execute(String(req.params.id || ''));
    if (!entry) {
      res.status(404).json({ ok: false, error: 'Servicio no encontrado o no aprobado.' });
      return;
    }
    sendCachedJson(req, res, entry.value, entry.etag, cacheHit, 'public, max-age=60');
  });

  // Cotizador Financiero Escrow (Garantía 10% + IGV 18%)
  router.post('/api/escrow/quote', (req, res) => {
    const result = deps.quoteEscrow.execute(req.body || {});
    if (!result.ok) {
      res.status(result.statusCode).json({ ok: false, error: result.error });
      return;
    }
    res.json({ ok: true, quote: result.quote });
  });

  // Culqi Gateway Configuration (Cache-Aside 60s + ETag / 304)
  router.get('/api/payments/culqi/config', (req, res) => {
    const { entry, cacheHit } = deps.getCulqiConfig.execute();
    sendCachedJson(req, res, entry.value, entry.etag, cacheHit, 'public, max-age=60');
  });

  // Culqi Transactions Ledger (Cache-Aside 30s + invalidación en POST /charge)
  router.get('/api/payments/culqi/transactions', (req, res) => {
    const { entry, cacheHit } = deps.listCulqiTransactions.execute();
    sendCachedJson(req, res, entry.value, entry.etag, cacheHit, 'private, max-age=30');
  });

  // Culqi Charge Execution
  router.post('/api/payments/culqi/charge', async (req, res) => {
    const result = await deps.processCulqiCharge.execute(req.body || {});
    if (!result.ok) {
      res.status(result.statusCode).json({ ok: false, error: result.error });
      return;
    }
    res.json({ ok: true, transaction: result.transaction });
  });

  // Chat Conversations (Cache-Aside 15s + RBAC)
  router.get('/api/chat/conversations', (req, res) => {
    const { entry, cacheHit } = deps.listConversations.execute({
      role: String(req.query.role || 'USUARIO'),
      userId: String(req.query.userId || '').trim(),
      dni: String(req.query.dni || '').trim(),
      telefono: String(req.query.telefono || '')
    });
    sendCachedJson(req, res, entry.value, entry.etag, cacheHit, 'private, max-age=15');
  });

  // Ensure Conversation
  router.post('/api/chat/conversations/ensure', (req, res) => {
    const result = deps.ensureConversation.execute(req.body || {});
    if (!result.ok) {
      res.status(result.statusCode).json({ ok: false, error: result.error });
      return;
    }
    res.json({ ok: true, conversation: result.conversation });
  });

  // Send Message over HTTP + WS Broadcast
  router.post('/api/chat/messages', (req, res) => {
    const result = deps.sendChatMessage.execute(req.body || {});
    if (!result.ok) {
      res.status(result.statusCode).json({ ok: false, error: result.error });
      return;
    }
    res.json({ ok: true, message: result.message, conversation: result.conversation });
  });

  // Automatic Multichannel Dispatch (Chat + SMTP + WhatsApp)
  router.post('/api/notifications/dispatch-order', async (req, res) => {
    const result = await deps.dispatchOrder.execute(req.body || {});
    if (!result.ok) {
      res.status(result.statusCode).json({ ok: false, error: result.error });
      return;
    }
    res.json({
      ok: true,
      emailStatus: result.emailStatus,
      whatsappStatus: result.whatsappStatus,
      chatDelivered: result.chatDelivered,
      timestamp: result.timestamp
    });
  });

  return router;
}
