import { SERVICE_RPC_ARGS_TOKEN } from '../constants';

export const Metadata = () => {
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
