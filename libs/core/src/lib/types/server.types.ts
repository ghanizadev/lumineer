import * as gRPC from '@grpc/grpc-js';
import { ClassMiddlewareType, FunctionMiddleware } from './middleware.types';
import { ClassConstructor } from './shared.types';

export type ServerOptions = {
  /**
   * Services to be included in this server
   * */
  services: ClassConstructor[];
  /**
   * Providers to be included in this server
   * */
  providers?: {
    /**
     * Token to be injected during runtime
     * */
    provide: ClassConstructor | string;
    /**
     * Provide this token with a value. If a `Promise` is used, the server will
     * await its completion before starting the server
     * */
    useValue?: any | Promise<any>;
    /**
     * Instantiate the given class to provide a value for this token
     * */
    useClass?: ClassConstructor;
  }[];
  /**
   * Server credentials to be used by the core gRPC Server
   * */
  credentials: gRPC.ServerCredentials;
};

/**
 * @category Types
 * */
export type ServiceConfig = {
  name: string;
  serviceClass: ClassConstructor;
  instance: any;
  middlewares?: {
    [key: string]: (FunctionMiddleware | ClassMiddlewareType)[];
  };
};
