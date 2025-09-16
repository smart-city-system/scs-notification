import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 4000 });

wss.on('connection', (ws) => {
  console.log('Client connected');
  ws.send('Hello from server!');

  ws.on('message', (message) => {
    console.log(`Received: ${message}`);
  });
});