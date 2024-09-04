import { SERVICE_MESSAGE_TOKEN, SERVICE_RPC_TOKEN } from '../constants';
import * as _ from 'lodash';
import {
  RpcMessageType,
  RpcMetadata,
  ClassConstructor,
  Optional,
} from '../types';

export type RpcOptions = {
  argument: ClassConstructor;
  return: ClassConstructor;
};

export type RpcTypeOptions = Partial<RpcOptions> & {
  stream?: 'client' | 'server' | 'both';
};

const updateMessages = (type: any, typeInstance: any, target: any) => {
  let propertiesMetadata = Reflect.getMetadata(
    SERVICE_MESSAGE_TOKEN,
    typeInstance
  );
  let messageMetadata = Reflect.getMetadata(SERVICE_MESSAGE_TOKEN, type);

  const refs: Record<string, RpcMessageType> =
    Reflect.getMetadata('message:refs', typeInstance) ?? {};
  let message = _.merge(messageMetadata, propertiesMetadata, {
    refs,
  });
  let messages = Reflect.getMetadata('service:messages', target) ?? [];

  messages.push(message);

  Reflect.defineMetadata('service:messages', messages, target);
};

/**
 * @ignore
 * */
export const rpcType = (options: RpcTypeOptions = {}) => {
  return (target: any, propertyKey: string) => {
    let serviceMetadata: RpcMetadata =
      Reflect.getMetadata(SERVICE_RPC_TOKEN, target) ?? {};

    let metadata = serviceMetadata[propertyKey];

    if (!metadata) metadata = { rpcName: propertyKey };

    switch (options.stream) {
      case 'client':
        metadata.clientStream = true;
        break;
      case 'server':
        metadata.serverStream = true;
        break;
      case 'both':
        metadata.clientStream = true;
        metadata.serverStream = true;
        break;
      default:
        break;
    }

    metadata = _.merge(metadata, { ...metadata, ...(options ?? {}) });

    if (options.argument) {
      const typeInstance = new options.argument();
      const messageMetadata = Reflect.getMetadata(
        SERVICE_MESSAGE_TOKEN,
        options.argument
      );
      metadata.argumentTypeName =
        messageMetadata.typeName ?? options.argument.name;
      updateMessages(options.argument, typeInstance, target);
    }

    if (options.return) {
      const typeInstance = new options.return();
      const messageMetadata = Reflect.getMetadata(
        SERVICE_MESSAGE_TOKEN,
        options.return
      );
      metadata.returnTypeName = messageMetadata.typeName ?? options.return.name;
      updateMessages(options.return, typeInstance, target);
    }

    Reflect.defineMetadata(
      SERVICE_RPC_TOKEN,
      _.merge(serviceMetadata, { [propertyKey]: metadata }),
      target
    );
  };
};

/**
 * @category Decorators
 */
export const UnaryCall = (options?: Partial<RpcOptions>) => {
  return rpcType(options);
};

/**
 * @category Decorators
 */
export const ClientStreamCall = (options: Optional<RpcOptions, 'return'>) => {
  return rpcType({ ...options, stream: 'client' });
};

/**
 * @category Decorators
 */
export const ServerStreamCall = (options: Optional<RpcOptions, 'argument'>) => {
  return rpcType({ ...options, stream: 'server' });
};

/**
 * @category Decorators
 */
export const BidirectionalStreamCall = (options: RpcOptions) => {
  return rpcType({ ...options, stream: 'both' });
};
