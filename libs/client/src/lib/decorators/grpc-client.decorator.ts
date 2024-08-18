import { inject } from 'tsyringe';
import * as _ from 'lodash';

export type GrpcClientOptions = {
  useReflection?: boolean;
};

const defaultOptions: GrpcClientOptions = {
  useReflection: true,
};

export const GrpcClient = (url: string, options?: GrpcClientOptions) => {
  return (target: any, propertyKey: string, parameterIndex: number) => {
    const opts = _.defaultsDeep(defaultOptions, options);

    Reflect.defineMetadata(
      'grpc-client:' + parameterIndex,
      { parameterIndex, url, propertyKey, ...opts },
      target
    );

    inject('GRPC_CLIENT')(target, propertyKey, parameterIndex);
  };
};
