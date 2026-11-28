import {
  canUserAccessConversation,
  isUnregisteredSender,
  normalizePhone,
  type EnsureConversationInput,
  type ServerChatMessage,
  type ServerConversation
} from '../domain/entities';
import type {
  CacheEntry,
  CacheStore,
  ChatEventPublisher,
  ChatRepository
} from '../domain/ports';

/**
 * Capa de Aplicación — Casos de Uso de Chat Directo y RBAC (Clean Architecture Capa 2)
 */

export class ListConversationsUseCase {
  constructor(
    private readonly chatRepo: ChatRepository,
    private readonly cache: CacheStore
  ) {}

  execute(query: { role: string; userId: string; dni: string; telefono: string }): {
    entry: CacheEntry<{ conversations: ServerConversation[] }>;
    cacheHit: boolean;
  } {
    const normalizedTel = normalizePhone(query.telefono);
    const cacheKey = `chat:conv:${query.role}:${query.userId}:${query.dni}:${normalizedTel}`;
    let entry = this.cache.get<{ conversations: ServerConversation[] }>(cacheKey);
    const cacheHit = Boolean(entry);

    if (!entry) {
      const all = this.chatRepo.getAll();
      const filtered =
        query.role === 'ADMIN'
          ? all
          : query.role === 'GUEST' || !query.userId || query.userId === 'GUEST'
            ? []
            : all.filter(c =>
                canUserAccessConversation(c, {
                  role: query.role,
                  userId: query.userId,
                  dni: query.dni,
                  telefono: normalizedTel
                })
              );

      entry = this.cache.set(cacheKey, { conversations: filtered }, 15_000);
    }

    return { entry, cacheHit };
  }
}

export class EnsureConversationUseCase {
  constructor(
    private readonly chatRepo: ChatRepository,
    private readonly cache: CacheStore,
    private readonly publisher: ChatEventPublisher
  ) {}

  execute(
    input: Partial<EnsureConversationInput>
  ): { ok: true; conversation: ServerConversation } | { ok: false; statusCode: 400; error: string } {
    if (!input.conversationId) {
      return { ok: false, statusCode: 400, error: 'conversationId requerido' };
    }

    const conv = this.chatRepo.upsertConversation(input as EnsureConversationInput);
    this.cache.invalidateByPrefix('chat:conv:');
    this.publisher.broadcast({ type: 'chat:conversation', conversation: conv });
    return { ok: true, conversation: conv };
  }
}

export class SendChatMessageUseCase {
  constructor(
    private readonly chatRepo: ChatRepository,
    private readonly cache: CacheStore,
    private readonly publisher: ChatEventPublisher
  ) {}

  execute(
    body: Record<string, unknown>,
    options?: { allowUnregistered?: boolean }
  ):
    | {
        ok: true;
        statusCode: 200;
        message: ServerChatMessage;
        conversation: ServerConversation;
        isDuplicate: boolean;
      }
    | { ok: false; statusCode: 400 | 401 | 404; error: string } {
    const conversationId = String(body.conversationId || '').trim();
    const text = String(body.text || '');
    if (!conversationId || !text) {
      return { ok: false, statusCode: 400, error: 'conversationId y text requeridos' };
    }

    const rawSenderId = String(body.senderId || '').trim();
    const unregistered = isUnregisteredSender(rawSenderId);
    const senderRole: 'cliente' | 'trabajador' | 'sistema' =
      body.senderRole === 'trabajador' || body.senderRole === 'sistema'
        ? body.senderRole
        : 'cliente';

    if (!options?.allowUnregistered && unregistered && senderRole !== 'sistema') {
      return {
        ok: false,
        statusCode: 401,
        error: 'Debes registrarte o iniciar sesión para enviar mensajes en el chat.'
      };
    }

    const result = this.chatRepo.appendMessage({
      conversationId,
      messageId: body.messageId ? String(body.messageId) : undefined,
      senderId: rawSenderId || 'GUEST',
      senderName: unregistered
        ? 'Anónimo (No registrado)'
        : String(body.senderName || 'Usuario Registrado'),
      senderRole,
      text
    });

    if (!result) {
      return { ok: false, statusCode: 404, error: 'Conversación no encontrada o mensaje vacío' };
    }

    if (!result.isDuplicate) {
      this.cache.invalidateByPrefix('chat:conv:');
      this.publisher.broadcast({
        type: 'chat:message',
        conversationId: result.conversation.id,
        message: result.message,
        conversation: result.conversation
      });
    }

    return {
      ok: true,
      statusCode: 200,
      message: result.message,
      conversation: result.conversation,
      isDuplicate: result.isDuplicate
    };
  }
}
