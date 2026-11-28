import type {
  AppendMessageInput,
  ChannelDispatchStatus,
  CulqiChargeInput,
  CulqiConfig,
  CulqiTransactionRecord,
  DispatchLogEntry,
  EnsureConversationInput,
  ServerChatMessage,
  ServerConversation
} from './entities';

/**
 * Puertos de Dominio (Clean Architecture + SOLID DIP / ISP)
 * Las capas de Aplicación dependen exclusivamente de estas interfaces y nunca de detalles concretos.
 */

export interface CacheStats {
  size: number;
  maxEntries: number;
  hits: number;
  misses: number;
  sets: number;
  invalidations: number;
  evictions: number;
  hitRatio: number;
}

export interface CacheEntry<T> {
  value: T;
  etag: string;
  expiresAt: number;
}

export interface CacheStore {
  get<T>(key: string): CacheEntry<T> | null;
  set<T>(key: string, value: T, ttlMs: number): CacheEntry<T>;
  del(key: string): boolean;
  invalidateByPrefix(prefix: string): number;
  clear(): void;
  stats(): CacheStats;
}

export interface ChatRepository {
  getAll(): ServerConversation[];
  count(): number;
  upsertConversation(input: EnsureConversationInput): ServerConversation;
  appendMessage(
    input: AppendMessageInput
  ): { conversation: ServerConversation; message: ServerChatMessage; isDuplicate: boolean } | null;
}

export interface CulqiTransactionRepository {
  findAll(): CulqiTransactionRecord[];
  save(tx: CulqiTransactionRecord): void;
}

export interface DispatchLogRepository {
  append(entry: DispatchLogEntry): void;
}

export interface PaymentGatewayResult {
  ok: true;
  transaction: CulqiTransactionRecord;
}

export interface PaymentGatewayError {
  ok: false;
  statusCode: 400 | 502;
  error: string;
}

export interface PaymentGateway {
  getPublicConfig(): CulqiConfig;
  charge(input: CulqiChargeInput): Promise<PaymentGatewayResult | PaymentGatewayError>;
}

export interface NotificationDispatcher {
  sendEmail(params: {
    ordenId: string;
    emails: string[];
    subject?: string;
    body?: string;
  }): Promise<ChannelDispatchStatus>;
  sendWhatsApp(params: {
    ordenId: string;
    phones: string[];
    message?: string;
  }): Promise<ChannelDispatchStatus>;
}

export interface ChatEventPublisher {
  broadcast(event: unknown): void;
}
