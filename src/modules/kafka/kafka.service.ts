import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Consumer, Producer, KafkaMessage } from 'kafkajs';

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaService.name);
  private kafka: Kafka;
  private producer: Producer;
  private consumer: Consumer;

  constructor(private configService: ConfigService) {
    this.kafka = new Kafka({
      clientId: this.configService.get('kafka.clientId', 'nestjs-app'),
      brokers: this.configService.get<string[]>('kafka.brokers', ['localhost:9092']),
      connectionTimeout: 10000,
      requestTimeout: 30000,
      retry: {
        initialRetryTime: 100,
        retries: 8
      },
      logLevel: 2, // INFO level
    });

    this.producer = this.kafka.producer({
      retry: {
        initialRetryTime: 100,
        retries: 3
      }
    });
    this.consumer = this.kafka.consumer({
      groupId: this.configService.get('kafka.groupId', 'scs-notification'),
      sessionTimeout: 30000,
      heartbeatInterval: 3000,
    });
  }

  async onModuleInit() {
    try {
      this.logger.log(`Attempting to connect to Kafka brokers: ${this.configService.get<string[]>('kafka.brokers')}`);
      this.logger.log(`Using client ID: ${this.configService.get('kafka.clientId')}`);
      this.logger.log(`Using group ID: ${this.configService.get('kafka.groupId')}`);

      await this.producer.connect();
      this.logger.log('Kafka producer connected successfully');

      await this.consumer.connect();
      this.logger.log('Kafka consumer connected successfully');

      this.logger.log('Kafka service initialized');
    } catch (error) {
      this.logger.error('Failed to initialize Kafka service:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      await this.producer.disconnect();
      this.logger.log('Kafka producer disconnected');

      await this.consumer.disconnect();
      this.logger.log('Kafka consumer disconnected');

      this.logger.log('Kafka service destroyed');
    } catch (error) {
      this.logger.error('Error during Kafka service destruction:', error);
    }
  }

  async sendMessage(topic: string, message: any, key?: string) {
    try {
      await this.producer.send({
        topic,
        messages: [{
          key,
          value: JSON.stringify(message),
        }],
      });
      this.logger.log(`Message sent to topic ${topic}`);
    } catch (error) {
      this.logger.error(`Failed to send message to topic ${topic}`, error);
      throw error;
    }
  }

  async subscribe(topic: string, callback: (message: KafkaMessage) => Promise<void>) {
    try {
      await this.consumer.subscribe({ topic });
      await this.consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          this.logger.log(`Received message from topic ${topic}, partition ${partition}`);
          await callback(message);
        },
      });
    } catch (error) {
      this.logger.error(`Failed to subscribe to topic ${topic}`, error);
      throw error;
    }
  }
  async subscribeToTopics(topicHandlers: Array<{ topic: string; handler: (message: KafkaMessage) => Promise<void> }>) {
    try {
      const topics = topicHandlers.map(th => th.topic);
      await this.consumer.subscribe({ topics });
      const handlerMap = new Map(topicHandlers.map(th => [th.topic, th.handler]));
      await this.consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          this.logger.log(`Received message from topic ${topic}, partition ${partition}`);
          const handler = handlerMap.get(topic);
          if (handler) {
            await handler(message);
          }
        },
      });
    } catch (error) {
      this.logger.error('Failed to subscribe to topics', error);
      throw error;
    }
  }
}