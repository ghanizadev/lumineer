import { BodyContent, Metadata, RPC, Service } from '@cymbaline/core';
import { InputType, ReturnType } from './dto';
import { autoInjectable } from 'tsyringe';
import { Logger } from '@cymbaline/logger';

@autoInjectable()
@Service()
export class ServiceWithAReallyLongNameIndeed {
  constructor(private readonly logger: Logger) {}

  @RPC(ReturnType)
  private async sayHi(
    @BodyContent(InputType) body: InputType,
    @Metadata() metadata: any
  ) {
    this.logger.warn(JSON.stringify(metadata));
    return { message: 'Hello world! ' + body.name };
  }
}
