import * as _ from 'lodash';
import { SERVICE_MIDDLEWARE_TOKEN } from '../constants';
import { GRPCFunctionMiddleware, GRPCClassMiddlewareType } from '../types';

export const Middleware = (
  ...middleware: (
    | GRPCFunctionMiddleware
    | GRPCClassMiddlewareType
    | InstanceType<GRPCClassMiddlewareType>
  )[]
) => {
  return (target: any, propertyKey?: string) => {
    const middlewares = Reflect.getMetadata(SERVICE_MIDDLEWARE_TOKEN, target);
    Reflect.defineMetadata(
      SERVICE_MIDDLEWARE_TOKEN,
      _.merge(middlewares ?? {}, { [propertyKey ?? '*']: middleware }),
      target
    );
  };
};
