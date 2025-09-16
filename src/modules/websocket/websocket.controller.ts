import { Controller, Post, Get, Body, Param, Query } from '@nestjs/common';
import { WebSocketService, NotificationPayload } from './websocket.service';
import { Public } from '@/common/decorators/public.decorator';

@Controller('websocket')
export class WebSocketController {
  constructor(private webSocketService: WebSocketService) {}

  @Public()
  @Get('stats')
  getConnectionStats() {
    return {
      success: true,
      data: this.webSocketService.getConnectionStats(),
      timestamp: new Date().toISOString(),
    };
  }

  @Public()
  @Post('test/broadcast')
  async sendTestBroadcast(@Body() body: { message?: string }) {
    try {
      await this.webSocketService.sendTestNotification();
      return {
        success: true,
        message: 'Test broadcast notification sent',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to send test broadcast',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Public()
  @Post('test/user/:userId')
  async sendTestUserNotification(@Param('userId') userId: string) {
    try {
      await this.webSocketService.sendTestNotification(userId);
      return {
        success: true,
        message: `Test notification sent to user ${userId}`,
        userId,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to send test notification to user ${userId}`,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Public()
  @Post('notify/user/:userId')
  async sendUserNotification(
    @Param('userId') userId: string,
    @Body() notification: NotificationPayload,
  ) {
    try {
      // await this.webSocketService.sendUserNotification(userId, notification);
      return {
        success: true,
        message: `Notification sent to user ${userId}`,
        userId,
        notification,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to send notification to user ${userId}`,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Public()
  @Post('notify/room/:room')
  async sendRoomNotification(
    @Param('room') room: string,
    @Body() notification: NotificationPayload,
  ) {
    try {
      await this.webSocketService.sendRoomNotification(room, notification);
      return {
        success: true,
        message: `Notification sent to room ${room}`,
        room,
        notification,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to send notification to room ${room}`,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Public()
  @Post('notify/broadcast')
  async broadcastNotification(@Body() notification: NotificationPayload) {
    try {
      await this.webSocketService.broadcastNotification(notification);
      return {
        success: true,
        message: 'Notification broadcasted to all clients',
        notification,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to broadcast notification',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Public()
  @Post('notify/order')
  async sendOrderNotification(
    @Body() body: {
      userId: string;
      orderId: string;
      status: string;
      data?: any;
    },
  ) {
    try {
      await this.webSocketService.sendOrderNotification(
        body.userId,
        body.orderId,
        body.status,
        body.data,
      );
      return {
        success: true,
        message: `Order notification sent to user ${body.userId}`,
        ...body,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to send order notification to user ${body.userId}`,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Public()
  @Post('notify/user-event')
  async sendUserEventNotification(
    @Body() body: {
      userId: string;
      event: string;
      data?: any;
    },
  ) {
    try {
      await this.webSocketService.sendUserEventNotification(
        body.userId,
        body.event,
        body.data,
      );
      return {
        success: true,
        message: `User event notification sent to user ${body.userId}`,
        ...body,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to send user event notification to user ${body.userId}`,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Public()
  @Post('notify/message')
  async sendMessageNotification(
    @Body() body: {
      userId: string;
      from: string;
      message: string;
    },
  ) {
    try {
      await this.webSocketService.sendMessageNotification(
        body.userId,
        body.from,
        body.message,
      );
      return {
        success: true,
        message: `Message notification sent to user ${body.userId}`,
        userId: body.userId,
        from: body.from,
        messageContent: body.message,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to send message notification to user ${body.userId}`,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
