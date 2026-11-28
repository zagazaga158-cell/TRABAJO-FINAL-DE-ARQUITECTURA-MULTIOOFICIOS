/**
 * Capa de Dominio (Backend — Clean Architecture Capa 1)
 * Entidades puras, tipos de valor y reglas de validación independientes de Express, FS o red.
 */

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

export interface CulqiConfig {
  configured: boolean;
  publicKey: string | null;
  mode: 'live' | 'test' | 'sandbox';
  currency: 'PEN';
  merchantName: string;
}

export interface CulqiChargeInput {
  tokenId: string;
  email: string;
  amountCentimos: number;
  description: string;
  method: 'TARJETA' | 'YAPE_PLIN';
  concepto: 'IMPREVISTO' | 'ANUNCIO' | 'ORDEN_CUSTODIA';
  referenceId?: string;
  customerName?: string;
  brand: string;
  last4?: string;
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

export interface EnsureConversationInput {
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
}

export interface AppendMessageInput {
  conversationId: string;
  messageId?: string;
  senderId: string;
  senderName: string;
  senderRole: 'cliente' | 'trabajador' | 'sistema';
  text: string;
}

export interface ChannelDispatchStatus {
  sent: boolean;
  queued: boolean;
  to: string[];
  detail: string;
}

export interface DispatchLogEntry {
  id: string;
  ordenId: string;
  timestamp: string;
  emailStatus: ChannelDispatchStatus;
  whatsappStatus: ChannelDispatchStatus;
  chatDelivered: boolean;
}

export interface DispatchWorkerInput {
  usuarioId?: string;
  nombre?: string;
  dni?: string;
  telefono?: string;
  email?: string;
  avatar?: string;
  institucion?: string;
  titulo?: string;
}

export interface DispatchOrderInput {
  ordenId: string;
  servicioTitulo?: string;
  clienteId?: string;
  clienteNombre?: string;
  clienteDni?: string;
  clienteTelefono?: string;
  workers: DispatchWorkerInput[];
  whatsappMessage?: string;
  emailSubject?: string;
  emailBody?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function formatPeruTime(): string {
  return new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
}

export function formatPeruDateTime(): string {
  return new Date().toLocaleString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function normalizePhone(tel?: string): string {
  const digits = (tel || '').replace(/\D/g, '');
  if (!digits) return '';
  return digits.startsWith('51') && digits.length > 9 ? digits.slice(2) : digits;
}

export function isUnregisteredSender(senderId?: string): boolean {
  const clean = (senderId || '').trim();
  return !clean || clean === 'GUEST' || clean === 'anon';
}

export function validateCulqiChargeBody(
  body: Record<string, unknown>
): { ok: true; value: CulqiChargeInput } | { ok: false; error: string } {
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
    return { ok: false, error: 'Token Culqi requerido para procesar el cargo.' };
  }
  if (!email || !EMAIL_REGEX.test(email)) {
    return { ok: false, error: 'Ingresa un correo electrónico válido para el comprobante Culqi.' };
  }
  if (!Number.isFinite(amountCentimos) || amountCentimos < 100) {
    return { ok: false, error: 'El monto mínimo de cobro en Culqi es S/ 1.00 (100 céntimos).' };
  }

  return {
    ok: true,
    value: {
      tokenId,
      email,
      amountCentimos,
      description,
      method,
      concepto,
      referenceId,
      customerName,
      brand,
      last4
    }
  };
}

export function canUserAccessConversation(
  conversation: ServerConversation,
  query: { role: string; userId: string; dni: string; telefono: string }
): boolean {
  if (query.role === 'ADMIN') return true;
  if (query.role === 'GUEST' || !query.userId || query.userId === 'GUEST') return false;

  const normTel = normalizePhone(query.telefono);
  const matchCliente =
    (Boolean(query.userId) && conversation.clienteId === query.userId) ||
    (Boolean(query.dni) && conversation.clienteDni === query.dni) ||
    (Boolean(normTel) && normalizePhone(conversation.clienteTelefono) === normTel);

  const matchTrabajador =
    (Boolean(query.userId) && conversation.trabajadorId === query.userId) ||
    (Boolean(query.dni) && conversation.trabajadorDni === query.dni) ||
    (Boolean(normTel) && normalizePhone(conversation.trabajadorTelefono) === normTel);

  return matchCliente || matchTrabajador;
}
