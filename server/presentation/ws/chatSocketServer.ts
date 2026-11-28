import type http from 'http';
import { WebSocket, WebSocketServer } from 'ws';
import type { SendChatMessageUseCase } from '../../application/chatUseCases';
import type { ChatEventPublisher } from '../../domain/ports';

/**
 * Capa de Presentación — Controlador WebSocket (/ws/chat) — Patrón Observer / Pub-Sub
 */
export class ChatSocketServer implements ChatEventPublisher {
  public readonly wss: WebSocketServer;

  constructor(
    server: http.Server,
    private readonly getSendChatMessageUseCase: () => SendChatMessageUseCase
  ) {
    this.wss = new WebSocketServer({ server, path: '/ws/chat' });

    this.wss.on('connection', ws => {
      ws.send(JSON.stringify({ type: 'chat:connected', timestamp: Date.now() }));

      ws.on('message', data => {
        try {
          const parsed = JSON.parse(data.toString());
          if (parsed?.type === 'chat:send' && parsed.conversationId && parsed.text) {
            this.getSendChatMessageUseCase().execute(parsed, { allowUnregistered: true });
          }
        } catch (err) {
          console.error('Invalid WS message:', err);
        }
      });
    });
  }

  broadcast(event: unknown): void {
    const raw = JSON.stringify(event);
    this.wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(raw);
      }
    });
  }
}
