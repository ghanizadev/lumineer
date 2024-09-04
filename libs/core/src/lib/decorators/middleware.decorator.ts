import * as _ from 'lodash';
import { SERVICE_MIDDLEWARE_TOKEN } from '../constants';
import { FunctionMiddleware, ClassMiddlewareType } from '../types';

/**
 * @category Decorators
 */
export const Middleware = (
  ...middleware: (
    | FunctionMiddleware
    | ClassMiddlewareType
    | InstanceType<ClassMiddlewareType>
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
