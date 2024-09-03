import * as gRPC from '@grpc/grpc-js';
import { InternalException } from '@lumineer/core';
import { Logger } from '@lumineer/logger';
import { SERVICE_RPC_ARGS_TOKEN } from './constants';
import { RpcMetadata } from './types';
import { ExceptionHandler } from './exception-handler';

export type HandlerContext = {
  data: any;
  metadata: RpcMetadata;
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
    const args = this.makeArguments(call, data.instance, metadata.rpcName);
    const fn = data.instance[metadata.rpcName].bind(data.instance);

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
      `RPC to ${data.name}.${metadata.rpcName} done in ${(end - start).toFixed(
        3
      )}ms`
    );
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

  private getRequestType(serviceMetadata: RpcMetadata) {
    if (serviceMetadata.serverStream) {
      if (serviceMetadata.clientStream) return 'bidirectionalStream';
      return 'serverStream';
    }
    if (serviceMetadata.clientStream) return 'clientStream';
    return 'unary';
  }

  private async handleBidirectionalStreamingCall(
    fn: any,
    args: any[],
    call: HandlerCall
  ) {
    const { data, metadata } = this.handlerContext;

    const argMetadata = Reflect.getMetadata(
      SERVICE_RPC_ARGS_TOKEN,
      data.instance,
      metadata.rpcName
    );

    let hasStream = false;
    for (const key in argMetadata) {
      if (argMetadata[key].type === 'body') {
        throw new InternalException(
          'Seems you are trying to access the payload from a bidirectional stream type call. Maybe you wanted to use the "stream" parameter instead.'
        );
      } else if (argMetadata[key].type === 'stream') {
        hasStream = true;
      }
    }

    if (!hasStream)
      this.logger.warn(
        `The "${metadata.rpcName}" call method is type of bidirectional stream, but does not load any stream argument. Did you forget to load?`
      );

    await Promise.resolve(fn(...args));
  }

  private async handleServerStreamingCall(
    fn: any,
    args: any[],
    call: HandlerCall
  ) {
    // TODO implement async generators
    await Promise.resolve(fn(...args));
  }

  private async handleClientStreamingCall(
    fn: any,
    args: any[],
    _: HandlerCall,
    callback: HandlerCallback
  ) {
    const { data, metadata } = this.handlerContext;

    const argMetadata = Reflect.getMetadata(
      SERVICE_RPC_ARGS_TOKEN,
      data.instance,
      metadata.rpcName
    );

    let hasStream = false;
    for (const key in argMetadata) {
      if (argMetadata[key].type === 'body') {
        throw new InternalException(
          'Seems you are trying to access the payload from a client stream type call. Maybe you wanted to use the "stream" parameter instead.'
        );
      } else if (argMetadata[key].type === 'stream') {
        hasStream = true;
      }
    }

    if (!hasStream)
      this.logger.warn(
        `The "${metadata.rpcName}" call method is type of client stream, but does not load any stream argument. Did you forget to load?`
      );

    const response = await Promise.resolve(fn(...args));
    if (response) {
      callback(null, response);
    }
  }

  private async handleUnaryCall(
    fn: any,
    args: any[],
    _: HandlerCall,
    callback: HandlerCallback
  ) {
    const response = await Promise.resolve(fn(...args));
    callback(null, response);
  }
}
