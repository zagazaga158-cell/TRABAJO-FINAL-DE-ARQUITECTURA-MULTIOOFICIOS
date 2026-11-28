import fs from 'fs';
import os from 'os';
import path from 'path';
import type http from 'http';
import request from 'supertest';
import { WebSocket, type WebSocketServer } from 'ws';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { createAppServer } from '../../server';

describe('Pruebas de Integración — Backend Express Clean Architecture + OpenAPI + WebSocket', () => {
  let tmpDataDir: string;
  let app: any;
  let server: http.Server;
  let wss: WebSocketServer;
  let baseUrl: string;
  let wsUrl: string;

  beforeAll(async () => {
    tmpDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'trabajaya-test-'));
    delete process.env.CULQI_PUBLIC_KEY;
    delete process.env.CULQI_SECRET_KEY;
    delete process.env.SMTP_USER;
    delete process.env.SMTP_PASS;
    delete process.env.WHATSAPP_PHONE_NUMBER_ID;
    delete process.env.WHATSAPP_ACCESS_TOKEN;
    process.env.RATE_LIMIT_MAX_REQ = '600';

    const instance = await createAppServer({ dataDir: tmpDataDir, attachFrontend: false });
    app = instance.app;
    server = instance.server;
    wss = instance.wss;

    await new Promise<void>(resolve => {
      server.listen(0, '127.0.0.1', () => resolve());
    });
    const addr = server.address();
    const port = typeof addr === 'object' && addr ? addr.port : 0;
    baseUrl = `http://127.0.0.1:${port}`;
    wsUrl = `ws://127.0.0.1:${port}/ws/chat`;
  });

  afterAll(async () => {
    wss.clients.forEach(c => c.terminate());
    await new Promise<void>(resolve => wss.close(() => resolve()));
    await new Promise<void>(resolve => server.close(() => resolve()));
    fs.rmSync(tmpDataDir, { recursive: true, force: true });
  });

  it('IT-01: GET /api/health responde 200 OK con arquitectura Clean Architecture', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(typeof res.body.conversations).toBe('number');
    expect(res.body.architecture).toContain('Clean Architecture');
  });

  it('IT-02: OpenAPI 3.0 (/api/openapi.json) y Swagger UI (/api-docs/) responden correctamente', async () => {
    const specRes = await request(app).get('/api/openapi.json');
    expect(specRes.status).toBe(200);
    expect(specRes.body.openapi).toBe('3.0.3');
    expect(specRes.body.paths['/api/health']).toBeDefined();
    expect(specRes.body.paths['/api/services']).toBeDefined();
    expect(specRes.body.paths['/api/escrow/quote']).toBeDefined();
    expect(specRes.body.paths['/api/payments/culqi/charge']).toBeDefined();
    expect(specRes.body.paths['/api/chat/messages']).toBeDefined();

    const uiRes = await request(app).get('/api-docs/');
    expect(uiRes.status).toBe(200);
    expect(uiRes.text).toContain('swagger-ui');
    expect(uiRes.text).toContain('TrabajaYa Perú — Swagger / OpenAPI 3.0');
  });

  it('IT-03: GET /api/services, GET /api/services/:id y POST /api/escrow/quote validan catálogo y Escrow', async () => {
    const listRes = await request(app).get('/api/services?oficio=GASFITERIA');
    expect(listRes.status).toBe(200);
    expect(listRes.headers['x-cache']).toBe('MISS');
    expect(listRes.body.ok).toBe(true);
    expect(listRes.body.total).toBeGreaterThanOrEqual(1);

    const listHit = await request(app).get('/api/services?oficio=GASFITERIA');
    expect(listHit.headers['x-cache']).toBe('HIT');

    const firstId = listRes.body.services[0].id;
    const itemRes = await request(app).get(`/api/services/${firstId}`);
    expect(itemRes.status).toBe(200);
    expect(itemRes.body.service.id).toBe(firstId);

    const missing = await request(app).get('/api/services/SRV-INEXISTENTE');
    expect(missing.status).toBe(404);

    const quoteOk = await request(app)
      .post('/api/escrow/quote')
      .send({ precioBase: 100, cantidadTurnos: 2 });
    expect(quoteOk.status).toBe(200);
    expect(quoteOk.body.quote.tarifaClienteUnitaria).toBe(110);
    expect(quoteOk.body.quote.totalConIgv).toBe(259.6);

    const quoteBad = await request(app).post('/api/escrow/quote').send({ precioBase: 5 });
    expect(quoteBad.status).toBe(400);
  });

  it('IT-04: GET /api/payments/culqi/config retorna modo sandbox y nunca expone secretKey', async () => {
    const res = await request(app).get('/api/payments/culqi/config');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      configured: false,
      publicKey: null,
      mode: 'sandbox',
      currency: 'PEN',
      merchantName: 'TrabajaYa Perú'
    });
    expect(res.body.secretKey).toBeUndefined();
  });

  it('IT-05: POST /api/payments/culqi/charge valida errores 400 (token, email y monto mínimo)', async () => {
    const sinToken = await request(app)
      .post('/api/payments/culqi/charge')
      .send({ email: 'cliente@gmail.com', amountCentimos: 500 });
    expect(sinToken.status).toBe(400);

    const emailInvalido = await request(app)
      .post('/api/payments/culqi/charge')
      .send({ tokenId: 'tkn_sandbox_1', email: 'mal-correo', amountCentimos: 500 });
    expect(emailInvalido.status).toBe(400);

    const montoBajo = await request(app)
      .post('/api/payments/culqi/charge')
      .send({ tokenId: 'tkn_sandbox_1', email: 'cliente@gmail.com', amountCentimos: 50 });
    expect(montoBajo.status).toBe(400);
  });

  it('IT-06: POST /api/payments/culqi/charge procesa cobro sandbox S/ 5.00 y persiste en ledger', async () => {
    const charge = await request(app)
      .post('/api/payments/culqi/charge')
      .send({
        tokenId: 'tkn_sandbox_imprevisto_01',
        email: 'cliente@gmail.com',
        amountCentimos: 500,
        description: 'Publicación de imprevisto urgente',
        method: 'YAPE_PLIN',
        concepto: 'IMPREVISTO',
        referenceId: 'IMP-TEST-01',
        customerName: 'Dr. Alejandro Palomino'
      });

    expect(charge.status).toBe(200);
    expect(charge.body.ok).toBe(true);
    expect(charge.body.transaction).toMatchObject({
      amountCentimos: 500,
      amountSoles: 5,
      currency: 'PEN',
      method: 'YAPE_PLIN',
      concepto: 'IMPREVISTO',
      mode: 'sandbox',
      status: 'PAID'
    });

    const ledger = await request(app).get('/api/payments/culqi/transactions');
    expect(ledger.status).toBe(200);
    expect(ledger.body.transactions.some((t: any) => t.id === charge.body.transaction.id)).toBe(true);
  });

  it('IT-07: POST /api/chat/conversations/ensure + /messages aplica RBAC 401 a GUEST e idempotencia', async () => {
    const convId = 'ORD:PED-TEST-001:986864822';
    const ensureRes = await request(app)
      .post('/api/chat/conversations/ensure')
      .send({
        conversationId: convId,
        ordenId: 'PED-TEST-001',
        servicioTitulo: 'Reparación Eléctrica',
        clienteId: 'USR-018',
        clienteNombre: 'Dr. Alejandro Palomino',
        clienteDni: '28401928',
        trabajadorId: 'USR-002',
        trabajadorNombre: 'Téc. Wilber Mendoza',
        trabajadorDni: '41829304',
        trabajadorTelefono: '986864822',
        initialSystemText: 'Chat iniciado'
      });
    expect(ensureRes.status).toBe(200);
    expect(ensureRes.body.conversation.messages).toHaveLength(1);

    const guestSend = await request(app)
      .post('/api/chat/messages')
      .send({
        conversationId: convId,
        senderId: 'GUEST',
        senderRole: 'cliente',
        text: 'Intento anónimo'
      });
    expect(guestSend.status).toBe(401);

    const msgPayload = {
      conversationId: convId,
      messageId: 'msg-idemp-12345',
      senderId: 'USR-018',
      senderName: 'Dr. Alejandro Palomino',
      senderRole: 'cliente',
      text: 'Confirmo llegada a las 10:00 hrs'
    };
    const first = await request(app).post('/api/chat/messages').send(msgPayload);
    expect(first.status).toBe(200);
    expect(first.body.conversation.messages).toHaveLength(2);

    const duplicate = await request(app).post('/api/chat/messages').send(msgPayload);
    expect(duplicate.status).toBe(200);
    expect(duplicate.body.conversation.messages).toHaveLength(2);
  });

  it('IT-08: GET /api/chat/conversations aísla hilos por rol (GUEST = [], USUARIO = propios, ADMIN = todos)', async () => {
    const guestRes = await request(app).get('/api/chat/conversations?role=GUEST');
    expect(guestRes.status).toBe(200);
    expect(guestRes.body.conversations).toEqual([]);

    const ajenoRes = await request(app).get('/api/chat/conversations?role=USUARIO&userId=USR-999');
    expect(ajenoRes.status).toBe(200);
    expect(ajenoRes.body.conversations).toEqual([]);

    const participanteRes = await request(app).get('/api/chat/conversations?role=USUARIO&userId=USR-018');
    expect(participanteRes.status).toBe(200);
    expect(participanteRes.body.conversations.length).toBeGreaterThanOrEqual(1);

    const adminRes = await request(app).get('/api/chat/conversations?role=ADMIN');
    expect(adminRes.status).toBe(200);
    expect(adminRes.body.conversations.length).toBeGreaterThanOrEqual(1);
  });

  it('IT-09: POST /api/notifications/dispatch-order despacha en Chat in-app, encola Email/WA y audita', async () => {
    const bad = await request(app).post('/api/notifications/dispatch-order').send({ ordenId: '' });
    expect(bad.status).toBe(400);

    const ok = await request(app)
      .post('/api/notifications/dispatch-order')
      .send({
        ordenId: 'PED-2026-7777',
        servicioTitulo: 'Instalación de Pozo a Tierra',
        clienteId: 'GUEST',
        clienteTelefono: '999888777',
        workers: [
          {
            usuarioId: 'USR-002',
            nombre: 'Téc. Wilber Mendoza',
            dni: '41829304',
            telefono: '986864822',
            email: 'wilber@gmail.com',
            titulo: 'Instalación de Pozo a Tierra'
          }
        ],
        whatsappMessage: 'Nueva solicitud PED-2026-7777',
        emailSubject: 'Orden PED-2026-7777',
        emailBody: 'Detalle de la orden'
      });

    expect(ok.status).toBe(200);
    expect(ok.body.ok).toBe(true);
    expect(ok.body.chatDelivered).toBe(true);
    expect(ok.body.emailStatus.queued).toBe(true);
    expect(ok.body.whatsappStatus.queued).toBe(true);

    const adminConvs = await request(app).get('/api/chat/conversations?role=ADMIN');
    const createdConv = adminConvs.body.conversations.find((c: any) => c.ordenId === 'PED-2026-7777');
    expect(createdConv).toBeDefined();
    expect(createdConv.clienteNombre).toBe('Anónimo (No registrado)');

    const dispatchLog = JSON.parse(
      fs.readFileSync(path.join(tmpDataDir, 'dispatch-log.json'), 'utf-8')
    );
    expect(dispatchLog.some((d: any) => d.ordenId === 'PED-2026-7777')).toBe(true);
  });

  it('IT-10: WebSocket /ws/chat emite chat:connected y entrega en vivo eventos chat:message', async () => {
    const receivedEvents: any[] = [];
    const ws = new WebSocket(wsUrl);

    await new Promise<void>((resolve, reject) => {
      ws.on('message', raw => {
        const evt = JSON.parse(raw.toString());
        receivedEvents.push(evt);
        if (evt.type === 'chat:connected') resolve();
      });
      ws.on('error', reject);
    });

    expect(receivedEvents[0].type).toBe('chat:connected');

    const broadcastPromise = new Promise<any>(resolve => {
      ws.on('message', raw => {
        const evt = JSON.parse(raw.toString());
        if (evt.type === 'chat:message' && evt.message?.id === 'msg-ws-live-01') {
          resolve(evt);
        }
      });
    });

    const resp = await fetch(`${baseUrl}/api/chat/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conversationId: 'ORD:PED-TEST-001:986864822',
        messageId: 'msg-ws-live-01',
        senderId: 'USR-002',
        senderName: 'Téc. Wilber Mendoza',
        senderRole: 'trabajador',
        text: 'En camino a tu domicilio'
      })
    });
    expect(resp.status).toBe(200);

    const liveEvent = await broadcastPromise;
    expect(liveEvent.message.text).toBe('En camino a tu domicilio');
    ws.close();
  });

  it('IT-11: Caché HTTP + ETag (304 Not Modified) + Invalidación automática + GET /api/cache/stats', async () => {
    const cfgHit = await request(app).get('/api/payments/culqi/config');
    expect(cfgHit.status).toBe(200);
    expect(cfgHit.headers['x-cache']).toBe('HIT');
    expect(cfgHit.headers['etag']).toBeDefined();

    const notMod = await request(app)
      .get('/api/payments/culqi/config')
      .set('If-None-Match', cfgHit.headers['etag']);
    expect(notMod.status).toBe(304);

    const txHit = await request(app).get('/api/payments/culqi/transactions');
    expect(txHit.headers['x-cache']).toBe('HIT');

    await request(app).post('/api/payments/culqi/charge').send({
      tokenId: 'tkn_sandbox_cache_inv',
      email: 'cache@gmail.com',
      amountCentimos: 1000,
      concepto: 'ANUNCIO',
      method: 'TARJETA'
    });

    const txAfterWrite = await request(app).get('/api/payments/culqi/transactions');
    expect(txAfterWrite.headers['x-cache']).toBe('MISS');
    expect(txAfterWrite.body.transactions.some((t: any) => t.tokenId === 'tkn_sandbox_cache_inv')).toBe(true);

    const statsRes = await request(app).get('/api/cache/stats');
    expect(statsRes.status).toBe(200);
    expect(statsRes.body.ok).toBe(true);
    expect(statsRes.body.stats.hits).toBeGreaterThan(0);
    expect(statsRes.body.stats.invalidations).toBeGreaterThan(0);
  });

  it('IT-12: Seguridad (EQ-04) — Rate Limiting L7 bloquea con HTTP 429 al exceder límite', async () => {
    const rlDir = fs.mkdtempSync(path.join(os.tmpdir(), 'trabajaya-rl-'));
    const prevLimit = process.env.RATE_LIMIT_MAX_REQ;
    process.env.RATE_LIMIT_MAX_REQ = '3';
    const rlInstance = await createAppServer({ dataDir: rlDir, attachFrontend: false });

    try {
      expect((await request(rlInstance.app).get('/api/payments/culqi/config')).status).toBe(200);
      expect((await request(rlInstance.app).get('/api/payments/culqi/config')).status).toBe(200);
      expect((await request(rlInstance.app).get('/api/payments/culqi/config')).status).toBe(200);

      const blocked = await request(rlInstance.app).get('/api/payments/culqi/config');
      expect(blocked.status).toBe(429);
      expect(blocked.body.ok).toBe(false);
    } finally {
      process.env.RATE_LIMIT_MAX_REQ = prevLimit;
      await new Promise<void>(resolve => rlInstance.wss.close(() => resolve()));
      fs.rmSync(rlDir, { recursive: true, force: true });
    }
  });
});
