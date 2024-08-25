import * as gRPC from '@grpc/grpc-js';
import { Duplex, Readable, Writable } from 'node:stream';
import {
  ServiceClientConfig,
  ServiceClientHandler,
  ServiceClientImpl,
} from './types';
import * as _ from 'lodash';
import { InternalException } from '@cymbaline/core';

export class GrpcServiceClient {
  private serviceImpl: ServiceClientImpl | undefined;
  private connected = false;

  constructor(
    private readonly serviceConfig: ServiceClientConfig,
    private readonly pkg: any
  ) {
    this.setup(this.serviceConfig.failOnLoad);
  }

  private setup(shouldThrowError = true) {
    try {
      let Service = _.get(
        this.pkg,
        `${this.serviceConfig.packageName}.${this.serviceConfig.serviceName}`
      );

      if (!Service) throw new Error('Service does not exist');

      let credentials: gRPC.ChannelCredentials;
      if (this.serviceConfig.credentials) {
        //TODO: Log a warn about missing credentials
        credentials = this.serviceConfig.credentials;
      } else {
        credentials = gRPC.credentials.createInsecure();
      }

      this.serviceImpl = new Service(this.serviceConfig.url, credentials);
      this.connected = true;
      return true;
    } catch (e) {
      if (shouldThrowError) throw e;
      return false;
    }
  }

  private getHandler(handler: ServiceClientHandler | string) {
    if (!this.connected) {
      throw new InternalException('This service is offline');
    }

    let fn: ServiceClientHandler;

    if (typeof handler === 'string')
      fn = this.serviceImpl[handler] as ServiceClientHandler;
    else fn = handler;

    if (!fn) throw new Error('Service handler not found');
    return fn.bind(this.serviceImpl);
  }

  public async unaryRequest<T = any, U = any>(
    handler: ServiceClientHandler | string,
    request?: T
  ): Promise<U> {
    const fn = this.getHandler(handler);

    return new Promise((resolve, reject) => {
      fn(request ?? {}, (error, response) => {
        if (error) reject(error);
        else resolve(response);
      });
    });
  }

  public clientStream(handler: ServiceClientHandler | string): {
    callStream: Writable;
    responseStream: Readable;
    response: Promise<any>;
  } {
    const fn = this.getHandler(handler);
    const responseStream = new Readable({
      read(size: number) {
        return true;
      },
      objectMode: true,
    });
    const callStream: Writable = fn((error, data) => {
      if (error) throw new Error(error);
      responseStream.push(data);
      responseStream.push(null);
    });

    const response = new Promise((resolve, reject) =>
      responseStream.on('data', (chunk) => {
        resolve(chunk);
      })
    );

    return { callStream, responseStream, response };
  }

  public async *serverStream<T = any, U = any>(
    handler: ServiceClientHandler | string,
    request?: T
  ): AsyncGenerator<{ done?: boolean; data: U }> {
    const fn = this.getHandler(handler);
    const stream: Readable = fn(request);

    for await (const chunk of stream) {
      yield { data: chunk };
    }
  }

  public duplexStream(
    handler: ServiceClientHandler | string,
    request?: any
  ): Duplex {
    const fn = this.getHandler(handler);
    const stream: Duplex = fn();
    if (request) stream.write(request);
    return stream;
  }

  get service() {
    if (!this.connected) {
      if (!this.setup())
        throw new InternalException('Service appears to be offline');
    }
    return this.serviceImpl;
  }
}
