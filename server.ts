import path from 'path';
import http from 'http';
import express from 'express';
import dotenv from 'dotenv';
import {
  GetServiceByIdUseCase,
  ListApprovedServicesUseCase,
  QuoteEscrowUseCase
} from './server/application/catalogUseCases';
import {
  EnsureConversationUseCase,
  ListConversationsUseCase,
  SendChatMessageUseCase
} from './server/application/chatUseCases';
import { DispatchOrderNotificationsUseCase } from './server/application/dispatchUseCases';
import {
  GetCulqiConfigUseCase,
  ListCulqiTransactionsUseCase,
  ProcessCulqiChargeUseCase
} from './server/application/paymentUseCases';
import { LruTtlCache } from './server/infrastructure/cache/lruTtlCache';
import { CulqiPaymentGateway } from './server/infrastructure/gateways/culqiGateway';
import { MultiChannelNotificationDispatcher } from './server/infrastructure/gateways/notificationDispatcher';
import {
  JsonChatRepository,
  JsonCulqiTransactionRepository,
  JsonDispatchLogRepository
} from './server/infrastructure/persistence/jsonRepositories';
import { createSecurityAndRateLimitMiddleware } from './server/presentation/middleware/securityAndRateLimit';
import { createApiRouter } from './server/presentation/routes/apiRoutes';
import { ChatSocketServer } from './server/presentation/ws/chatSocketServer';

export type {
  CulqiTransactionRecord,
  ServerChatMessage,
  ServerConversation
} from './server/domain/entities';

dotenv.config();

const PORT = Number(process.env.PORT || 3000);

/**
 * Composition Root (Patrón Factory + Inyección de Dependencias — Clean Architecture)
 * Ensambla las capas Dominio <- Aplicación <- Infraestructura <- Presentación.
 */
export async function createAppServer(options?: {
  dataDir?: string;
  attachFrontend?: boolean;
}) {
  const activeDataDir = path.resolve(
    options?.dataDir || process.env.CONECTA_DATA_DIR || path.join(process.cwd(), '.data')
  );

  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '2mb' }));

  app.use(
    createSecurityAndRateLimitMiddleware({
      instanceId: process.env.INSTANCE_ID || 'trabajaya-node-1',
      rateLimitMax: Number(process.env.RATE_LIMIT_MAX_REQ ?? 600),
      rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 60_000)
    })
  );

  // Capa 3 — Infraestructura (Adaptadores concretos implementando puertos de Dominio)
  const cache = new LruTtlCache(Number(process.env.CACHE_MAX_ENTRIES || 500));
  const chatRepo = new JsonChatRepository(activeDataDir);
  const culqiTxRepo = new JsonCulqiTransactionRepository(activeDataDir);
  const dispatchLogRepo = new JsonDispatchLogRepository(activeDataDir);
  const paymentGateway = new CulqiPaymentGateway();
  const notificationDispatcher = new MultiChannelNotificationDispatcher();

  // Capa 4 — Transporte HTTP + WebSocket (/ws/chat)
  const server = http.createServer(app);
  let sendChatMessageUseCase!: SendChatMessageUseCase;
  const chatSocket = new ChatSocketServer(server, () => sendChatMessageUseCase);

  // Capa 2 — Aplicación (Casos de Uso desacoplados)
  sendChatMessageUseCase = new SendChatMessageUseCase(chatRepo, cache, chatSocket);
  const apiRouter = createApiRouter({
    cache,
    chatRepo,
    getCulqiConfig: new GetCulqiConfigUseCase(paymentGateway, cache),
    listCulqiTransactions: new ListCulqiTransactionsUseCase(culqiTxRepo, cache),
    processCulqiCharge: new ProcessCulqiChargeUseCase(paymentGateway, culqiTxRepo, cache),
    listConversations: new ListConversationsUseCase(chatRepo, cache),
    ensureConversation: new EnsureConversationUseCase(chatRepo, cache, chatSocket),
    sendChatMessage: sendChatMessageUseCase,
    dispatchOrder: new DispatchOrderNotificationsUseCase(
      chatRepo,
      dispatchLogRepo,
      notificationDispatcher,
      cache,
      chatSocket
    ),
    listApprovedServices: new ListApprovedServicesUseCase(cache),
    getServiceById: new GetServiceByIdUseCase(cache),
    quoteEscrow: new QuoteEscrowUseCase()
  });

  app.use(apiRouter);

  if (options?.attachFrontend !== false) {
    if (process.env.NODE_ENV !== 'production') {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: {
          middlewareMode: true,
          hmr: process.env.DISABLE_HMR !== 'true'
        },
        appType: 'spa'
      });
      app.use(vite.middlewares);
    } else {
      const distDir = path.resolve(process.cwd(), 'dist');
      app.use(
        '/assets',
        express.static(path.join(distDir, 'assets'), {
          maxAge: '365d',
          immutable: true
        })
      );
      app.use(
        express.static(distDir, {
          maxAge: '1h',
          setHeaders: (res, filePath) => {
            if (filePath.endsWith('index.html')) {
              res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            }
          }
        })
      );
      app.get('*', (_req, res) => {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.sendFile(path.join(distDir, 'index.html'));
      });
    }
  }

  return { app, server, wss: chatSocket.wss };
}

async function startServer() {
  const { server, wss } = await createAppServer({ attachFrontend: true });
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`TrabajaYa Perú listo en:      http://localhost:${PORT}`);
    console.log(`Swagger UI (OpenAPI 3.0.3):   http://localhost:${PORT}/api-docs`);
    console.log(`Especificación OpenAPI JSON:  http://localhost:${PORT}/api/openapi.json`);
  });

  const gracefulShutdown = (signal: string) => {
    console.log(`[${signal}] Cerrando servidor TrabajaYa Perú ordenadamente...`);
    wss.clients.forEach(client => client.close(1001, 'Server shutting down'));
    wss.close(() => {
      server.close(() => process.exit(0));
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

if (
  process.env.JEST_WORKER_ID === undefined &&
  process.env.VITEST !== 'true' &&
  process.env.NODE_ENV !== 'test'
) {
  startServer().catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}
