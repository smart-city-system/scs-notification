import { Inject, Injectable } from "@nestjs/common"
import { RESEND_CONFIGURATION_OPTIONS } from "./resend.constant"
import {
  CreateBatchOptions,
  CreateEmailOptions,
  CreateEmailRequestOptions,
  Resend,
} from 'resend'
import { ResendOptions } from "./resend.interface"


@Injectable()
export class ResendService extends Resend {
    constructor(
    @Inject(RESEND_CONFIGURATION_OPTIONS)
    readonly options: ResendOptions,
  ) {
    if (!(options && options.apiKey)) {
      return
    }

    super(options.apiKey)
  }

  public send = async (
    payload: CreateEmailOptions,
    options?: CreateEmailRequestOptions,
  ) => {
    console.log(payload)
    try {
      await this.emails.send(payload, options)
    } catch (error) {
      console.log(error)
    }
  }
  public sendBatch = async (
    payload: CreateBatchOptions,
    options?: CreateEmailRequestOptions,
  ) => this.batch.send(payload, options)
}