import { describe, expect, it } from '@jest/globals';
import {
  GetServiceByIdUseCase,
  ListApprovedServicesUseCase,
  QuoteEscrowUseCase
} from '../../server/application/catalogUseCases';
import { ProcessCulqiChargeUseCase } from '../../server/application/paymentUseCases';
import {
  canUserAccessConversation,
  isUnregisteredSender,
  normalizePhone,
  validateCulqiChargeBody,
  type CulqiTransactionRecord,
  type ServerConversation
} from '../../server/domain/entities';
import type {
  CulqiTransactionRepository,
  PaymentGateway
} from '../../server/domain/ports';
import { LruTtlCache } from '../../server/infrastructure/cache/lruTtlCache';

describe('Clean Architecture Backend — Reglas de Dominio y Casos de Uso (SOLID DIP)', () => {
  it('normaliza teléfonos peruanos e identifica remitentes anónimos/registrados', () => {
    expect(normalizePhone('+51 986-864-822')).toBe('986864822');
    expect(normalizePhone('986864822')).toBe('986864822');
    expect(normalizePhone('')).toBe('');

    expect(isUnregisteredSender('')).toBe(true);
    expect(isUnregisteredSender('GUEST')).toBe(true);
    expect(isUnregisteredSender('anon')).toBe(true);
    expect(isUnregisteredSender('USR-018')).toBe(false);
  });

  it('valida payload de cargo Culqi aplicando invariantes financieras', () => {
    expect(validateCulqiChargeBody({ email: 'a@b.pe', amountCentimos: 500 }).ok).toBe(false);
    expect(validateCulqiChargeBody({ tokenId: 'tkn_1', email: 'bad', amountCentimos: 500 }).ok).toBe(false);
    expect(validateCulqiChargeBody({ tokenId: 'tkn_1', email: 'a@b.pe', amountCentimos: 99 }).ok).toBe(false);

    const valid = validateCulqiChargeBody({
      tokenId: 'tkn_sandbox_ok',
      email: 'USER@GMAIL.COM',
      amountCentimos: 2490,
      method: 'YAPE_PLIN',
      concepto: 'ORDEN_CUSTODIA'
    });
    expect(valid.ok).toBe(true);
    if (valid.ok) {
      expect(valid.value.email).toBe('user@gmail.com');
      expect(valid.value.brand).toBe('Yape');
      expect(valid.value.concepto).toBe('ORDEN_CUSTODIA');
    }
  });

  it('evalúa control de acceso RBAC en conversaciones (ADMIN, GUEST y participante)', () => {
    const conv: ServerConversation = {
      id: 'ORD:1:986864822',
      servicioTitulo: 'Electricidad',
      clienteId: 'USR-018',
      clienteNombre: 'Cliente',
      clienteDni: '28401928',
      clienteTelefono: '999456789',
      trabajadorId: 'USR-002',
      trabajadorNombre: 'Técnico',
      trabajadorDni: '41829304',
      trabajadorTelefono: '986864822',
      updatedAt: Date.now(),
      messages: []
    };

    expect(canUserAccessConversation(conv, { role: 'ADMIN', userId: '', dni: '', telefono: '' })).toBe(true);
    expect(canUserAccessConversation(conv, { role: 'GUEST', userId: 'GUEST', dni: '', telefono: '' })).toBe(false);
    expect(canUserAccessConversation(conv, { role: 'USUARIO', userId: 'USR-018', dni: '', telefono: '' })).toBe(true);
    expect(canUserAccessConversation(conv, { role: 'USUARIO', userId: 'X', dni: '41829304', telefono: '' })).toBe(true);
    expect(canUserAccessConversation(conv, { role: 'USUARIO', userId: 'X', dni: '', telefono: '+51 999456789' })).toBe(true);
    expect(canUserAccessConversation(conv, { role: 'USUARIO', userId: 'USR-999', dni: '00000000', telefono: '900000000' })).toBe(false);
  });

  it('ProcessCulqiChargeUseCase opera desacoplado sobre puertos mock (DIP) e invalida caché', async () => {
    const saved: CulqiTransactionRecord[] = [];
    const mockRepo: CulqiTransactionRepository = {
      findAll: () => saved,
      save: tx => saved.push(tx)
    };
    const mockGateway: PaymentGateway = {
      getPublicConfig: () => ({
        configured: false,
        publicKey: null,
        mode: 'sandbox',
        currency: 'PEN',
        merchantName: 'TrabajaYa Perú'
      }),
      charge: async input => ({
        ok: true,
        transaction: {
          id: 'CLQ-MOCK-1',
          chargeId: 'chr_mock_1',
          tokenId: input.tokenId,
          authorizationCode: 'AUT-1',
          referenceCode: 'REF-1',
          amountCentimos: input.amountCentimos,
          amountSoles: input.amountCentimos / 100,
          currency: 'PEN',
          method: input.method,
          concepto: input.concepto,
          description: input.description,
          email: input.email,
          mode: 'sandbox',
          status: 'PAID',
          createdAt: '28/11/2026'
        }
      })
    };

    const cache = new LruTtlCache(20);
    cache.set('culqi:transactions', { ok: true, transactions: [] }, 30_000);

    const uc = new ProcessCulqiChargeUseCase(mockGateway, mockRepo, cache);
    const res = await uc.execute({
      tokenId: 'tkn_sandbox_dip',
      email: 'dip@gmail.com',
      amountCentimos: 1500,
      concepto: 'ANUNCIO'
    });

    expect(res.ok).toBe(true);
    expect(saved).toHaveLength(1);
    expect(cache.get('culqi:transactions')).toBeNull();
  });

  it('QuoteEscrowUseCase y ListApprovedServicesUseCase aplican reglas de dominio y caché', () => {
    const quoteUc = new QuoteEscrowUseCase();
    expect(quoteUc.execute({ precioBase: 10 }).ok).toBe(false);
    expect(quoteUc.execute({ precioBase: 100, cantidadTurnos: 0 }).ok).toBe(false);

    const validQuote = quoteUc.execute({ precioBase: 100, cantidadTurnos: 2 });
    expect(validQuote.ok).toBe(true);
    if (validQuote.ok) {
      expect(validQuote.quote.garantiaUnitaria).toBe(10);
      expect(validQuote.quote.tarifaClienteUnitaria).toBe(110);
      expect(validQuote.quote.subtotalServicio).toBe(220);
      expect(validQuote.quote.igv18).toBe(39.6);
      expect(validQuote.quote.totalConIgv).toBe(259.6);
    }

    const cache = new LruTtlCache(50);
    const listUc = new ListApprovedServicesUseCase(cache);
    const first = listUc.execute({ oficio: 'GASFITERIA' });
    expect(first.cacheHit).toBe(false);
    expect(first.entry.value.total).toBeGreaterThanOrEqual(1);
    expect(first.entry.value.services.every(s => s.estadoPublicacion === 'APROBADO')).toBe(true);

    const second = listUc.execute({ oficio: 'GASFITERIA' });
    expect(second.cacheHit).toBe(true);

    const byIdUc = new GetServiceByIdUseCase(cache);
    const sampleId = first.entry.value.services[0].id;
    expect(byIdUc.execute(sampleId).entry?.value.service.id).toBe(sampleId);
    expect(byIdUc.execute('SRV-NO-EXISTE').entry).toBeNull();
  });
});
