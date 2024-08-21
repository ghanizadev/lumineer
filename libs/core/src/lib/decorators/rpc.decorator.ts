import { SERVICE_MESSAGE_TOKEN, SERVICE_RPC_TOKEN } from '../constants';
import * as _ from 'lodash';
import { RpcMessageType, RpcMetadata } from '../types/message.types';

export type RpcOptions = {};

export type ArgumentOptions = {
  stream?: boolean;
};

export const RPC = (options: RpcOptions = {}) => {
  return (target: any, propertyKey: string) => {
    let metadata: RpcMetadata = Reflect.getMetadata(
      SERVICE_RPC_TOKEN + propertyKey,
      target
    );

    if (!metadata) metadata = { rpcName: propertyKey };

    metadata = _.merge(metadata, { ...metadata, ...(options ?? {}) });

    Reflect.defineMetadata(SERVICE_RPC_TOKEN + propertyKey, metadata, target);
  };
};

const rpcMessageType =
  (
    type: { new (...args: any[]): {} },
    argType: 'return' | 'argument',
    options?: ArgumentOptions
  ) =>
  (target: any, propertyKey: string) => {
    let metadata: Record<string, RpcMetadata> =
      Reflect.getMetadata(SERVICE_RPC_TOKEN, target) ?? {};

    if (!metadata) {
      throw new Error('Missing the RPC decorator?');
    }

    let rpcMetadata = metadata[propertyKey];

    if (!rpcMetadata) {
      rpcMetadata = {
        ...rpcMetadata,
        rpcName: propertyKey,
      };
    }

    if (options?.stream) {
      if (argType === 'argument')
        rpcMetadata = {
          ...rpcMetadata,
          clientStream: true,
        };
      else
        rpcMetadata = {
          ...rpcMetadata,
          serverStream: true,
        };
    }

    rpcMetadata[argType + 'TypeName'] = type.name;

    metadata = _.merge(metadata, { [propertyKey]: rpcMetadata });
    Reflect.defineMetadata(SERVICE_RPC_TOKEN, metadata, target);

    const typeInstance = new type();
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

export const ArgumentType = (
  argumentType: { new (...args: any[]): {} },
  options?: ArgumentOptions
) => {
  return rpcMessageType(argumentType, 'argument', options);
};

export const ReturnType = (
  returnType: { new (...args: any[]): {} },
  options?: ArgumentOptions
) => {
  return rpcMessageType(returnType, 'return', options);
};
