import { DynamicModule, Global, Module } from "@nestjs/common";
import { ResendOptions, ResendOptionsAsync } from "./resend.interface";
import { ResendService } from "./resend.service";
import { RESEND_CONFIGURATION_OPTIONS } from "./resend.constant";

@Global()
@Module({
  providers: [ResendService],
  exports: [ResendService],
})
export class ResendCoreModule {
  static forRoot(options: ResendOptions) {
    return {
      module: ResendCoreModule,
      providers: [
        {
          provide: RESEND_CONFIGURATION_OPTIONS,
          useValue: options,
        },
      ],
      exports: [ResendService],
    };
  }

 static forRootAsync(options: ResendOptionsAsync): DynamicModule {
    const resendModuleOptions = {
      provide: RESEND_CONFIGURATION_OPTIONS,
      useFactory: options.useFactory,
      inject: options.inject || [],
    }

    return {
      module: ResendCoreModule,
      imports: options.imports,
      providers: [resendModuleOptions],
      exports: [ResendService],
    }
  }
}