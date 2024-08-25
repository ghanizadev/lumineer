import * as gRPC from '@grpc/grpc-js';

export type ServiceClientConfig = {
  clientId: string;
  url: string;
  serviceName: string;
  packageName: string;
  credentials?: gRPC.ChannelCredentials;
  failOnLoad?: boolean;
};

export type ServiceClientHandler = (...args: any[]) => any | Promise<any>;

export type ServiceClientImpl = {
  [key: string]: ServiceClientHandler;
};
