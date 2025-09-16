import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { WsPathAdapter } from './adapters/ws-path.adapter';
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useWebSocketAdapter(new WsPathAdapter(app));
  // Enable CORS for WebSocket connections
  app.enableCors({
    origin: '*', // Configure this properly for production
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'],
    credentials: true,
  });

  // Serve static files from public directory
  app.useStaticAssets(join(__dirname, '..', 'public'));

  await app.listen(process.env.APP_PORT ?? 3000);
}
bootstrap();
