import { inject } from 'tsyringe';
import * as _ from 'lodash';

export type GrpcClientOptions = {
  useReflection?: boolean;
};

const defaultOptions: GrpcClientOptions = {
  useReflection: true,
};

export const GrpcClient = (
  clientId: string,
  serviceName: string,
  options?: GrpcClientOptions
) => {
  return (target: any, propertyKey: string, parameterIndex: number) => {
    const opts = _.defaultsDeep(defaultOptions, options);

    Reflect.defineMetadata(
      'grpc-client:' + clientId,
      { parameterIndex, propertyKey, serviceName, ...opts },
      target
    );

    inject('grpc-client:' + clientId)(target, propertyKey, parameterIndex);
  };
};
