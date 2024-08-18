import * as gRPC from '@grpc/grpc-js';
import { SERVICE_RPC_ARGS_TOKEN } from './constants';
import { Logger } from '@cymbaline/logger';

export type HandlerContext = {
  data: any;
  metadata: any;
};

export type HandlerCall<T = any> = T;

export type HandlerCallback = (
  err: any,
  response?: any
) => Promise<void> | void;

export class Handler {
  private readonly logger: Logger;
  constructor(private readonly handlerContext: HandlerContext) {
    this.logger = new Logger('Server');
  }

  async invoke(call: HandlerCall, callback: HandlerCallback) {
    const { data, metadata } = this.handlerContext;

    const start = performance.now();

    try {
      const args = this.makeArguments(
        call,
        data.instance,
        metadata.propertyKey
      );

      const fn = data.instance[metadata.propertyKey].bind(data.instance);

      switch (this.getRequestType(metadata)) {
        case 'bidirectionalStream':
          await this.handleBidirectionalStreamingCall(fn, args, call);
          break;
        case 'clientStream':
          await this.handleClientStreamingCall(fn, args, call, callback);
          break;
        case 'serverStream':
          await this.handleServerStreamingCall(fn, args, call);
          break;
        case 'unary':
          await this.handleUnaryCall(fn, args, call, callback);
          break;
      }

      const end = performance.now();

      this.logger.info(
        `RPC to ${data.name}.${metadata.propertyKey} done in ${(
          end - start
        ).toFixed(3)}ms`
      );
    } catch (e) {
      if (callback) {
        callback(e);
      } else {
        call.emit('error', { status: gRPC.status.INTERNAL });
      }
      this.logger.error(
        `RPC to ${data.name}.${metadata.propertyKey} failed: ${e}`
      );
    }
  }

  private makeArguments(call: any, instance: any, handlerName: string) {
    const args = Reflect.getMetadata(
      SERVICE_RPC_ARGS_TOKEN,
      instance,
      handlerName
    );
    const result: any[] = new Array(instance[handlerName].length);

    for (let i = 0; i < result.length; i++) {
      if (args[i]) {
        const { type } = args[i];

        switch (type) {
          case 'body':
            result[i] = call.request;
            break;
          case 'metadata':
            result[i] = call.metadata;
            break;
          case 'stream':
            result[i] = call;
            break;
          default:
            break;
        }
      }
    }

    return result;
  }

  private getRequestType(serviceMetadata: any) {
    if (serviceMetadata.returnType.metadata.stream) {
      if (serviceMetadata.inputType.metadata.stream)
        return 'bidirectionalStream';

      return 'serverStream';
    }

    if (serviceMetadata.inputType.metadata.stream) return 'clientStream';

    return 'unary';
  }

  private async handleBidirectionalStreamingCall(
    fn: any,
    args: any[],
    call: HandlerCall
  ) {
    const { data, metadata } = this.handlerContext;

    try {
      call.on('data', async (chunk: any) => {
        const argMetadata = Reflect.getMetadata(
          SERVICE_RPC_ARGS_TOKEN,
          data.instance,
          metadata.propertyKey
        );

        let bodyIndex = -1;

        for (const key in argMetadata) {
          if (argMetadata[key].type === 'body') {
            bodyIndex = +key;
            break;
          }
        }

        if (bodyIndex !== -1) {
          let updatedArgs = [...args];
          updatedArgs[bodyIndex] = chunk;
          fn(...updatedArgs);
        }
      });
    } catch (e) {
      call.emit('error', { code: gRPC.status.INTERNAL, message: e.message });
      this.logger.error(
        `RPC to ${data.name}.${metadata.propertyKey} failed: ${e}`
      );
    }
  }

  private async handleServerStreamingCall(
    fn: any,
    args: any[],
    call: HandlerCall
  ) {
    const { metadata, data } = this.handlerContext;

    try {
      if (fn.constructor.name.includes('GeneratorFunction')) {
        for await (const response of fn(...args)) {
          call.write(response);
        }
        call.end();
      } else {
        await Promise.resolve(fn(...args));
      }
    } catch (e) {
      this.logger.error(
        `RPC to ${data.name}.${metadata.propertyKey} failed: ${e}`
      );
      call.emit('error', { code: gRPC.status.INTERNAL });
    }
  }

  private async handleClientStreamingCall(
    fn: any,
    args: any[],
    call: HandlerCall,
    callback: HandlerCallback
  ) {
    const { data, metadata } = this.handlerContext;
    try {
      call.on('data', async (chunk: any) => {
        const argMetadata = Reflect.getMetadata(
          SERVICE_RPC_ARGS_TOKEN,
          data.instance,
          metadata.propertyKey
        );

        let bodyIndex = -1;

        for (const key in argMetadata) {
          if (argMetadata[key].type === 'body') {
            bodyIndex = +key;
            break;
          }
        }

        if (bodyIndex !== -1) {
          let updatedArgs = [...args];
          updatedArgs[bodyIndex] = chunk;
          const response = await Promise.resolve(fn(...updatedArgs));
          if (response) {
            callback(null, response);
          }
        }
      });
    } catch (e) {
      callback(e);
      this.logger.error(
        `RPC to ${data.name}.${metadata.propertyKey} failed: ${e}`
      );
    }
  }

  private async handleUnaryCall(
    fn: any,
    args: any[],
    _call: HandlerCall,
    callback: HandlerCallback
  ) {
    const { metadata, data } = this.handlerContext;
    try {
      const response = await Promise.resolve(fn(...args));
      callback(null, response);
    } catch (e) {
      callback(e);
      this.logger.error(
        `RPC to ${data.name}.${metadata.propertyKey} failed: ${e}`
      );
    }
  }
}
