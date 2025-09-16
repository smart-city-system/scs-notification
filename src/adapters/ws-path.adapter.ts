import { WsAdapter } from '@nestjs/platform-ws';
import { INestApplicationContext } from '@nestjs/common';
import * as WebSocket from 'ws';
import { IncomingMessage } from 'http';
import { URL } from 'url';

export class WsPathAdapter extends WsAdapter {
  constructor(app: INestApplicationContext) {
    super(app);
  }

  create(port: number, options?: any): any {
    const server = super.create(port, {
      ...options,
      verifyClient: (info: { origin: string; secure: boolean; req: IncomingMessage }) => {
        // Extract the path from the request URL
        const url = new URL(info.req.url || '/', `http://${info.req.headers.host}`);
        const pathname = url.pathname;
        
        // Allow connections to /notifications path or root path
        if (pathname === '/notifications' || pathname === '/') {
          return true;
        }
        
        // Reject other paths
        return false;
      },
    });

    return server;
  }

  bindClientConnect(server: any, callback: Function) {
    server.on('connection', (ws: WebSocket, req: IncomingMessage) => {
      // Extract the path from the request URL
      const url = new URL(req.url || '/', `http://${req.headers.host}`);
      const pathname = url.pathname;
      
      // Add path information to the WebSocket connection
      (ws as any).path = pathname;
      
      callback(ws, req);
    });
  }
}
