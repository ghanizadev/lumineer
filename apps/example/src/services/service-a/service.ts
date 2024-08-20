import {
  ArgumentType,
  BodyParam,
  InjectLogger,
  Middleware,
  ReturnType,
  RPC,
  Service,
  StreamParam,
  UnknownException,
} from '@cymbaline/core';
import { Logger } from '@cymbaline/logger';
import { Writable, Duplex } from 'stream';
import {
  InputMessageType,
  PingRequest,
  PingResponse,
  ReturnMessageType,
} from './dto';

@Service()
@Middleware(({ logger }) => {
  logger.info('service middleware');
})
export class ServiceModule {
  private data: PingRequest[] = [];

  constructor(@InjectLogger() private readonly logger: Logger) {}

  @RPC()
  @ReturnType(ReturnMessageType)
  @ArgumentType(InputMessageType)
  private async sayHello(
    @BodyParam() body: InputMessageType,
    @StreamParam() stream: Writable
  ) {
    for (let i = 0; i < 3; i++) {
      await new Promise((res) => setTimeout(res, 1000));
      this.logger.info('Sending hello');
      stream.write({
        status: i,
        message: `Hello ${body.name}`,
      });
    }

    stream.end();
  }

  @RPC()
  @ReturnType(PingResponse)
  @ArgumentType(PingRequest)
  private async pingPong(
    @BodyParam() body: PingRequest,
    @StreamParam() stream: Duplex
  ) {
    this.data.push(body);
    this.logger.info('Received: ' + this.data.length);

    if (!body.colorName) {
      throw new UnknownException('Color name is undefined');
    }

    if (this.data.length > 5) {
      this.data.forEach((d) => {
        this.logger.info(d.message);
      });

      return {
        pong: 'pong',
        randomNumber: Math.floor(Math.random() * 10000),
      };
    }
  }
}
