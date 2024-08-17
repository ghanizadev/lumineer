import {
  ArgumentType,
  BodyParam,
  Metadata,
  ReturnType,
  RPC,
  Service,
} from '@cymbaline/core';
import { InputMessageType, ReturnMessageType } from './dto';

@Service()
export class ServiceWithAReallyLongNameIndeed {
  constructor() {}

  @RPC()
  @ReturnType(ReturnMessageType)
  @ArgumentType(InputMessageType)
  private async sayHi(
    @BodyParam() body: InputMessageType,
    @Metadata() metadata: any
  ) {
    return { message: 'Hello world! ' + body.name };
  }
}
