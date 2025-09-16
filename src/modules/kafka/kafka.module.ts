import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { KafkaService } from "./kafka.service";
import { KafkaConsumer } from "./kafka.consumer";
import { KafkaProducer } from "./kafka.producer";
import { WebSocketModule } from "@/modules/websocket/websocket.module";
import { NotificationModule } from "@/api/notification/notification.module";

@Module({
  imports: [ConfigModule, WebSocketModule, NotificationModule],
  providers: [KafkaService, KafkaConsumer, KafkaProducer],
  exports: [KafkaService, KafkaConsumer, KafkaProducer],
  controllers: [],
})
export class KafkaModule {}