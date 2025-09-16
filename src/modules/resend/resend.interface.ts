export interface ResendOptions {
  apiKey: string
}

export interface ResendOptionsAsync {
  imports?: any[]
  useFactory: (...args: any[]) => Promise<ResendOptions> | ResendOptions
  inject?: any[]
}