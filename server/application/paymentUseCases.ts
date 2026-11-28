import {
  validateCulqiChargeBody,
  type CulqiConfig,
  type CulqiTransactionRecord
} from '../domain/entities';
import type {
  CacheEntry,
  CacheStore,
  CulqiTransactionRepository,
  PaymentGateway
} from '../domain/ports';

/**
 * Capa de Aplicación — Casos de Uso de Pagos Culqi (Clean Architecture Capa 2)
 * Depende únicamente de puertos de dominio (SOLID SRP + DIP).
 */

export class GetCulqiConfigUseCase {
  constructor(
    private readonly gateway: PaymentGateway,
    private readonly cache: CacheStore
  ) {}

  execute(): { entry: CacheEntry<CulqiConfig>; cacheHit: boolean } {
    const cacheKey = 'culqi:config';
    let entry = this.cache.get<CulqiConfig>(cacheKey);
    const cacheHit = Boolean(entry);

    if (!entry) {
      entry = this.cache.set(cacheKey, this.gateway.getPublicConfig(), 60_000);
    }

    return { entry, cacheHit };
  }
}

export class ListCulqiTransactionsUseCase {
  constructor(
    private readonly txRepo: CulqiTransactionRepository,
    private readonly cache: CacheStore
  ) {}

  execute(): {
    entry: CacheEntry<{ ok: true; transactions: CulqiTransactionRecord[] }>;
    cacheHit: boolean;
  } {
    const cacheKey = 'culqi:transactions';
    let entry = this.cache.get<{ ok: true; transactions: CulqiTransactionRecord[] }>(cacheKey);
    const cacheHit = Boolean(entry);

    if (!entry) {
      entry = this.cache.set(cacheKey, { ok: true, transactions: this.txRepo.findAll() }, 30_000);
    }

    return { entry, cacheHit };
  }
}

export class ProcessCulqiChargeUseCase {
  constructor(
    private readonly gateway: PaymentGateway,
    private readonly txRepo: CulqiTransactionRepository,
    private readonly cache: CacheStore
  ) {}

  async execute(
    rawBody: Record<string, unknown>
  ): Promise<
    | { ok: true; statusCode: 200; transaction: CulqiTransactionRecord }
    | { ok: false; statusCode: 400 | 502; error: string }
  > {
    const validated = validateCulqiChargeBody(rawBody);
    if (!validated.ok) {
      return { ok: false, statusCode: 400, error: validated.error };
    }

    const result = await this.gateway.charge(validated.value);
    if (!result.ok) {
      return result;
    }

    this.txRepo.save(result.transaction);
    this.cache.del('culqi:transactions');
    return { ok: true, statusCode: 200, transaction: result.transaction };
  }
}
