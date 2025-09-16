import { Env, type IConfig } from "@/common/interfaces/common.interface"
import { bool, cleanEnv, num, str } from "envalid"
export type ConfigApp = IConfig
export const configuration = (): ConfigApp => {
  const configEnvValidate = cleanEnv(process.env, {
    NODE_ENV: str({ default: Env.PRODUCTION, choices: Object.values(Env) }),
    APP_PORT: num({}),
    APP_VERSION: str({ default: "1" }),
    DB_HOST: str({ default: "localhost" }),
    DB_PORT: num({ default: 5432 }),
    DB_USER: str(),
    DB_PASSWORD: str(),
    DB_NAME: str(),
    IGNORED_ROUTES: str(),
    KAFKA_BROKERS: str({ default: "localhost:9092" }),
    KAFKA_CLIENT_ID: str({ default: "nestjs-app" }),
    KAFKA_GROUP_ID: str({ default: "nestjs-consumer-group" }),
    RESEND_API_KEY: str(),
  })
  return {
    env: configEnvValidate.NODE_ENV,
    app: {
      port: configEnvValidate.APP_PORT,
      version: configEnvValidate.APP_VERSION,
    },
    db: {
      type: "postgres",
      host: configEnvValidate.DB_HOST,
      port: configEnvValidate.DB_PORT,
      username: configEnvValidate.DB_USER,
      password: configEnvValidate.DB_PASSWORD,
      database: configEnvValidate.DB_NAME,
      // synchronize: true,
      logging: false,
      entities: ["dist/**/*.entity{.ts,.js}"],
    },
    kafka: {
      brokers: configEnvValidate.KAFKA_BROKERS.split(","),
      clientId: configEnvValidate.KAFKA_CLIENT_ID,
      groupId: configEnvValidate.KAFKA_GROUP_ID,
    },
    resend: {
      apiKey: configEnvValidate.RESEND_API_KEY,
    },
   
  }
}
