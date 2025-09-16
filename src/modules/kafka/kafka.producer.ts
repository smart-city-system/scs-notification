import { Injectable, Logger } from '@nestjs/common';
import { KafkaService } from './kafka.service';

@Injectable()
export class KafkaProducer {
  private readonly logger = new Logger(KafkaProducer.name);

  constructor(private kafkaService: KafkaService) {}

  async publishUserEvent(userId: string, event: string, data: any) {
    const message = {
      userId,
      event,
      data,
      timestamp: new Date().toISOString(),
    };

    await this.kafkaService.sendMessage('user-events', message, userId);
    this.logger.log(`Published user event: ${event} for user ${userId}`);
  }

  async publishOrderEvent(orderId: string, event: string, data: any) {
    const message = {
      orderId,
      event,
      data,
      timestamp: new Date().toISOString(),
    };

    await this.kafkaService.sendMessage('order-events', message, orderId);
    this.logger.log(`Published order event: ${event} for order ${orderId}`);
  }
}