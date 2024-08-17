import {
  ArgumentType,
  BodyParam,
  Metadata,
  ReturnType,
  RPCServerFunction,
  Service,
  StreamParam,
} from '@cymbaline/core';
import {
  InputMessageType,
  ReturnMessageType,
  StreamInputType,
  StreamReturnType,
} from './dto';
import { Duplex } from 'stream';

@Service()
export class ServiceWithAReallyLongNameIndeed {
  constructor(private count = 0) {}

  @RPCServerFunction()
  @ReturnType(ReturnMessageType)
  @ArgumentType(InputMessageType)
  private async sayHi(
    @BodyParam() body: InputMessageType,
    @Metadata() metadata: any
  ) {
    return { message: 'Hello world! ' + body.name };
  }

  @RPCServerFunction()
  @ReturnType(StreamReturnType)
  @ArgumentType(StreamInputType)
  private async sayWhateverYouWantToSayBecauseLifeIsTooShortToFollowTheseSocialConventions(
    @BodyParam() body: StreamInputType,
    @StreamParam() stream: Duplex
  ) {
    this.count++;

    if (this.count > 5) {
      stream.write({ message: 'Bye!', status: this.count });
      stream.end();
    } else {
      stream.write({
        message: 'Hello  ' + body.helloStream,
        status: this.count,
      });
    }
  }
}
