import * as gRPC from '@grpc/grpc-js';
import {
  GRPCClassMiddlewareType,
  GRPCFunctionMiddleware,
} from './middleware.types';
import { ClassConstructor } from './shared.types';

export type GRPCServerOptions = {
  /*
   * Services to be included in this server
   * */
  services: ClassConstructor[];
  /*
   * Providers to be included in this server
   * */
  providers?: {
    /*
     * Token to be injected during runtime
     * */
    provide: ClassConstructor | string;
    /*
     * Provide this token with a value. If a `Promise` is used, the server will
     * await its completion before starting the server
     * */
    useValue?: any | Promise<any>;
    /*
     * Instantiate the given class to provide a value for this token
     * */
    useClass?: ClassConstructor;
  }[];
  /*
   * Server configuration
   * */
  config?: {
    /*
     * Proto file configuration
     * */
    proto?: {
      /*
       * Generate proto file base on the defined schema
       * */
      generate?: boolean;
      /*
       * Path to save the proto definition. Defaults to `<rootDir>/.lumineer`
       * */
      path?: string;
      /*
       * File name to be used for the default proto file. Defaults to `{packageName}.proto`
       * */
      file?: string;
    };
    /*
     * Use `stdout` logging
     * */
    logger?: boolean;
    /*
     * Package name. Defaults to `app`
     * */
    packageName?: string;
    /*
     * Server credentials to be used by the server to instantiate the gRPC services
     * */
    credentials: gRPC.ServerCredentials;
  };
};

export type ServiceConfig = {
  name: string;
  serviceClass: ClassConstructor;
  instance: any;
  middlewares?: {
    [key: string]: (GRPCFunctionMiddleware | GRPCClassMiddlewareType)[];
  };
};
