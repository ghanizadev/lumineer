import {
  BodyParam,
  InjectLogger,
  Middleware,
  RPC,
  Service,
  StreamParam,
} from '@cymbaline/core';
import { Logger } from '@cymbaline/logger';
import { Writable, Readable, Duplex } from 'stream';
import { InputType, PingRequest, PingResponse, ReturnType } from './dto';

@Service()
@Middleware(({ logger }) => {
  logger.info('service middleware');
})
export class ServiceModule {
  constructor(@InjectLogger() private readonly logger: Logger) {}

  @RPC(ReturnType)
  private async sayHello(
    @BodyParam(InputType) body: InputType,
    @StreamParam() stream: Writable
  ) {
    for (let i = 0; i < 3; i++) {
      await new Promise((res) => setTimeout(res, 1000));
      this.logger.info('Sending hello');
      stream.write({ status: i, message: 'Hello world! ' + body.name });
    }

    stream.end();
  }

  @RPC(PingResponse)
  private async pingPong(
    @BodyParam(PingRequest) body: any,
    @StreamParam() stream: Duplex
  ) {
    const data: PingRequest[] = [];
    console.log({ stream, body });
    stream.on('data', (chunk: any) => {
      data.push(chunk);
      this.logger.info('Received: ' + data.length);
      if (data.length > 5) {
        return {
          pong: 'pong',
          randomNumber: Math.floor(Math.random() * 10000),
        };
      }
    });

    await new Promise((res) => setTimeout(res, 15000));
  }
}
