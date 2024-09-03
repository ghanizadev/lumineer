import 'reflect-metadata';
import 'jest-extended';
import yargs from 'yargs';
import {
  BidirectionalStreamCall,
  ClientStreamCall,
  Lumineer,
  Message,
  NotFoundException,
  Payload,
  PropertyType,
  ServerStreamCall,
  Service,
  Stream,
  UnaryCall,
} from '@lumineer/core';
import { ServerCredentials, status } from '@grpc/grpc-js';
import createGrpcClient from './create-grpc-client';
import { Duplex, Readable, Writable } from 'node:stream';

jest.mock('yargs');

describe('RPC Decorators', () => {
  beforeAll(() => {
    (yargs as any).mockImplementation(() => ({
      argv: {
        config: './fixtures/lumineer.config.js',
        generateProtobufDefs: 1,
      },
    }));
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  @Message()
  class SampleInputMessage {
    @PropertyType('string')
    id: string;
  }

  @Message()
  class SampleReturnMessage {
    @PropertyType('string')
    username: string;
  }

  @Message()
  class ReturnMessage {
    @PropertyType('int32')
    result: number;
  }

  @Message()
  class RequestMessage {
    @PropertyType('int32')
    num: number;
  }

  @Service()
  class MyService {
    private repository = [
      { id: '0', username: 'ghanizadev' },
      { id: '1', username: 'ghaniza' },
      { id: '2', username: 'celestino' },
    ];

    @UnaryCall({ argument: SampleInputMessage, return: SampleReturnMessage })
    private async UnaryCallHandler(
      @Payload() payload: SampleInputMessage
    ): Promise<SampleReturnMessage> {
      const user = this.repository.find(({ id }) => id === payload.id);
      if (!user) throw new NotFoundException('User was not found');
      return user;
    }

    @ClientStreamCall({
      argument: SampleInputMessage,
      return: SampleReturnMessage,
    })
    private async ClientStreamCallHandler(
      @Stream() stream: Readable
    ): Promise<SampleReturnMessage[]> {
      const results: any[] = [];

      for await (const chunk of stream) {
        const user = this.repository.find(({ id }) => id === chunk.id);
        if (!user) continue;
        results.push(user);
      }

      return results[0];
    }

    @ServerStreamCall({
      argument: SampleInputMessage,
      return: SampleReturnMessage,
    })
    public async ServerStreamCallHandler(
      @Payload() payload: SampleInputMessage,
      @Stream() stream: Writable
    ) {
      for (let i = 0; i < this.repository.length; i++) {
        if (payload.id === i.toString()) continue;
        stream.write(this.repository[i]);
      }
      stream.end();
    }

    @BidirectionalStreamCall({
      argument: RequestMessage,
      return: ReturnMessage,
    })
    private async BidirectionalStreamCallHandler(@Stream() stream: Duplex) {
      stream.on('data', (chunk) => {
        stream.write({ result: chunk.num * 2 });
      });

      stream.on('end', () => {
        stream.end();
      });
    }
  }

  it('Should run the server', async () => {
    const lumineer = new Lumineer({
      services: [],
      credentials: ServerCredentials.createInsecure(),
    });

    await lumineer.run('127.0.0.1:0');
    await lumineer.isListening;
    await lumineer.close();
  });

  it('Should handle unary calls', async () => {
    const lumineer = new Lumineer({
      services: [MyService],
      credentials: ServerCredentials.createInsecure(),
    });

    await lumineer.run('127.0.0.1:0');
    await lumineer.isListening;

    const client = createGrpcClient(
      'com.package.my',
      'MyService',
      './.mytestfolder/com.package.my.proto',
      'localhost:' + lumineer.listenPort
    );
    const response = await new Promise<any>((res) => {
      client.UnaryCallHandler({ id: '0' }, (err: any, data: any) => {
        res(data);
      });
    });

    expect(response).toHaveProperty('username');
    expect(response.username).toEqual('ghanizadev');

    await lumineer.close();
  });

  it('Should handle client stream calls', async () => {
    const lumineer = new Lumineer({
      services: [MyService],
      credentials: ServerCredentials.createInsecure(),
    });

    await lumineer.run('127.0.0.1:0');
    await lumineer.isListening;

    const client = createGrpcClient(
      'com.package.my',
      'MyService',
      './.mytestfolder/com.package.my.proto',
      'localhost:' + lumineer.listenPort
    );

    const response = await new Promise<any>((res) => {
      const stream = client.ClientStreamCallHandler((err, data) => {
        if (err) throw err;
        res(data);
      });

      for (let i = 1; i < 5; i++) {
        stream.write({ id: i.toString() });
      }

      stream.end();
    });

    expect(response).toHaveProperty('username');
    expect(response.username).toEqual('ghaniza');

    await lumineer.close();
  });

  it('Should handle server stream calls', async () => {
    const lumineer = new Lumineer({
      services: [MyService],
      credentials: ServerCredentials.createInsecure(),
    });

    await lumineer.run('127.0.0.1:0');
    await lumineer.isListening;

    const client = createGrpcClient(
      'com.package.my',
      'MyService',
      './.mytestfolder/com.package.my.proto',
      'localhost:' + lumineer.listenPort
    );
    const response = await new Promise<any>(async (res) => {
      const results: any[] = [];
      const stream = client.ServerStreamCallHandler({ id: '0' });

      for await (const chunk of stream) {
        results.push(chunk);
      }

      res(results);
    });

    expect(response).toBeArray();
    expect(response).toHaveLength(2);
    expect(response[0].username).toEqual('ghaniza');
    expect(response[1].username).toEqual('celestino');

    await lumineer.close();
  });

  it('Should handle bidirectional stream calls', async () => {
    const lumineer = new Lumineer({
      services: [MyService],
      credentials: ServerCredentials.createInsecure(),
    });

    await lumineer.run('127.0.0.1:0');
    await lumineer.isListening;

    const client = createGrpcClient(
      'com.package.my',
      'MyService',
      './.mytestfolder/com.package.my.proto',
      'localhost:' + lumineer.listenPort
    );
    const response = await new Promise<any>(async (res, rej) => {
      const stream: Duplex = client.BidirectionalStreamCallHandler();
      const results: any = [];

      stream.on('data', (chunk) => {
        results.push(chunk);
      });

      stream.on('status', (responseStatus) => {
        if (responseStatus.code === status.OK) res(results);
        rej(responseStatus);
      });

      stream.on('error', (error) => {
        rej(error);
      });

      for (let i = 0; i < 5; i++) {
        stream.write({ num: i * 3 });
      }

      stream.end();
    });

    expect(response).toBeArrayOfSize(5);
    expect(response[0]?.result).toEqual(0);
    expect(response[1]?.result).toEqual(6);
    expect(response[2]?.result).toEqual(12);
    expect(response[3]?.result).toEqual(18);
    expect(response[4]?.result).toEqual(24);

    await lumineer.close();
  });
});
