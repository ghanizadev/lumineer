import { SERVICE_RPC_TOKEN } from '../constants';
import _ = require('lodash');

export type RPCOptions = {
  returnsStream?: boolean;
};

export const RPC = (
  returnType: { new (...args: any[]): {} },
  options: RPCOptions = {}
) => {
  return (target: any, propertyKey: string) => {
    let metadata: any =
      Reflect.getMetadata(SERVICE_RPC_TOKEN + propertyKey, target) ?? {};

    metadata = { ...metadata, propertyKey, ...(options ?? {}) };

    const type: any = new returnType();

    const returnTypeMetadata = Reflect.getMetadata('type', returnType);
    const reflectKeys = Reflect.getMetadataKeys(type);

    for (const key of reflectKeys) {
      const value = Reflect.getMetadata(key, type);

      metadata = _.merge(metadata, {
        returnType: {
          metadata: returnTypeMetadata,
          [key]: value,
        },
      });
    }

    Reflect.defineMetadata(SERVICE_RPC_TOKEN + propertyKey, metadata, target);
  };
};
