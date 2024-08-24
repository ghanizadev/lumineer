import {
  ArgumentType,
  BodyParam,
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
  MyEnum,
  PingRequest,
  PingResponse,
  ReturnMessageType,
} from './dto';
import { GrpcClient, GrpcServiceClient } from '@cymbaline/client';

@Service()
@Middleware(({ logger }) => {
  logger.info('service middleware');
})
export class ServiceModule {
  private data: PingRequest[] = [];

  constructor(
    private readonly logger: Logger,
    @GrpcClient('post-service', 'UserService')
    private readonly postUserClient: GrpcServiceClient
  ) {}

  @RPC()
  @ReturnType(ReturnMessageType, { stream: true })
  @ArgumentType(InputMessageType)
  private async sayHello(
    @BodyParam() body: InputMessageType,
    @StreamParam() stream: Writable
  ) {
    // const data = await this.postUserClient.unaryRequest('GetUser', { id: 1 });

    // const iterator = this.postUserClient.serverStream('GetUserStream', {
    //   id: 1,
    // });
    //
    // for await (const data of iterator) {
    //   console.log({ data });
    //   if (data.done) break;
    // }

    const duplexStream = this.postUserClient.duplexStream(
      'GetUserDuplexStream'
    );

    duplexStream.on('data', (chunk) => {
      console.log({ chunk });
    });

    for (let i = 0; i < 5; i++) {
      duplexStream.write({ id: i });
      await new Promise((res) => setTimeout(res, 250));
    }

    duplexStream.end();

    // response.push(null);
    // data.on('data', (chunk) => {
    //   console.log(chunk);
    // });

    for (let i = 0; i < 3; i++) {
      await new Promise((res) => setTimeout(res, 1000));
      this.logger.info('Sending hello');

      const reply: ReturnMessageType = {
        status: i.toString(),
        message: {
          key: {
            message: `Hello ${body.name}`,
            status: 'OK',
          },
        },
      };

      stream.write(reply);
    }

    stream.end();
  }

  @RPC()
  @ReturnType(PingResponse)
  @ArgumentType(PingRequest, { stream: true })
  private async pingPong(
    @BodyParam() body: PingRequest,
    @StreamParam() stream: Duplex
  ): Promise<PingResponse> {
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
        myEnumProperty: MyEnum.NO,
      };
    }
  }
}
