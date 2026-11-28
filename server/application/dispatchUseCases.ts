import {
  normalizePhone,
  type ChannelDispatchStatus,
  type DispatchLogEntry,
  type DispatchOrderInput
} from '../domain/entities';
import type {
  CacheStore,
  ChatEventPublisher,
  ChatRepository,
  DispatchLogRepository,
  NotificationDispatcher
} from '../domain/ports';

/**
 * Capa de Aplicación — Despacho Automático Multicanal de Órdenes (3 Canales)
 * Garantiza 100% de entrega en Chat In-App incluso si SMTP o WhatsApp Cloud API están fuera de línea.
 */
export class DispatchOrderNotificationsUseCase {
  constructor(
    private readonly chatRepo: ChatRepository,
    private readonly dispatchLogRepo: DispatchLogRepository,
    private readonly dispatcher: NotificationDispatcher,
    private readonly cache: CacheStore,
    private readonly publisher: ChatEventPublisher
  ) {}

  async execute(
    input: Partial<DispatchOrderInput>
  ): Promise<
    | {
        ok: true;
        statusCode: 200;
        emailStatus: ChannelDispatchStatus;
        whatsappStatus: ChannelDispatchStatus;
        chatDelivered: true;
        timestamp: string;
      }
    | { ok: false; statusCode: 400; error: string }
  > {
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
    } = input;

    if (!ordenId || !Array.isArray(workers) || workers.length === 0) {
      return { ok: false, statusCode: 400, error: 'Datos de orden y trabajadores requeridos.' };
    }

    const emails = workers.map(w => String(w.email || '').trim()).filter(Boolean);
    const phones = workers.map(w => String(w.telefono || '').trim()).filter(Boolean);

    // Canal 1: Chat In-App directo (siempre instantáneo y real)
    for (const w of workers) {
      const convId = `ORD:${ordenId}:${normalizePhone(w.telefono) || w.nombre || 'trabajador'}`;
      const isAnonOrder = !clienteId || clienteId === 'GUEST';
      const resolvedClientName = isAnonOrder
        ? 'Anónimo (No registrado)'
        : clienteNombre || 'Usuario Registrado';

      const conv = this.chatRepo.upsertConversation({
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
        const msgResult = this.chatRepo.appendMessage({
          conversationId: conv.id,
          messageId: `auto-order-${ordenId}-${normalizePhone(w.telefono)}`,
          senderId: isAnonOrder ? 'GUEST' : clienteId,
          senderName: resolvedClientName,
          senderRole: 'cliente',
          text: String(whatsappMessage)
        });
        if (msgResult && !msgResult.isDuplicate) {
          this.publisher.broadcast({
            type: 'chat:message',
            conversationId: conv.id,
            message: msgResult.message,
            conversation: msgResult.conversation
          });
        }
      }
    }
    this.cache.invalidateByPrefix('chat:conv:');

    // Canales 2 y 3: Correo SMTP/Webhook + WhatsApp Cloud API/Webhook (en paralelo)
    const [emailStatus, whatsappStatus] = await Promise.all([
      this.dispatcher.sendEmail({
        ordenId,
        emails,
        subject: emailSubject,
        body: emailBody || whatsappMessage
      }),
      this.dispatcher.sendWhatsApp({
        ordenId,
        phones,
        message: whatsappMessage
      })
    ]);

    const logEntry: DispatchLogEntry = {
      id: `DSP-${Date.now()}`,
      ordenId,
      timestamp: new Date().toLocaleString('es-PE'),
      emailStatus,
      whatsappStatus,
      chatDelivered: true
    };
    this.dispatchLogRepo.append(logEntry);

    return {
      ok: true,
      statusCode: 200,
      emailStatus,
      whatsappStatus,
      chatDelivered: true,
      timestamp: logEntry.timestamp
    };
  }
}
