import { Server as HttpServer, IncomingMessage } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { verifyAccessToken } from '../utils/jwt';
import { logger } from '../utils/logger';

interface SocketClient {
  socket: WebSocket;
  pharmacyId: string;
  userId: string;
}

let clients: SocketClient[] = [];

const getTokenFromRequest = (req: IncomingMessage): string | null => {
  const url = new URL(req.url ?? '/', 'http://localhost');
  const fromQuery = url.searchParams.get('token');

  if (fromQuery) return fromQuery;

  const auth = req.headers.authorization;
  if (auth?.startsWith('Bearer ')) {
    return auth.slice(7);
  }

  return null;
};

export const initRealtime = (server: HttpServer): void => {
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (socket, req) => {
    const token = getTokenFromRequest(req);
    if (!token) {
      socket.close(1008, 'Missing auth token');
      return;
    }

    try {
      const payload = verifyAccessToken(token);
      const client: SocketClient = {
        socket,
        pharmacyId: payload.pharmacyId,
        userId: payload.userId,
      };

      clients.push(client);
      socket.send(JSON.stringify({ type: 'connected' }));

      socket.on('close', () => {
        clients = clients.filter((item) => item.socket !== socket);
      });
    } catch {
      socket.close(1008, 'Invalid auth token');
    }
  });

  logger.info('Realtime websocket server initialized');
};

export const broadcastPharmacyUpdate = (
  pharmacyId: string,
  payload: { resource: 'drugs' | 'sales' | 'prescriptions' | 'suppliers' | 'sync'; action: string },
): void => {
  const message = JSON.stringify({
    type: 'data-updated',
    ...payload,
    at: Date.now(),
  });

  clients
    .filter((client) => client.pharmacyId === pharmacyId && client.socket.readyState === WebSocket.OPEN)
    .forEach((client) => {
      client.socket.send(message);
    });
};