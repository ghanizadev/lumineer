import type { GrpcClientPlugin } from './client';
import { credentials } from '@grpc/grpc-js';

export class GrpcServiceClient {
  constructor(private readonly clientPlugin: GrpcClientPlugin) {}

  private async handleUnaryRequest(fn: (...args: any[]) => void, request: any) {
    return new Promise((resolve) => {
      fn(request, (error, response) => {
        resolve(response);
      });
    });
  }

  private async handleClientStreaming(
    fn: (...args: any[]) => void,
    request: any
  ) {
    throw new Error('Not implemented');
  }

  private async handleServerStreaming(
    fn: (...args: any[]) => void,
    request: any
  ) {
    throw new Error('Not implemented');
  }

  private async handleDuplexStreaming(
    fn: (...args: any[]) => void,
    request: any
  ) {
    throw new Error('Not implemented');
  }

  public async invoke(servicePath: string, functionName: string, request: any) {
    const config = this.clientPlugin.getClientConfiguration()['grpc-client:1'];

    const subPaths = servicePath.split('.');

    let prevObject = config.pkg;
    for (const subPath of subPaths) {
      if (subPath) prevObject = prevObject[subPath];
    }

    const service = new prevObject(config.url, credentials.createInsecure());
    const { requestStream, responseStream } = service[functionName];
    const fn = service[functionName].bind(service);

    if (!requestStream && !responseStream)
      return this.handleUnaryRequest(fn, request);
    if (requestStream && !responseStream)
      return this.handleClientStreaming(fn, request);
    if (!requestStream && responseStream)
      return this.handleServerStreaming(fn, request);
    return this.handleDuplexStreaming(fn, request);
  }
}
