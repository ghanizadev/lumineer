import { inject } from 'tsyringe';
import * as _ from 'lodash';
import { nanoid } from 'nanoid';

export type GrpcClientOptions = {
  useReflection?: boolean;
};

const defaultOptions: GrpcClientOptions = {
  useReflection: true,
};

export const GrpcClient = (clientId: string, options?: GrpcClientOptions) => {
  return (target: any, propertyKey: string, parameterIndex: number) => {
    const opts = _.defaultsDeep(defaultOptions, options);

    Reflect.defineMetadata(
      'grpc-client:' + clientId,
      { parameterIndex, propertyKey, ...opts },
      target
    );

    inject('grpc-client:' + clientId)(target, propertyKey, parameterIndex);
  };
};
