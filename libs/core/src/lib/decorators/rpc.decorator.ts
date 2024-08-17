import { SERVICE_SERVER_RPC_TOKEN } from '../constants';
import _ = require('lodash');

export type RPCOptions = {};

export type RPCArgumentType = {};

export const RPCServerFunction = (options: RPCOptions = {}) => {
  return (target: any, propertyKey: string) => {
    let metadata: any =
      Reflect.getMetadata(SERVICE_SERVER_RPC_TOKEN + propertyKey, target) ?? {};
    metadata = { ...metadata, propertyKey, ...(options ?? {}) };
    Reflect.defineMetadata(
      SERVICE_SERVER_RPC_TOKEN + propertyKey,
      metadata,
      target
    );
  };
};

const RPCMessageType =
  (Type: { new (...args: any[]): {} }, argType: 'return' | 'input') =>
  (target: any, propertyKey: string) => {
    let metadata = Reflect.getMetadata(
      SERVICE_SERVER_RPC_TOKEN + propertyKey,
      target
    );

    if (!metadata) {
      throw new Error('Missing the RPC decorator?');
    }

    metadata = { ...metadata, propertyKey };

    const type: any = new Type();

    const typeClassMetadata = Reflect.getMetadata('type', Type);
    const instanceKeys = Reflect.getMetadataKeys(type);

    for (const key of instanceKeys) {
      const value = Reflect.getMetadata(key, type);

      metadata = _.merge(metadata, {
        [argType + 'Type']: {
          metadata: typeClassMetadata,
          [key]: value,
        },
      });
    }

    Reflect.defineMetadata(
      SERVICE_SERVER_RPC_TOKEN + propertyKey,
      metadata,
      target
    );
  };

export const ArgumentType = (argumentType: { new (...args: any[]): {} }) => {
  return RPCMessageType(argumentType, 'input');
};

export const ReturnType = (returnType: { new (...args: any[]): {} }) => {
  return RPCMessageType(returnType, 'return');
};
