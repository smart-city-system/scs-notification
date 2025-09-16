import type { TypeOrmModuleOptions } from "@nestjs/typeorm"

export enum Env {
  DEFAULT = "default",
  DEVELOPMENT = "development",
  PRODUCTION = "production",
}

export interface IConfigApp {
  port: number
  version: string
}

export interface IConfig {
  env: Env
  app: IConfigApp
  db: TypeOrmModuleOptions
  kafka: {
    brokers: string[]
    clientId: string
    groupId: string
  }
  resend: {
    apiKey: string
  }
}
export interface IPaginationMeta {
  /**
   * the amount of items on this specific page
   */
  item_count: number
  /**
   * the total amount of items
   */
  total_items?: number
  /**
   * the amount of items that were requested per page
   */
  items_per_page: number
  /**
   * the total amount of pages in this paginator
   */
  total_pages?: number
  /**
   * the current page this paginator "points" to
   */
  current_page: number
}
export interface PublicMetadata {
  db_user_id: number
  role: string
}
export type EncodeByResolution = {
  inputPath: string
  isHasAudio: boolean
  resolution: {
    width: number
    height: number
  }
  outputSegmentPath: string
  outputPath: string
  bitrate: {
    720: number
    1080: number
    1440: number
    original: number
  }
}

export type WebsocketMessage<T> = {
  event: 'alarm',
  payload: T
}