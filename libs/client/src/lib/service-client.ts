import * as gRPC from '@grpc/grpc-js';

export class GrpcServiceClient {
  constructor(
    private readonly clientId: string,
    private readonly url: string,
    private readonly config: any
  ) {}

  private async handleUnaryRequest(
    fn: (...args: any[]) => void,
    request?: any
  ): Promise<any> {
    return new Promise((resolve) => {
      fn(request ?? {}, (error, response) => {
        resolve(response);
      });
    });
  }

  private async handleClientStreaming(
    fn: (...args: any[]) => void,
    request: any
  ): Promise<any> {
    throw new Error('Not implemented');
  }

  private async handleServerStreaming(
    fn: (...args: any[]) => void,
    request: any
  ): Promise<any> {
    throw new Error('Not implemented');
  }

  private async handleDuplexStreaming(
    fn: (...args: any[]) => void,
    request: any
  ): Promise<any> {
    throw new Error('Not implemented');
  }

  public async invoke<T = any>(
    servicePath: string,
    functionName: string,
    request?: any
  ): Promise<T> {
    const evaluate = new Function('pkg', `return pkg.${servicePath}`);
    let Service = evaluate(this.config.pkg);

    if (!Service) throw new Error('Service does not exist');

    let credentials: gRPC.ChannelCredentials;
    if (this.config.clients[this.clientId].credentials) {
      //TODO: Log a warn about missing credentials
      credentials = this.config.clients[this.clientId].credentials;
    } else {
      credentials = gRPC.credentials.createInsecure();
    }

    const service = new Service(this.url, credentials);
    const functionInstance = service[functionName];
    if (!functionInstance) throw new Error('Function does not exist');

    const { requestStream, responseStream } = service[functionName];
    const fn = service[functionName].bind(service);

    if (!requestStream)
      if (!responseStream) return this.handleUnaryRequest(fn, request);
      else return this.handleClientStreaming(fn, request);

    if (responseStream) return this.handleServerStreaming(fn, request);
    return this.handleDuplexStreaming(fn, request);
  }
}
