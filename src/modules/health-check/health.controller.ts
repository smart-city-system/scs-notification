import { Public } from "@/common/decorators/public.decorator"
import { BadGatewayException, BadRequestException, Controller, GatewayTimeoutException, Get } from "@nestjs/common"
// biome-ignore lint/style/useImportType: <explanation>
import {
  HealthCheck,
  HealthCheckResult,
  HealthCheckService,
  HealthIndicatorResult,
  HttpHealthIndicator,
  TypeOrmHealthIndicator,
} from "@nestjs/terminus"
// biome-ignore lint/style/useImportType: <explanation>
import { Retry } from "@/common/decorators/retry.decorator"
// biome-ignore lint/style/useImportType: <explanation>
import { Logger } from "http-system-logger"

/**
 * https://docs.nestjs.com/recipes/terminus
 */
@Controller()
export class HealthController {
  private readonly logger = new Logger(HealthController.name)
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private db: TypeOrmHealthIndicator,
  ) {}

  @Public()
  @Get("health")
  @HealthCheck()
  public async executeHealthCheck(): Promise<HealthCheckResult> {
    return await this.health.check([
      async (): Promise<HealthIndicatorResult> => await this.http.pingCheck("dns", "https://1.1.1.1"),
      async (): Promise<HealthIndicatorResult> => await this.db.pingCheck("database"),
    ])
  }
  // @Public()
  // @Get("hello")
  // @Retry(3, 5000, { when: { statusCode: 502 } })
  // // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  // public hello(): Promise<any> {
  //   this.logger.info("hello")
  //   return this.axios.get("https://api.coursity.io.vn//api/v1/500")
  // }

  @Get("500")
  @Public()
  public async error500(): Promise<void> {
    throw new Error("500")
  }

  @Get("400")
  @Public()
  public async error400(): Promise<void> {
    throw new BadRequestException()
  }

  @Get("502")
  @Public()
  public async error502(): Promise<void> {
    throw new BadGatewayException()
  }
}
