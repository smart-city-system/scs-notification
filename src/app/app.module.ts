import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { configuration } from "@/config/configuration";
import { TypeOrmModule, TypeOrmModuleOptions } from "@nestjs/typeorm";
import { APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { AppInterceptor } from "@/common/interceptors/app.interceptor";
import { JwtAuthGuard } from "@/common/guards/jwt.guard";
import { HealthModule } from "@/modules/health-check/health.module";
import { JwtModule } from "@nestjs/jwt";
import { jwtConstants } from "@/common/constant/app.constant";
import { KafkaModule } from "@/modules/kafka/kafka.module";
import { WebSocketModule } from "@/modules/websocket/websocket.module";
import { NotificationModule } from "@/api/notification/notification.module";
import { ResendModule } from "@/modules/resend/resend.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      expandVariables: true,
      envFilePath: [".env"],
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        ...config.get<TypeOrmModuleOptions>("db"),
      }),
      inject: [ConfigService],
    }),
    HealthModule,
    KafkaModule,
    WebSocketModule,
    NotificationModule,
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: "60s" },
    }),
    ResendModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const apiKey = config.get<string>("resend.apiKey");
        if (!apiKey) {
          throw new Error("Missing required Resend API key in configuration");
        }
        return { apiKey };
      },
    }),
  ],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: AppInterceptor },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
