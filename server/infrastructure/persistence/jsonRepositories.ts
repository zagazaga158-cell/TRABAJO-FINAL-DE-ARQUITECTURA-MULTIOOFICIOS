import fs from 'fs';
import path from 'path';
import {
  formatPeruTime,
  type AppendMessageInput,
  type CulqiTransactionRecord,
  type DispatchLogEntry,
  type EnsureConversationInput,
  type ServerChatMessage,
  type ServerConversation
} from '../../domain/entities';
import type {
  ChatRepository,
  CulqiTransactionRepository,
  DispatchLogRepository
} from '../../domain/ports';

/**
 * Adaptadores de Persistencia en Archivo JSON (Clean Architecture — Capa 3 Infraestructura)
 * Implementan los puertos de repositorio; intercambiables por adaptadores PostgreSQL (database/01_schema.sql)
 * sin modificar la capa de Aplicación ni Dominio (SOLID OCP + LSP + DIP).
 */

function ensureDirectory(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function readJsonArray<T>(filePath: string): T[] {
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed as T[];
    }
  } catch (err) {
    console.error(`Error reading JSON store (${filePath}):`, err);
  }
  return [];
}

function writeJsonArray<T>(dir: string, filePath: string, data: T[]): void {
  ensureDirectory(dir);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`Error writing JSON store (${filePath}):`, err);
  }
}

export class JsonChatRepository implements ChatRepository {
  private readonly dataDir: string;
  private readonly filePath: string;
  private conversations: ServerConversation[];

  constructor(dataDir: string) {
    this.dataDir = path.resolve(dataDir);
    this.filePath = path.join(this.dataDir, 'chat-store.json');
    ensureDirectory(this.dataDir);
    this.conversations = readJsonArray<ServerConversation>(this.filePath);
  }

  getAll(): ServerConversation[] {
    return this.conversations;
  }

  count(): number {
    return this.conversations.length;
  }

  upsertConversation(payload: EnsureConversationInput): ServerConversation {
    let existing = this.conversations.find(c => c.id === payload.conversationId);
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

      this.conversations.unshift(existing);
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

    writeJsonArray(this.dataDir, this.filePath, this.conversations);
    return existing;
  }

  appendMessage(
    input: AppendMessageInput
  ): { conversation: ServerConversation; message: ServerChatMessage; isDuplicate: boolean } | null {
    const conv = this.conversations.find(c => c.id === input.conversationId);
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
    this.conversations = [conv, ...this.conversations.filter(c => c.id !== conv.id)];
    writeJsonArray(this.dataDir, this.filePath, this.conversations);

    return { conversation: conv, message, isDuplicate: false };
  }
}

export class JsonCulqiTransactionRepository implements CulqiTransactionRepository {
  private readonly dataDir: string;
  private readonly filePath: string;

  constructor(dataDir: string) {
    this.dataDir = path.resolve(dataDir);
    this.filePath = path.join(this.dataDir, 'culqi-transactions.json');
    ensureDirectory(this.dataDir);
  }

  findAll(): CulqiTransactionRecord[] {
    return readJsonArray<CulqiTransactionRecord>(this.filePath);
  }

  save(tx: CulqiTransactionRecord): void {
    const all = this.findAll();
    all.unshift(tx);
    writeJsonArray(this.dataDir, this.filePath, all.slice(0, 500));
  }
}

export class JsonDispatchLogRepository implements DispatchLogRepository {
  private readonly dataDir: string;
  private readonly filePath: string;

  constructor(dataDir: string) {
    this.dataDir = path.resolve(dataDir);
    this.filePath = path.join(this.dataDir, 'dispatch-log.json');
    ensureDirectory(this.dataDir);
  }

  append(entry: DispatchLogEntry): void {
    const logs = readJsonArray<DispatchLogEntry>(this.filePath);
    logs.unshift(entry);
    writeJsonArray(this.dataDir, this.filePath, logs.slice(0, 200));
  }
}
