import { SERVICE_RPC_ARGS_TOKEN, SERVICE_RPC_TOKEN } from '../constants';

export const BodyParam = () => {
  return (target: any, propertyKey: string, parameterIndex: number) => {
    let metadata =
      Reflect.getMetadata(SERVICE_RPC_TOKEN + propertyKey, target) ?? {};

    const args =
      Reflect.getMetadata(SERVICE_RPC_ARGS_TOKEN, target, propertyKey) ?? {};
    Reflect.defineMetadata(
      SERVICE_RPC_ARGS_TOKEN,
      { ...args, [parameterIndex]: { type: 'body' } },
      target,
      propertyKey
    );
    Reflect.defineMetadata(SERVICE_RPC_TOKEN + propertyKey, metadata, target);
  };
};

export const MetadataParam = () => {
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

export const StreamParam = () => {
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
