import { SERVICE_RPC_ARGS_TOKEN, SERVICE_RPC_TOKEN } from '../constants';
import * as _ from 'lodash';

export const BodyParam = (bodyType: { new (...args: any[]): {} }) => {
  return (target: any, propertyKey: string, parameterIndex: number) => {
    let metadata =
      Reflect.getMetadata(SERVICE_RPC_TOKEN + propertyKey, target) ?? {};

    const type = new bodyType();

    const bodyTypeMetadata = Reflect.getMetadata('type', bodyType);
    const reflectKeys = Reflect.getMetadataKeys(type);

    for (const key of reflectKeys) {
      const value = Reflect.getMetadata(key, type);

      metadata = _.merge(metadata, {
        inputType: {
          metadata: bodyTypeMetadata,
          [key]: value,
        },
      });
    }

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
