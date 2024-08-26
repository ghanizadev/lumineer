import { SERVICE_MESSAGE_TOKEN } from '../constants';
import { RpcMessageType } from '../types';
import * as _ from 'lodash';

export type TypeOptions = {
  typeName?: string;
};

export const Message = (options?: TypeOptions) => {
  return (target: { new (...args: any[]): {} }) => {
    let metadata: RpcMessageType =
      Reflect.getMetadata(SERVICE_MESSAGE_TOKEN, target) ?? {};

    metadata = {
      ...metadata,
      type: 'message',
      typeName: target.name,
    };

    if (options) {
      metadata = _.merge(metadata, options);
    }

    Reflect.defineMetadata(SERVICE_MESSAGE_TOKEN, metadata, target);
  };
};

export const Enum = (options?: TypeOptions) => {
  return (target: { new (...args: any[]): {} }) => {
    let metadata: RpcMessageType =
      Reflect.getMetadata(SERVICE_MESSAGE_TOKEN, target) ?? {};

    if (!Object.keys(target).length)
      throw new Error('Enum keys must be static');

    metadata = {
      ...metadata,
      type: 'enum',
      typeName: target.name,
      blockScoped: false,
      properties: Object.keys(target)
        .map((key) => ({ propertyName: key, type: 'string' }))
        .reduce((p, c) => ({ ...p, [c.propertyName]: c }), {}),
    };

    if (options) {
      metadata = _.merge(metadata, options);
    }

    Reflect.defineMetadata(SERVICE_MESSAGE_TOKEN, metadata, target);
  };
};
