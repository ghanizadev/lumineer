import 'reflect-metadata';
import 'jest-extended';

import {
  AbortedException,
  AlreadyExistsException,
  DataLossException,
  DeadlineExceededException,
  FailedPreconditionException,
  InternalException,
  InvalidArgumentException,
  Lumineer,
  Message,
  NotFoundException,
  OutOfRangeException,
  Payload,
  PermissionDeniedException,
  PropertyType,
  ResourceExhaustedException,
  Service,
  UnaryCall,
  UnauthenticatedException,
  UnimplementedException,
  UnknownException,
} from '@lumineer/core';
import { ServerCredentials } from '@grpc/grpc-js';
import createGrpcClient from './create-grpc-client';
import yargs from 'yargs';

jest.mock('yargs');

describe('Exceptions', () => {
  @Message()
  class MyInput {
    @PropertyType('string')
    error: string;
  }

  @Message()
  class MyOutput {
    @PropertyType('bool')
    success: boolean;
  }

  @Service()
  class MyService {
    @UnaryCall({ argument: MyInput, return: MyOutput })
    private MyRPC(@Payload() payload: MyInput) {
      switch (payload.error) {
        case 'aborted':
          throw new AbortedException();
        case 'already-exists':
          throw new AlreadyExistsException();
        case 'data-loss':
          throw new DataLossException();
        case 'deadline-exceeded':
          throw new DeadlineExceededException();
        case 'failed-precondition':
          throw new FailedPreconditionException();
        case 'internal':
          throw new InternalException();
        case 'invalid-argument':
          throw new InvalidArgumentException();
        case 'not-found':
          throw new NotFoundException();
        case 'out-of-range':
          throw new OutOfRangeException();
        case 'permission-denied':
          throw new PermissionDeniedException();
        case 'resource-exhausted':
          throw new ResourceExhaustedException();
        case 'unauthenticated':
          throw new UnauthenticatedException();
        case 'unimplemented':
          throw new UnimplementedException();
        case 'unknown':
          throw new UnknownException();
        default:
          return { success: true };
      }
    }
  }

  let lumineer: Lumineer;
  let client: any;

  beforeAll(async () => {
    (yargs as any).mockImplementation(() => ({
      argv: {
        config: './fixtures/exception.config.js',
        generateProtobufDefs: 1,
      },
    }));

    lumineer = new Lumineer({
      services: [MyService],
      credentials: ServerCredentials.createInsecure(),
    });

    await lumineer.run('0.0.0.0:0');
    await lumineer.isListening;

    client = createGrpcClient(
      'exception',
      'MyService',
      '.exception/exception.proto',
      'localhost:' + lumineer.listenPort
    );
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  it('should handle ABORTED exception', async () => {
    const { error, data } = await new Promise<any>((res) => {
      client.MyRPC({ error: 'aborted' }, (error?: any, data?: any) => {
        res({ error, data });
      });
    });

    expect(error).toBeDefined();
    expect(data).not.toBeDefined();
    expect(error.message).toEqual('10 ABORTED: Unknown Error');
  });

  it('should handle ALREADY_EXISTS exception', async () => {
    const { error, data } = await new Promise<any>((res) => {
      client.MyRPC({ error: 'already-exists' }, (error?: any, data?: any) => {
        res({ error, data });
      });
    });

    expect(error).toBeDefined();
    expect(data).not.toBeDefined();
    expect(error.message).toEqual('6 ALREADY_EXISTS: Unknown Error');
  });

  it('should handle UNKNOWN exception', async () => {
    const { error, data } = await new Promise<any>((res) => {
      client.MyRPC({ error: 'unknown' }, (error?: any, data?: any) => {
        res({ error, data });
      });
    });

    expect(error).toBeDefined();
    expect(data).not.toBeDefined();
    expect(error.message).toEqual('2 UNKNOWN: Unknown Error');
  });

  it('should handle INVALID_ARGUMENT exception', async () => {
    const { error, data } = await new Promise<any>((res) => {
      client.MyRPC({ error: 'invalid-argument' }, (error?: any, data?: any) => {
        res({ error, data });
      });
    });

    expect(error).toBeDefined();
    expect(data).not.toBeDefined();
    expect(error.message).toEqual('3 INVALID_ARGUMENT: Unknown Error');
  });

  it('should handle DEADLINE_EXCEEDED exception', async () => {
    const { error, data } = await new Promise<any>((res) => {
      client.MyRPC(
        { error: 'deadline-exceeded' },
        (error?: any, data?: any) => {
          res({ error, data });
        }
      );
    });

    expect(error).toBeDefined();
    expect(data).not.toBeDefined();
    expect(error.message).toEqual('4 DEADLINE_EXCEEDED: Unknown Error');
  });
});
