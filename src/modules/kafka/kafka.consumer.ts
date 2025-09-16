import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { KafkaService } from "./kafka.service";
import { KafkaMessage } from "kafkajs";
import { WebSocketService } from "@/modules/websocket/websocket.service";
import { NotificationService } from "@/api/notification/notification.service";
import { ResendService } from "../resend/resend.service";

@Injectable()
export class KafkaConsumer implements OnModuleInit {
  private readonly logger = new Logger(KafkaConsumer.name);

  constructor(
    private kafkaService: KafkaService,
    private webSocketService: WebSocketService,
    private notificationService: NotificationService,
    private resendService: ResendService
  ) {}

  async onModuleInit() {
    await this.startConsumer();
  }

  async startConsumer() {
    try {
      this.logger.log("Starting Kafka consumer...");
      // Subscribe to topics
      await this.kafkaService.subscribeToTopics(
        [
          { topic: "notification.triggered", handler: this.handleNotificationEvents.bind(this) },
          { topic: "user.created", handler: this.handleUserCreate.bind(this) },
        ]
      )
      this.logger.log("Kafka consumer started and subscribed to topics");
    } catch (error) {
      this.logger.error("Failed to start Kafka consumer:", error);
      throw error;
    }
  }

  private async handleNotificationEvents(message: KafkaMessage) {
    try {
      const data = JSON.parse(message.value?.toString() || "{}");
      this.logger.log("Processing notification event:", data);

      // Process notification event and send via WebSocket
      if (data.type === "alarm.created") {
        const createNotificationRequestDto = {
          message: data.payload.description,
          type: data.type,
          metadata: data.payload,
        };
        const users = await this.notificationService.create(
          createNotificationRequestDto
        );
        await this.webSocketService.sendAlarmToOperator(
          data.payload,
          users.map((user) => user.id)
        );
        const emails = users.map((user) => user.email);
        // HTML email template
        const htmlTemplate = (description: string) => `
          <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 520px; margin: 32px auto; border-radius: 14px; box-shadow: 0 4px 24px rgba(44,62,80,0.10); background: #fff; overflow: hidden;">
            <div style="background: linear-gradient(90deg, #ff5858 0%, #f09819 100%); padding: 24px 32px;">
              <h2 style="color: #fff; margin: 0; font-size: 1.7rem; letter-spacing: 1px;">🚨 Alarm Alert</h2>
            </div>
            <div style="padding: 28px 32px 18px 32px;">
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 18px;">
                <tr>
                  <td style="font-weight: 600; color: #222; padding: 6px 0;">Severity:</td>
                  <td style="color: #d32f2f; font-weight: 500;">${data.payload.severity}</td>
                </tr>
                <tr>
                  <td style="font-weight: 600; color: #222; padding: 6px 0;">Type:</td>
                  <td style="color: #444;">${data.payload.type}</td>
                </tr>
                <tr>
                  <td style="font-weight: 600; color: #222; padding: 6px 0;">Premise:</td>
                  <td style="color: #444;">${data.payload.premise.name}</td>
                </tr>
              </table>
              <div style="background: #fff3cd; border-left: 4px solid #f09819; padding: 16px 18px; margin: 18px 0 24px 0; border-radius: 6px;">
                <span style="font-size: 1.08rem; color: #7a5c00;"><strong>Description:</strong> ${description}</span>
              </div>
              <div style="text-align: center; margin-top: 18px;">
                <a href="http://localhost:3000.admin/dashboard" style="display: inline-block; background: linear-gradient(90deg, #ff5858 0%, #f09819 100%); color: #fff; text-decoration: none; padding: 12px 32px; border-radius: 6px; font-weight: 600; font-size: 1rem; letter-spacing: 0.5px;">View in Dashboard</a>
              </div>
              <p style="font-size: 13px; color: #aaa; margin-top: 32px; text-align: center;">This is an automated message from <b>Coursity Alarm System</b>.</p>
            </div>
          </div>
        `;
        await this.resendService.sendBatch(
          emails.map((email) => ({
            from: "no-reply@coursity.io.vn",
            to: email,
            subject: "New Alarm",
            text: `There is a new alarm: ${data.payload.description}`,
            html: htmlTemplate(data.payload.description),
          }))
        );
        
        console.log("send mail")
      } else if (data.type === "broadcast_notification") {
        await this.webSocketService.broadcastNotification({
          type: data.notificationType || "general",
          title: data.title || "System Notification",
          message: data.message || "System notification",
          priority: data.priority || "medium",
          category: data.category || "system",
          data: data.payload,
        });
      } else if (data.type === "room_notification" && data.room) {
        await this.webSocketService.sendRoomNotification(data.room, {
          type: data.notificationType || "general",
          title: data.title || "Room Notification",
          message: data.message || "Room notification",
          priority: data.priority || "medium",
          category: data.category || "room",
          data: data.payload,
        });
      }

      this.logger.log("Notification processed and sent via WebSocket");
    } catch (error) {
      this.logger.error("Error processing notification event:", error);
    }
  }

  private async handleUserCreate(message: KafkaMessage) {
    try {
      const data = JSON.parse(message.value?.toString() || "{}");
      this.logger.log("Processing user created event:", data);
      const email = data.payload.email;
      const token = data.payload.token;
      console.log({email, token})
      //send email to verify account
      await this.resendService.send({
        from: "no-reply@coursity.io.vn",
        to: email,
        subject: "Verify your account",
        text: "Please verify your account",
        html: `<h1>Please verify your account <a href='http://localhost:3000/verify?token=${token}'>here</a></h1>`,
      })

      // Process order event logic here
    } catch (error) {
      this.logger.error("Error processing order event:", error);
    }
  }
}
