import { SERVICE_RPC_ARGS_TOKEN } from '../constants';

/**
 * @category Decorators
 */
export const Payload = () => {
  return (target: any, propertyKey: string, parameterIndex: number) => {
    const args =
      Reflect.getMetadata(SERVICE_RPC_ARGS_TOKEN, target, propertyKey) ?? {};
    Reflect.defineMetadata(
      SERVICE_RPC_ARGS_TOKEN,
      { ...args, [parameterIndex]: { type: 'body' } },
      target,
      propertyKey
    );
  };
};

/**
 * @category Decorators
 */
export const Metadata = (): ParameterDecorator => {
  return (target: any, propertyKey: string, parameterIndex: number) => {
    const args =
      Reflect.getMetadata(SERVICE_RPC_ARGS_TOKEN, target, propertyKey) ?? {};
    Reflect.defineMetadata(
      SERVICE_RPC_ARGS_TOKEN,
      { ...args, [parameterIndex]: { type: 'metadata' } },
      target,
      propertyKey
    );
  };
};

/**
 * @category Decorators
 */
export const Stream = () => {
  return (target: any, propertyKey: string, parameterIndex: number) => {
    const args =
      Reflect.getMetadata(SERVICE_RPC_ARGS_TOKEN, target, propertyKey) ?? {};
    Reflect.defineMetadata(
      SERVICE_RPC_ARGS_TOKEN,
      { ...args, [parameterIndex]: { type: 'stream' } },
      target,
      propertyKey
    );
  };
};
