import fs from 'fs';
import path from 'path';
import http from 'http';
import express from 'express';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import { WebSocketServer, WebSocket } from 'ws';
import { LruTtlCache } from './server/cache';

dotenv.config();

const PORT = Number(process.env.PORT || 3000);
let activeDataDir = path.resolve(process.env.CONECTA_DATA_DIR || path.join(process.cwd(), '.data'));
const getChatStorePath = () => path.join(activeDataDir, 'chat-store.json');
const getDispatchLogPath = () => path.join(activeDataDir, 'dispatch-log.json');
const getCulqiTxPath = () => path.join(activeDataDir, 'culqi-transactions.json');

export interface CulqiTransactionRecord {
  id: string;
  chargeId: string;
  tokenId: string;
  authorizationCode: string;
  referenceCode: string;
  amountCentimos: number;
  amountSoles: number;
  currency: 'PEN';
  method: 'TARJETA' | 'YAPE_PLIN';
  concepto: 'IMPREVISTO' | 'ANUNCIO' | 'ORDEN_CUSTODIA';
  referenceId?: string;
  description: string;
  email: string;
  customerName?: string;
  brand?: string;
  last4?: string;
  mode: 'live' | 'test' | 'sandbox';
  status: 'PAID' | 'FAILED';
  createdAt: string;
}

export interface ServerChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: 'cliente' | 'trabajador' | 'sistema';
  text: string;
  timestamp: string;
  createdAt: number;
}

export interface ServerConversation {
  id: string;
  ordenId?: string;
  imprevistoId?: string;
  servicioTitulo: string;
  clienteId?: string;
  clienteNombre: string;
  clienteDni?: string;
  clienteTelefono?: string;
  trabajadorId?: string;
  trabajadorNombre: string;
  trabajadorDni?: string;
  trabajadorTelefono: string;
  trabajadorAvatar?: string;
  trabajadorInstitucion?: string;
  updatedAt: number;
  messages: ServerChatMessage[];
}

interface DispatchLogEntry {
  id: string;
  ordenId: string;
  timestamp: string;
  emailStatus: { sent: boolean; queued: boolean; to: string[]; detail: string };
  whatsappStatus: { sent: boolean; queued: boolean; to: string[]; detail: string };
  chatDelivered: boolean;
}

function ensureDataDir() {
  if (!fs.existsSync(activeDataDir)) {
    fs.mkdirSync(activeDataDir, { recursive: true });
  }
}

function loadConversations(): ServerConversation[] {
  ensureDataDir();
  try {
    const chatPath = getChatStorePath();
    if (fs.existsSync(chatPath)) {
      const raw = fs.readFileSync(chatPath, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.error('Error reading chat store:', err);
  }
  return [];
}

function saveConversations(conversations: ServerConversation[]) {
  ensureDataDir();
  try {
    fs.writeFileSync(getChatStorePath(), JSON.stringify(conversations, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving chat store:', err);
  }
}

function appendDispatchLog(entry: DispatchLogEntry) {
  ensureDataDir();
  try {
    const logPath = getDispatchLogPath();
    let logs: DispatchLogEntry[] = [];
    if (fs.existsSync(logPath)) {
      const raw = fs.readFileSync(logPath, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) logs = parsed;
    }
    logs.unshift(entry);
    fs.writeFileSync(logPath, JSON.stringify(logs.slice(0, 200), null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving dispatch log:', err);
  }
}

function loadCulqiTransactions(): CulqiTransactionRecord[] {
  ensureDataDir();
  try {
    const txPath = getCulqiTxPath();
    if (fs.existsSync(txPath)) {
      const raw = fs.readFileSync(txPath, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.error('Error reading culqi transactions:', err);
  }
  return [];
}

function appendCulqiTransaction(tx: CulqiTransactionRecord) {
  ensureDataDir();
  try {
    const all = loadCulqiTransactions();
    all.unshift(tx);
    fs.writeFileSync(getCulqiTxPath(), JSON.stringify(all.slice(0, 500), null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving culqi transaction:', err);
  }
}

let conversations: ServerConversation[] = loadConversations();

function formatPeruTime(): string {
  return new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
}

function normalizePhone(tel?: string): string {
  const digits = (tel || '').replace(/\D/g, '');
  if (!digits) return '';
  return digits.startsWith('51') && digits.length > 9 ? digits.slice(2) : digits;
}

function upsertConversation(payload: {
  conversationId: string;
  ordenId?: string;
  imprevistoId?: string;
  servicioTitulo?: string;
  clienteId?: string;
  clienteNombre?: string;
  clienteDni?: string;
  clienteTelefono?: string;
  trabajadorId?: string;
  trabajadorNombre?: string;
  trabajadorDni?: string;
  trabajadorTelefono?: string;
  trabajadorAvatar?: string;
  trabajadorInstitucion?: string;
  initialSystemText?: string;
}): ServerConversation {
  let existing = conversations.find(c => c.id === payload.conversationId);
  const now = Date.now();

  const isGuestClient = !payload.clienteId || payload.clienteId === 'GUEST';
  const resolvedClienteName = isGuestClient
    ? 'Anónimo (No registrado)'
    : payload.clienteNombre || 'Usuario Registrado';

  if (!existing) {
    existing = {
      id: payload.conversationId,
      ordenId: payload.ordenId,
      imprevistoId: payload.imprevistoId,
      servicioTitulo: payload.servicioTitulo || 'Consulta de Servicio',
      clienteId: isGuestClient ? 'GUEST' : payload.clienteId,
      clienteNombre: resolvedClienteName,
      clienteDni: isGuestClient ? undefined : payload.clienteDni,
      clienteTelefono: payload.clienteTelefono,
      trabajadorId: payload.trabajadorId,
      trabajadorNombre: payload.trabajadorNombre || 'Especialista',
      trabajadorDni: payload.trabajadorDni,
      trabajadorTelefono: payload.trabajadorTelefono || '',
      trabajadorAvatar: payload.trabajadorAvatar || '👨‍🔧',
      trabajadorInstitucion: payload.trabajadorInstitucion || 'SENATI',
      updatedAt: now,
      messages: []
    };

    if (payload.initialSystemText) {
      existing.messages.push({
        id: `sys-${now}`,
        conversationId: existing.id,
        senderId: 'sistema',
        senderName: 'TrabajaYa Perú',
        senderRole: 'sistema',
        text: payload.initialSystemText,
        timestamp: formatPeruTime(),
        createdAt: now
      });
    }

    conversations.unshift(existing);
  } else {
    existing.servicioTitulo = payload.servicioTitulo || existing.servicioTitulo;
    if (payload.clienteId && payload.clienteId !== 'GUEST' && !existing.clienteId) {
      existing.clienteId = payload.clienteId;
    }
    if (
      payload.clienteNombre &&
      payload.clienteId &&
      payload.clienteId !== 'GUEST' &&
      (existing.clienteNombre === 'Cliente' || existing.clienteNombre === 'Anónimo (No registrado)')
    ) {
      existing.clienteNombre = payload.clienteNombre;
    }
    if (payload.clienteDni && payload.clienteId !== 'GUEST' && !existing.clienteDni) {
      existing.clienteDni = payload.clienteDni;
    }
    if (payload.clienteTelefono && !existing.clienteTelefono) {
      existing.clienteTelefono = payload.clienteTelefono;
    }
    if (payload.trabajadorId && !existing.trabajadorId) existing.trabajadorId = payload.trabajadorId;
    if (payload.trabajadorNombre) existing.trabajadorNombre = payload.trabajadorNombre;
    if (payload.trabajadorDni && !existing.trabajadorDni) existing.trabajadorDni = payload.trabajadorDni;
    if (payload.trabajadorTelefono) existing.trabajadorTelefono = payload.trabajadorTelefono;
    if (payload.trabajadorAvatar) existing.trabajadorAvatar = payload.trabajadorAvatar;
    if (payload.trabajadorInstitucion) existing.trabajadorInstitucion = payload.trabajadorInstitucion;
  }

  saveConversations(conversations);
  return existing;
}

function appendMessage(input: {
  conversationId: string;
  messageId?: string;
  senderId: string;
  senderName: string;
  senderRole: 'cliente' | 'trabajador' | 'sistema';
  text: string;
}): { conversation: ServerConversation; message: ServerChatMessage; isDuplicate: boolean } | null {
  const conv = conversations.find(c => c.id === input.conversationId);
  if (!conv) return null;

  const trimmed = input.text.trim();
  if (!trimmed) return null;

  const msgId = input.messageId || `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const duplicate = conv.messages.find(m => m.id === msgId);
  if (duplicate) {
    return { conversation: conv, message: duplicate, isDuplicate: true };
  }

  const now = Date.now();
  const message: ServerChatMessage = {
    id: msgId,
    conversationId: conv.id,
    senderId: input.senderId,
    senderName: input.senderName,
    senderRole: input.senderRole,
    text: trimmed,
    timestamp: formatPeruTime(),
    createdAt: now
  };

  conv.messages.push(message);
  conv.updatedAt = now;
  conversations = [conv, ...conversations.filter(c => c.id !== conv.id)];
  saveConversations(conversations);

  return { conversation: conv, message, isDuplicate: false };
}

export async function createAppServer(options?: {
  dataDir?: string;
  attachFrontend?: boolean;
}) {
  if (options?.dataDir) {
    activeDataDir = path.resolve(options.dataDir);
    conversations = loadConversations();
  }

  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '2mb' }));

  const instanceId = process.env.INSTANCE_ID || 'trabajaya-node-1';
  const rateLimitMax = Number(process.env.RATE_LIMIT_MAX_REQ || 600);
  const rateLimitWindowMs = Number(process.env.RATE_LIMIT_WINDOW_MS || 60_000);
  const rateLimitCounters = new Map<string, { count: number; resetAt: number }>();

  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('X-Instance-Id', instanceId);

    if (req.path.startsWith('/api/') && req.path !== '/api/health' && rateLimitMax > 0) {
      const key = req.ip || req.socket.remoteAddress || 'unknown';
      const now = Date.now();
      const entry = rateLimitCounters.get(key);
      if (!entry || entry.resetAt <= now) {
        rateLimitCounters.set(key, { count: 1, resetAt: now + rateLimitWindowMs });
        res.setHeader('X-RateLimit-Limit', String(rateLimitMax));
        res.setHeader('X-RateLimit-Remaining', String(Math.max(0, rateLimitMax - 1)));
      } else {
        entry.count += 1;
        res.setHeader('X-RateLimit-Limit', String(rateLimitMax));
        res.setHeader('X-RateLimit-Remaining', String(Math.max(0, rateLimitMax - entry.count)));
        if (entry.count > rateLimitMax) {
          res.status(429).json({
            ok: false,
            error: 'Demasiadas solicitudes desde esta IP. Intenta nuevamente en unos segundos.'
          });
          return;
        }
      }
    }
    next();
  });

  const cache = new LruTtlCache(Number(process.env.CACHE_MAX_ENTRIES || 500));
  const server = http.createServer(app);
  const wss = new WebSocketServer({ server, path: '/ws/chat' });

  const broadcast = (event: unknown) => {
    const raw = JSON.stringify(event);
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(raw);
      }
    });
  };

  wss.on('connection', ws => {
    ws.send(JSON.stringify({ type: 'chat:connected', timestamp: Date.now() }));

    ws.on('message', data => {
      try {
        const parsed = JSON.parse(data.toString());
        if (parsed?.type === 'chat:send' && parsed.conversationId && parsed.text) {
          const rawSenderId = String(parsed.senderId || '').trim();
          const isUnregistered = !rawSenderId || rawSenderId === 'GUEST' || rawSenderId === 'anon';
          const result = appendMessage({
            conversationId: String(parsed.conversationId),
            messageId: parsed.messageId ? String(parsed.messageId) : undefined,
            senderId: rawSenderId || 'GUEST',
            senderName: isUnregistered
              ? 'Anónimo (No registrado)'
              : String(parsed.senderName || 'Usuario Registrado'),
            senderRole:
              parsed.senderRole === 'trabajador' || parsed.senderRole === 'sistema'
                ? parsed.senderRole
                : 'cliente',
            text: String(parsed.text)
          });
          if (result && !result.isDuplicate) {
            cache.invalidateByPrefix('chat:conv:');
            broadcast({
              type: 'chat:message',
              conversationId: result.conversation.id,
              message: result.message,
              conversation: result.conversation
            });
          }
        }
      } catch (err) {
        console.error('Invalid WS message:', err);
      }
    });
  });

  // Healthcheck
  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, conversations: conversations.length });
  });

  // Cache Observability Metrics (Paso 11 — LRU/TTL + Redis-ready Port)
  app.get('/api/cache/stats', (_req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.json({
      ok: true,
      backend: process.env.REDIS_URL ? 'redis-adapter-ready' : 'lru-memory',
      stats: cache.stats()
    });
  });

  // Culqi Gateway Configuration (Cache-Aside 60s + ETag / 304 Not Modified)
  app.get('/api/payments/culqi/config', (req, res) => {
    const cacheKey = 'culqi:config';
    let entry = cache.get<{
      configured: boolean;
      publicKey: string | null;
      mode: 'live' | 'test' | 'sandbox';
      currency: 'PEN';
      merchantName: string;
    }>(cacheKey);
    const isHit = Boolean(entry);

    if (!entry) {
      const publicKey = process.env.CULQI_PUBLIC_KEY?.trim() || null;
      const secretKey = process.env.CULQI_SECRET_KEY?.trim() || null;
      const configured = Boolean(publicKey && secretKey);
      const mode: 'live' | 'test' | 'sandbox' = configured
        ? publicKey!.startsWith('pk_live_')
          ? 'live'
          : 'test'
        : 'sandbox';
      entry = cache.set(
        cacheKey,
        {
          configured,
          publicKey,
          mode,
          currency: 'PEN' as const,
          merchantName: 'TrabajaYa Perú'
        },
        60_000
      );
    }

    res.setHeader('X-Cache', isHit ? 'HIT' : 'MISS');
    res.setHeader('Cache-Control', 'public, max-age=60');
    res.setHeader('ETag', entry.etag);
    if (req.headers['if-none-match'] === entry.etag) {
      res.status(304).end();
      return;
    }
    res.json(entry.value);
  });

  // Culqi Transactions Ledger (Cache-Aside 30s + invalidación en POST /charge)
  app.get('/api/payments/culqi/transactions', (req, res) => {
    const cacheKey = 'culqi:transactions';
    let entry = cache.get<{ ok: true; transactions: CulqiTransactionRecord[] }>(cacheKey);
    const isHit = Boolean(entry);

    if (!entry) {
      entry = cache.set(cacheKey, { ok: true, transactions: loadCulqiTransactions() }, 30_000);
    }

    res.setHeader('X-Cache', isHit ? 'HIT' : 'MISS');
    res.setHeader('Cache-Control', 'private, max-age=30');
    res.setHeader('ETag', entry.etag);
    if (req.headers['if-none-match'] === entry.etag) {
      res.status(304).end();
      return;
    }
    res.json(entry.value);
  });

  // Culqi Charge Execution (Real Culqi v2 API when keys configured + Sandbox mode fallback)
  app.post('/api/payments/culqi/charge', async (req, res) => {
    const body = req.body || {};
    const tokenId = String(body.tokenId || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const amountCentimos = Math.round(Number(body.amountCentimos || 0));
    const description = String(body.description || 'Pago TrabajaYa Perú').slice(0, 80);
    const method: 'TARJETA' | 'YAPE_PLIN' = body.method === 'YAPE_PLIN' ? 'YAPE_PLIN' : 'TARJETA';
    const concepto: 'IMPREVISTO' | 'ANUNCIO' | 'ORDEN_CUSTODIA' =
      body.concepto === 'IMPREVISTO' || body.concepto === 'ORDEN_CUSTODIA'
        ? body.concepto
        : 'ANUNCIO';
    const referenceId = body.referenceId ? String(body.referenceId) : undefined;
    const customerName = body.customerName ? String(body.customerName) : undefined;
    const brand = body.brand ? String(body.brand) : method === 'YAPE_PLIN' ? 'Yape' : 'Tarjeta';
    const last4 = body.last4 ? String(body.last4).slice(-4) : undefined;

    if (!tokenId) {
      res.status(400).json({ ok: false, error: 'Token Culqi requerido para procesar el cargo.' });
      return;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      res.status(400).json({ ok: false, error: 'Ingresa un correo electrónico válido para el comprobante Culqi.' });
      return;
    }
    if (!Number.isFinite(amountCentimos) || amountCentimos < 100) {
      res.status(400).json({ ok: false, error: 'El monto mínimo de cobro en Culqi es S/ 1.00 (100 céntimos).' });
      return;
    }

    const secretKey = process.env.CULQI_SECRET_KEY?.trim() || '';
    const publicKey = process.env.CULQI_PUBLIC_KEY?.trim() || '';
    const isRealCulqiToken = Boolean(secretKey) && !tokenId.startsWith('tkn_sandbox_');
    const createdAt = new Date().toLocaleString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    if (isRealCulqiToken) {
      try {
        const culqiRes = await fetch('https://api.culqi.com/v2/charges', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${secretKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            amount: amountCentimos,
            currency_code: 'PEN',
            email,
            source_id: tokenId,
            description,
            capture: true,
            metadata: {
              plataforma: 'TrabajaYa Peru',
              concepto,
              metodo: method,
              referencia: referenceId || 'N/A'
            }
          })
        });

        const culqiData: any = await culqiRes.json().catch(() => ({}));
        if (!culqiRes.ok) {
          res.status(400).json({
            ok: false,
            error:
              culqiData?.user_message ||
              culqiData?.merchant_message ||
              'Culqi rechazó la operación. Verifica los datos de tu tarjeta o Yape.'
          });
          return;
        }

        const realMode: 'live' | 'test' = publicKey.startsWith('pk_live_') ? 'live' : 'test';
        const tx: CulqiTransactionRecord = {
          id: `CLQ-${Date.now()}`,
          chargeId: String(culqiData.id || `chr_${Date.now()}`),
          tokenId,
          authorizationCode: String(
            culqiData.authorization_code ||
              culqiData.reference_code ||
              `CLQ-${Math.floor(100000 + Math.random() * 900000)}`
          ),
          referenceCode: String(culqiData.reference_code || `REF-${Date.now().toString().slice(-6)}`),
          amountCentimos,
          amountSoles: Number((amountCentimos / 100).toFixed(2)),
          currency: 'PEN',
          method,
          concepto,
          referenceId,
          description,
          email,
          customerName,
          brand: String(culqiData?.source?.iin?.card_brand || brand),
          last4: culqiData?.source?.card_number ? String(culqiData.source.card_number).slice(-4) : last4,
          mode: realMode,
          status: 'PAID',
          createdAt
        };
        appendCulqiTransaction(tx);
        cache.del('culqi:transactions');
        res.json({ ok: true, transaction: tx });
        return;
      } catch (err: any) {
        res.status(502).json({
          ok: false,
          error: `Error de conexión con Culqi API: ${err?.message || 'intenta nuevamente.'}`
        });
        return;
      }
    }

    // Culqi Sandbox Mode (when CULQI_PUBLIC_KEY / CULQI_SECRET_KEY are not yet configured in server .env)
    const rand6 = Math.floor(100000 + Math.random() * 900000);
    const rand8 = Math.random().toString(36).slice(2, 10);
    const tx: CulqiTransactionRecord = {
      id: `CLQ-${Date.now()}`,
      chargeId: `chr_test_clq_${rand8}`,
      tokenId,
      authorizationCode: `AUT-CLQ-${rand6}`,
      referenceCode: `REF-CLQ-${rand6}`,
      amountCentimos,
      amountSoles: Number((amountCentimos / 100).toFixed(2)),
      currency: 'PEN',
      method,
      concepto,
      referenceId,
      description,
      email,
      customerName,
      brand,
      last4,
      mode: 'sandbox',
      status: 'PAID',
      createdAt
    };
    appendCulqiTransaction(tx);
    cache.del('culqi:transactions');
    res.json({ ok: true, transaction: tx });
  });

  // List conversations visible for a user (or all for ADMIN) — Cache-Aside 15s
  app.get('/api/chat/conversations', (req, res) => {
    const role = String(req.query.role || 'USUARIO');
    const userId = String(req.query.userId || '').trim();
    const dni = String(req.query.dni || '').trim();
    const telefono = normalizePhone(String(req.query.telefono || ''));

    const cacheKey = `chat:conv:${role}:${userId}:${dni}:${telefono}`;
    let entry = cache.get<{ conversations: ServerConversation[] }>(cacheKey);
    const isHit = Boolean(entry);

    if (!entry) {
      let resultList: ServerConversation[];
      if (role === 'ADMIN') {
        resultList = conversations;
      } else if (role === 'GUEST' || !userId || userId === 'GUEST') {
        resultList = [];
      } else {
        resultList = conversations.filter(c => {
          const matchCliente =
            (userId && c.clienteId === userId) ||
            (dni && c.clienteDni === dni) ||
            (telefono && normalizePhone(c.clienteTelefono) === telefono);
          const matchTrabajador =
            (userId && c.trabajadorId === userId) ||
            (dni && c.trabajadorDni === dni) ||
            (telefono && normalizePhone(c.trabajadorTelefono) === telefono);
          return matchCliente || matchTrabajador;
        });
      }
      entry = cache.set(cacheKey, { conversations: resultList }, 15_000);
    }

    res.setHeader('X-Cache', isHit ? 'HIT' : 'MISS');
    res.setHeader('Cache-Control', 'private, max-age=15');
    res.setHeader('ETag', entry.etag);
    if (req.headers['if-none-match'] === entry.etag) {
      res.status(304).end();
      return;
    }
    res.json(entry.value);
  });

  // Ensure a conversation exists
  app.post('/api/chat/conversations/ensure', (req, res) => {
    const body = req.body || {};
    if (!body.conversationId) {
      res.status(400).json({ ok: false, error: 'conversationId requerido' });
      return;
    }
    const conv = upsertConversation(body);
    cache.invalidateByPrefix('chat:conv:');
    broadcast({ type: 'chat:conversation', conversation: conv });
    res.json({ ok: true, conversation: conv });
  });

  // Send message over HTTP + broadcast via WebSocket
  app.post('/api/chat/messages', (req, res) => {
    const body = req.body || {};
    if (!body.conversationId || !body.text) {
      res.status(400).json({ ok: false, error: 'conversationId y text requeridos' });
      return;
    }

    const rawSenderId = String(body.senderId || '').trim();
    const isUnregistered = !rawSenderId || rawSenderId === 'GUEST' || rawSenderId === 'anon';
    if (isUnregistered && body.senderRole !== 'sistema') {
      res.status(401).json({
        ok: false,
        error: 'Debes registrarte o iniciar sesión para enviar mensajes en el chat.'
      });
      return;
    }

    const result = appendMessage({
      conversationId: String(body.conversationId),
      messageId: body.messageId ? String(body.messageId) : undefined,
      senderId: rawSenderId || 'GUEST',
      senderName: isUnregistered
        ? 'Anónimo (No registrado)'
        : String(body.senderName || 'Usuario Registrado'),
      senderRole:
        body.senderRole === 'trabajador' || body.senderRole === 'sistema'
          ? body.senderRole
          : 'cliente',
      text: String(body.text)
    });

    if (!result) {
      res.status(404).json({ ok: false, error: 'Conversación no encontrada o mensaje vacío' });
      return;
    }

    if (!result.isDuplicate) {
      cache.invalidateByPrefix('chat:conv:');
      broadcast({
        type: 'chat:message',
        conversationId: result.conversation.id,
        message: result.message,
        conversation: result.conversation
      });
    }

    res.json({ ok: true, message: result.message, conversation: result.conversation });
  });

  // Automatic dispatch for Order notifications (Email + WhatsApp + In-App Chat)
  app.post('/api/notifications/dispatch-order', async (req, res) => {
    const {
      ordenId,
      servicioTitulo,
      clienteId,
      clienteNombre,
      clienteDni,
      clienteTelefono,
      workers,
      whatsappMessage,
      emailSubject,
      emailBody
    } = req.body || {};

    if (!ordenId || !Array.isArray(workers) || workers.length === 0) {
      res.status(400).json({ ok: false, error: 'Datos de orden y trabajadores requeridos.' });
      return;
    }

    const emails = workers.map((w: any) => String(w.email || '').trim()).filter(Boolean);
    const phones = workers.map((w: any) => String(w.telefono || '').trim()).filter(Boolean);

    // 1. Automatic In-App Direct Chat delivery (always real & instant)
    for (const w of workers) {
      const convId = `ORD:${ordenId}:${normalizePhone(w.telefono) || w.nombre || 'trabajador'}`;
      const isAnonOrder = !clienteId || clienteId === 'GUEST';
      const resolvedClientName = isAnonOrder
        ? 'Anónimo (No registrado)'
        : clienteNombre || 'Usuario Registrado';
      const conv = upsertConversation({
        conversationId: convId,
        ordenId,
        servicioTitulo: w.titulo || servicioTitulo || `Orden ${ordenId}`,
        clienteId: isAnonOrder ? 'GUEST' : clienteId,
        clienteNombre: resolvedClientName,
        clienteDni: isAnonOrder ? undefined : clienteDni,
        clienteTelefono,
        trabajadorId: w.usuarioId,
        trabajadorNombre: w.nombre,
        trabajadorDni: w.dni,
        trabajadorTelefono: w.telefono,
        trabajadorAvatar: w.avatar || '👨‍🔧',
        trabajadorInstitucion: w.institucion || 'SENATI',
        initialSystemText: `🔒 Chat Directo TrabajaYa · Pedido ${ordenId} enviado automáticamente sin cobros (S/ 0.00).`
      });

      if (whatsappMessage) {
        const msgResult = appendMessage({
          conversationId: conv.id,
          messageId: `auto-order-${ordenId}-${normalizePhone(w.telefono)}`,
          senderId: isAnonOrder ? 'GUEST' : clienteId,
          senderName: resolvedClientName,
          senderRole: 'cliente',
          text: String(whatsappMessage)
        });
        if (msgResult && !msgResult.isDuplicate) {
          broadcast({
            type: 'chat:message',
            conversationId: conv.id,
            message: msgResult.message,
            conversation: msgResult.conversation
          });
        }
      }
    }
    cache.invalidateByPrefix('chat:conv:');

    // 2. Automatic Email Dispatch via SMTP (Nodemailer) or Webhook
    let emailStatus = {
      sent: false,
      queued: true,
      to: emails,
      detail: 'En cola automática del servidor (configura SMTP_USER/SMTP_PASS o EMAIL_WEBHOOK_URL para envío externo directo).'
    };

    const smtpUser = process.env.SMTP_USER?.trim();
    const smtpPass = process.env.SMTP_PASS?.trim();
    const emailWebhookUrl = process.env.EMAIL_WEBHOOK_URL?.trim();

    if (emails.length > 0 && smtpUser && smtpPass) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: Number(process.env.SMTP_PORT || 587),
          secure: Number(process.env.SMTP_PORT || 587) === 465,
          auth: { user: smtpUser, pass: smtpPass }
        });
        await transporter.sendMail({
          from: process.env.SMTP_FROM || smtpUser,
          to: emails.join(', '),
          subject: String(emailSubject || `Nueva solicitud ${ordenId}`),
          text: String(emailBody || whatsappMessage || '')
        });
        emailStatus = {
          sent: true,
          queued: false,
          to: emails,
          detail: `Correo enviado automáticamente vía SMTP a ${emails.join(', ')}.`
        };
      } catch (err: any) {
        emailStatus = {
          sent: false,
          queued: true,
          to: emails,
          detail: `Error SMTP: ${err?.message || 'No se pudo conectar al servidor de correo.'}`
        };
      }
    } else if (emails.length > 0 && emailWebhookUrl) {
      try {
        const hookRes = await fetch(emailWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ to: emails, subject: emailSubject, text: emailBody, ordenId })
        });
        if (hookRes.ok) {
          emailStatus = {
            sent: true,
            queued: false,
            to: emails,
            detail: `Correo enviado automáticamente vía webhook a ${emails.join(', ')}.`
          };
        } else {
          emailStatus.detail = `Webhook de correo devolvió estado ${hookRes.status}.`;
        }
      } catch (err: any) {
        emailStatus.detail = `Error en webhook de correo: ${err?.message || 'fallo de red'}`;
      }
    }

    // 3. Automatic WhatsApp Dispatch via Meta WhatsApp Cloud API or Webhook
    let whatsappStatus = {
      sent: false,
      queued: true,
      to: phones,
      detail: 'En cola automática del servidor + entregado en Chat de la App (configura WHATSAPP_PHONE_NUMBER_ID y WHATSAPP_ACCESS_TOKEN para envío API externo).'
    };

    const waPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();
    const waToken = process.env.WHATSAPP_ACCESS_TOKEN?.trim();
    const waWebhookUrl = process.env.WHATSAPP_WEBHOOK_URL?.trim();

    if (phones.length > 0 && waPhoneId && waToken) {
      try {
        const results = await Promise.all(
          phones.map(async tel => {
            const digits = normalizePhone(tel);
            const fullNumber = digits.startsWith('51') ? digits : `51${digits}`;
            const resp = await fetch(`https://graph.facebook.com/v20.0/${waPhoneId}/messages`, {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${waToken}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                messaging_product: 'whatsapp',
                to: fullNumber,
                type: 'text',
                text: { body: String(whatsappMessage || '') }
              })
            });
            return resp.ok;
          })
        );
        if (results.every(Boolean)) {
          whatsappStatus = {
            sent: true,
            queued: false,
            to: phones,
            detail: `WhatsApp enviado automáticamente vía Cloud API a +51 ${phones.join(', +51 ')}.`
          };
        } else {
          whatsappStatus.detail = 'WhatsApp Cloud API rechazó uno o más destinatarios; el mensaje quedó entregado en el Chat de la App.';
        }
      } catch (err: any) {
        whatsappStatus.detail = `Error WhatsApp API: ${err?.message || 'fallo de red'}`;
      }
    } else if (phones.length > 0 && waWebhookUrl) {
      try {
        const hookRes = await fetch(waWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phones, message: whatsappMessage, ordenId })
        });
        if (hookRes.ok) {
          whatsappStatus = {
            sent: true,
            queued: false,
            to: phones,
            detail: `WhatsApp enviado automáticamente vía webhook a +51 ${phones.join(', +51 ')}.`
          };
        } else {
          whatsappStatus.detail = `Webhook WhatsApp devolvió estado ${hookRes.status}.`;
        }
      } catch (err: any) {
        whatsappStatus.detail = `Error webhook WhatsApp: ${err?.message || 'fallo de red'}`;
      }
    }

    const logEntry: DispatchLogEntry = {
      id: `DSP-${Date.now()}`,
      ordenId,
      timestamp: new Date().toLocaleString('es-PE'),
      emailStatus,
      whatsappStatus,
      chatDelivered: true
    };
    appendDispatchLog(logEntry);

    res.json({
      ok: true,
      emailStatus,
      whatsappStatus,
      chatDelivered: true,
      timestamp: logEntry.timestamp
    });
  });

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

  return { app, server, wss };
}

async function startServer() {
  const { server, wss } = await createAppServer({ attachFrontend: true });
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`TrabajaYa server listening on http://0.0.0.0:${PORT}`);
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

if (process.env.VITEST !== 'true' && process.env.NODE_ENV !== 'test') {
  startServer().catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}
