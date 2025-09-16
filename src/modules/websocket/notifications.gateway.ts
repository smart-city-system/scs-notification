import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from '@/common/constant/app.constant';
import { Server, WebSocket } from 'ws';
import { URL } from 'url';

interface AuthenticatedClient {
  socket: WebSocket;
}

@WebSocketGateway({
  cors: {
    origin: '*', // ⚠️ set properly for production
  },
  path: '/notifications',
})
export class NotificationsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);
  private connectedClients = new Map<string, Set<AuthenticatedClient>>();

  constructor(private jwtService: JwtService) {}

  afterInit(server: Server) {
    this.logger.log('Native WebSocket Gateway initialized');

    // Set up heartbeat to detect broken connections
    const interval = setInterval(() => {
      this.server.clients.forEach((ws: any) => {
        if (ws.isAlive === false) {
          ws.terminate();
          return;
        }

        ws.isAlive = false;
        ws.ping();
      });
    }, 30000); // Check every 30 seconds

    this.server.on('close', () => {
      clearInterval(interval);
    });
  }

  async handleConnection(client: WebSocket, req: any) {
    try {
      // Set up heartbeat for this client
      (client as any).isAlive = true;
      client.on('pong', () => {
        (client as any).isAlive = true;
      });

      // Log the connection path for debugging
      const url = new URL(req.url || '/', `http://${req.headers.host}`);
      this.logger.log(`WebSocket connection attempt to path: ${url.pathname}`);

      const token = this.extractTokenFromHandshake(req);
      if (token) {
        const payload = await this.jwtService.verifyAsync(token, {
          secret: jwtConstants.secret,
        });
        const userId = payload.sub || payload.user_id;
        if (!userId) {
          throw new Error('Invalid token: missing user ID');
        }
        
        // Store the connected client
        const existingClients = this.connectedClients.get(userId);
        if (existingClients) {
          existingClients.add({ socket: client });
        } else {
          this.connectedClients.set(userId, new Set([{ socket: client }]));
        }
        this.logger.log(`User ${userId} connected`);

        this.send(client, {
          type: 'connected',
          message: 'Successfully connected to notifications',
          userId,
          timestamp: new Date().toISOString(),
        });
      } else {
        // this.connectedClients.set(`connection:${userId}`, { socket: client, rooms: new Set() });

        // this.logger.log(`Anonymous client connected`);

        // this.send(client, {
        //   type: 'connected',
        //   message: 'Connected as anonymous user',
        //   timestamp: new Date().toISOString(),
        // });
      }
      console.log({connectedClients: this.connectedClients})
      // Handle incoming messages
      client.on('message', (raw) => this.handleMessage(client, raw.toString()));
    } catch (error) {
      this.logger.error('Authentication failed:', error);
      this.send(client, { type: 'auth_error', message: error.message });
      client.close();
    }
  }

  async handleDisconnect(client: WebSocket) {
    for (const [userId, clients] of this.connectedClients) {
      for (const c of clients) {
        if (c.socket === client) {
          clients.delete(c);
          this.logger.log(`Client disconnected for user ${userId}`);
          break;
        }
      }
      // If no clients left for this user, remove the entry
      if (clients.size === 0) {
        this.connectedClients.delete(userId);
      }
      console.log({connectedClients: this.connectedClients})
    }
  }

  private handleMessage(client: WebSocket, raw: string) {
    try {
      const msg = JSON.parse(raw);
      if (msg.event === 'close') {
        client.close();
        return;
      } 
 
    } catch (err) {
      this.logger.error('Invalid message:', err);
      this.send(client, { type: 'error', message: 'Invalid message format' });
    }
  }

  // --- Notification methods ---

  sendAlarmToOperator(userId: string, alarm: any) {
    let sent = false;
    const clients = this.connectedClients.get(userId) || new Set();
    console.log({numberOfClients: clients.size})
    for (const client of clients) {
      this.send(client.socket, alarm);
      sent = true;
    }
    if (sent) {
      this.logger.log(`Notification sent to user ${userId}: ${alarm.type || 'general'}`);
    } else {
      this.logger.warn(`User ${userId} not connected, notification not delivered`);
    }
  }

  // sendNotificationToRoom(room: string, notification: any) {
  //   let count = 0;
  //   for (const [, client] of this.connectedClients) {
  //     if (client.rooms.has(room)) {
  //       this.send(client.socket, {
  //         type: 'notification',
  //         ...notification,
  //         timestamp: new Date().toISOString(),
  //       });
  //       count++;
  //     }
  //   }
  //   this.logger.log(`Notification sent to room ${room}: ${notification.type || 'general'} (${count} clients)`);
  // }

  // broadcastNotification(notification: any) {
  //   for (const [, client] of this.connectedClients) {
  //     this.send(client.socket, {
  //       type: 'notification',
  //       ...notification,
  //       timestamp: new Date().toISOString(),
  //     });
  //   }
  //   this.logger.log(`Notification broadcasted: ${notification.type || 'general'}`);
  // }

  // Get connected clients count
  // getConnectedClientsCount(): number {
  //   return this.connectedClients.size;
  // }

  // Get connected users
  // getConnectedUsers(): string[] {
  //   return Array.from(this.connectedClients.values())
  //     .filter(client => client.userId)
  //     .map(client => client.userId!);
  // }

  // --- Utils ---
  private send(client: WebSocket, message: any) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  }

  private extractTokenFromHandshake(req: any): string | null {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const token = url.searchParams.get('token');
    if (token) return token;

    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    return null;
  }
}
