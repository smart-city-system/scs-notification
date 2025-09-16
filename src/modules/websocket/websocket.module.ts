import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { NotificationsGateway } from './notifications.gateway';
import { WebSocketService } from './websocket.service';
import { WebSocketController } from './websocket.controller';
import { jwtConstants } from '@/common/constant/app.constant';

@Module({
  imports: [
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '24h' },
    }),
  ],
  providers: [NotificationsGateway, WebSocketService],
  controllers: [WebSocketController],
  exports: [WebSocketService, NotificationsGateway],
})
export class WebSocketModule {}
