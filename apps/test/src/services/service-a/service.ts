import {
  BodyContent,
  InjectLogger,
  Middleware,
  RPC,
  Service,
} from '@cymbaline/core';
import { Logger } from '@cymbaline/logger';
import { InputType, PingRequest, PingResponse, ReturnType } from './dto';

@Service()
@Middleware(({ logger }) => {
  logger.info('service middleware');
})
export class ServiceModule {
  constructor(@InjectLogger() private readonly logger: Logger) {}

  @RPC(ReturnType)
  private async sayHello(@BodyContent(InputType) body: InputType) {
    return { message: 'Hello world! ' + body.name };
  }

  @RPC(PingResponse)
  private async pingPong(
    @BodyContent(PingRequest) body: PingRequest
  ): Promise<PingResponse> {
    if (body.message !== 'ping') throw new Error('Invalid message');
    this.logger.info('pinging');
    return { pong: 'pong', randomNumber: Math.floor(Math.random() * 10000) };
  }
}
