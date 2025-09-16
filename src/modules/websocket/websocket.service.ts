import { Injectable, Logger } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway';
import { WebsocketMessage } from '@/common/interfaces/common.interface';

export interface NotificationPayload {
  type: string;
  title: string;
  message: string;
  data?: any;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  category?: string;
  actionUrl?: string;
  expiresAt?: Date;
}
export interface AlarmPayload {
 id: string,
  premise_id: string,
  premise: {
    id: string,
    name: string,
    address: string
  },
  type: string,
  description: string,
  severity:string,
  triggered_at: string,
  device: string,
  status: string
}
export interface UserNotification extends NotificationPayload {
  userId: string;
}

export interface RoomNotification extends NotificationPayload {
  room: string;
}

@Injectable()
export class WebSocketService {
  private readonly logger = new Logger(WebSocketService.name);

  constructor(private notificationsGateway: NotificationsGateway) {}

  /**
   * Send a notification to a specific user
   */
  async sendAlarmToOperator(alarm: AlarmPayload, userIds: string[]) {
    try {
      const websocketMessage: WebsocketMessage<AlarmPayload> = {
        event: 'alarm',
        payload: alarm,
      };
      userIds.forEach(userId => {
        console.log({userId})
        this.notificationsGateway.sendAlarmToOperator(userId, websocketMessage);
      })
      // await this.sendUserNotification(userId, websocketMessage);
    } catch (error) {
      // this.logger.error(`Failed to send user notification to ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Send a notification to multiple users
   */
  async sendBulkUserNotifications(userIds: string[], notification: NotificationPayload) {
    // const promises = userIds.map(userId => 
    //   this.sendUserNotification(userId, notification)
    // );
    
    try {
      // await Promise.allSettled(promises);
      this.logger.log(`Bulk notification sent to ${userIds.length} users: ${notification.type}`);
    } catch (error) {
      this.logger.error('Failed to send bulk user notifications:', error);
      throw error;
    }
  }

  /**
   * Send a notification to a room
   */
  async sendRoomNotification(room: string, notification: NotificationPayload) {
    try {
      // await this.notificationsGateway.sendNotificationToRoom(room, notification);
      this.logger.log(`Room notification sent to ${room}: ${notification.type}`);
    } catch (error) {
      this.logger.error(`Failed to send room notification to ${room}:`, error);
      throw error;
    }
  }

  /**
   * Broadcast a notification to all connected clients
   */
  async broadcastNotification(notification: NotificationPayload) {
    try {
      // await this.notificationsGateway.broadcastNotification(notification);
      this.logger.log(`Broadcast notification sent: ${notification.type}`);
    } catch (error) {
      this.logger.error('Failed to broadcast notification:', error);
      throw error;
    }
  }

  /**
   * Send a system notification (high priority)
   */
  async sendSystemNotification(notification: Omit<NotificationPayload, 'priority'>) {
    const systemNotification: NotificationPayload = {
      ...notification,
      priority: 'urgent',
      category: 'system',
    };

    await this.broadcastNotification(systemNotification);
  }

  /**
   * Send an order-related notification
   */
  async sendOrderNotification(userId: string, orderId: string, status: string, data?: any) {
    const notification: NotificationPayload = {
      type: 'order_update',
      title: 'Order Update',
      message: `Your order #${orderId} status has been updated to: ${status}`,
      priority: 'medium',
      category: 'order',
      data: {
        orderId,
        status,
        ...data,
      },
      actionUrl: `/orders/${orderId}`,
    };

    // await this.sendUserNotification(userId, notification);
  }

  /**
   * Send a user-related notification
   */
  async sendUserEventNotification(userId: string, event: string, data?: any) {
    const notification: NotificationPayload = {
      type: 'user_event',
      title: 'Account Update',
      message: `Your account has been updated: ${event}`,
      priority: 'low',
      category: 'user',
      data: {
        event,
        ...data,
      },
    };

    // await this.sendUserNotification(userId, notification);
  }

  /**
   * Send a real-time message notification
   */
  async sendMessageNotification(userId: string, from: string, message: string) {
    const notification: NotificationPayload = {
      type: 'new_message',
      title: 'New Message',
      message: `New message from ${from}: ${message.substring(0, 50)}${message.length > 50 ? '...' : ''}`,
      priority: 'high',
      category: 'message',
      data: {
        from,
        message,
      },
    };

    // await this.sendUserNotification(userId, notification);
  }

  /**
   * Get statistics about connected clients
   */
  getConnectionStats() {
    return {
      // totalConnections: this.notificationsGateway.getConnectedClientsCount(),
      // connectedUsers: this.notificationsGateway.getConnectedUsers(),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Send a test notification (for debugging)
   */
  async sendTestNotification(userId?: string) {
    const testNotification: NotificationPayload = {
      type: 'test',
      title: 'Test Notification',
      message: 'This is a test notification from the WebSocket service',
      priority: 'low',
      category: 'test',
      data: {
        timestamp: new Date().toISOString(),
        random: Math.random(),
      },
    };

    if (userId) {
      // await this.sendUserNotification(userId, testNotification);
    } else {
      await this.broadcastNotification(testNotification);
    }
  }
}
