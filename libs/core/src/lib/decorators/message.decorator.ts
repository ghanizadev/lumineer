import { SERVICE_MESSAGE_TOKEN } from '../constants';
import { RpcMessageType } from '../types/message.types';
import * as _ from 'lodash';

export type TypeOptions = {
  typeName?: string;
};

export const Message = (options?: TypeOptions) => {
  return (constructor: { new (...args: any[]): {} }) => {
    let metadata: RpcMessageType = Reflect.getMetadata(
      SERVICE_MESSAGE_TOKEN,
      constructor
    );

    if (!metadata) {
      metadata = {
        type: 'message',
        typeName: constructor.name,
        properties: {},
        messages: [],
      };
    }

    if (options) {
      metadata = _.merge(metadata, options);
    }

    Reflect.defineMetadata(SERVICE_MESSAGE_TOKEN, metadata, constructor);
  };
};

export const Enum = (options?: TypeOptions) => {
  return (constructor: { new (...args: any[]): {} }) => {
    let metadata: RpcMessageType = Reflect.getMetadata(
      SERVICE_MESSAGE_TOKEN,
      constructor
    );

    if (!metadata) {
      metadata = {
        type: 'enum',
        typeName: constructor.name,
        properties: {},
        messages: [],
      };
    }

    if (options) {
      metadata = _.merge(metadata, options);
    }

    Reflect.defineMetadata(SERVICE_MESSAGE_TOKEN, metadata, constructor);
  };
};

export const OneOf = (options?: TypeOptions) => {
  return (constructor: { new (...args: any[]): {} }) => {
    let metadata: RpcMessageType = Reflect.getMetadata(
      SERVICE_MESSAGE_TOKEN,
      constructor
    );

    if (!metadata) {
      metadata = {
        type: 'oneof',
        typeName: constructor.name,
        properties: {},
        messages: [],
      };
    }

    if (options) {
      metadata = _.merge(metadata, options);
    }

    Reflect.defineMetadata(SERVICE_MESSAGE_TOKEN, metadata, constructor);
  };
};
