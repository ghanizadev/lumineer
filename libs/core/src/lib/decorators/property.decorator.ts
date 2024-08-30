import { SERVICE_MESSAGE_TOKEN } from '../constants';
import { RpcMessageType, RpcProperty, RpcScalar } from '../types/message.types';
import * as _ from 'lodash';
import { ClassConstructor } from '../types';

export type DecoratorFunction = (target: any, propertyKey: string) => void;

export type TransformFunction<T = any> = (
  value: T,
  options: PropertyTypeOptions
) => T;

export type PropertyTypeOptions = {
  repeated?: boolean;
  optional?: boolean;
};

export type PropertyTypeMapOptions = {
  key: Omit<RpcScalar, 'float' | 'double' | 'bytes'>;
  value: RpcScalar | { new (...args: any[]): {} };
};

export type PropertyRefOptions = {
  blockScoped?: boolean;
  repeated?: boolean;
  optional?: boolean;
};

export function PropertyType(
  type: 'string',
  options?: PropertyTypeOptions,
  transform?: TransformFunction<string>
): DecoratorFunction;

export function PropertyType(
  type:
    | 'int32'
    | 'uint32'
    | 'sint32'
    | 'fixed32'
    | 'sfixed32'
    | 'int64'
    | 'uint64'
    | 'sint64'
    | 'fixed64'
    | 'sfixed64'
    | 'float'
    | 'double',
  options?: PropertyTypeOptions,
  transform?: TransformFunction<number>
): DecoratorFunction;

export function PropertyType(
  type: 'float' | 'double' | 'int32' | 'int64',
  options?: PropertyTypeOptions,
  transform?: TransformFunction<number>
): DecoratorFunction;

export function PropertyType(
  type: 'bool',
  options?: PropertyTypeOptions,
  transform?: TransformFunction<boolean>
): DecoratorFunction;

export function PropertyType(
  type: 'bytes',
  options?: PropertyTypeOptions,
  transform?: TransformFunction<Buffer | Uint8Array>
): DecoratorFunction;

export function PropertyType(
  type: 'unknown',
  options?: PropertyTypeOptions,
  transform?: TransformFunction
): DecoratorFunction;

export function PropertyType(
  type: 'map',
  options: PropertyTypeOptions & PropertyTypeMapOptions,
  transform?: TransformFunction
): DecoratorFunction;

export function PropertyType(
  type: RpcScalar | 'map',
  options?: PropertyTypeOptions & PropertyTypeMapOptions,
  transform?: TransformFunction
): DecoratorFunction {
  return (target, propertyName) => {
    return propertyTypeImpl(target, propertyName, type, options, transform);
  };
}

function propertyTypeImpl(
  target: any,
  propertyName: string,
  type: RpcScalar | 'map',
  options?: PropertyTypeOptions & Partial<PropertyTypeMapOptions>,
  transform?: TransformFunction
) {
  let metadata: RpcMessageType = Reflect.getMetadata(
    SERVICE_MESSAGE_TOKEN,
    target
  );
  let property: RpcProperty = { type, propertyName };

  if (options) {
    property = _.merge(property, options);
  }

  if (transform) {
    property = transform(property, options);
  }

  if (type === 'map') {
    property.map = [options.key, options.value];

    if (typeof options.value !== 'string') {
      const typeInstance = new options.value();
      let propertiesMetadata = Reflect.getMetadata(
        SERVICE_MESSAGE_TOKEN,
        typeInstance
      );
      let messageMetadata = Reflect.getMetadata(
        SERVICE_MESSAGE_TOKEN,
        options.value
      );
      let message = _.merge(messageMetadata, propertiesMetadata);
      let messages = Reflect.getMetadata('service:messages', target) ?? [];

      messages.push(message);

      Reflect.defineMetadata('service:messages', messages, target);
    }
  }

  metadata = _.merge(metadata, {
    properties: {
      [propertyName]: property,
    },
  });

  Reflect.defineMetadata(SERVICE_MESSAGE_TOKEN, metadata, target);
}

export const MessageRef = (
  ref: ClassConstructor,
  options: PropertyRefOptions = {}
) => {
  return (target: any, propertyKey: string) => {
    const typeInstance = new ref();

    let propertiesMetadata = Reflect.getMetadata(
      SERVICE_MESSAGE_TOKEN,
      typeInstance
    );
    let messageMetadata = Reflect.getMetadata(SERVICE_MESSAGE_TOKEN, ref);

    let message: RpcMessageType = _.merge(messageMetadata, propertiesMetadata);
    let messages = Reflect.getMetadata('message:refs', target) ?? {};

    messages[propertyKey] = message;
    message = _.merge(message, options);

    Reflect.defineMetadata('message:refs', messages, target);

    let metadata: RpcMessageType = Reflect.getMetadata(
      SERVICE_MESSAGE_TOKEN,
      target
    );
    let property: RpcProperty = _.defaultsDeep(
      {
        ref: message.typeName,
        propertyName: propertyKey,
      },
      options
    );

    metadata = _.merge(metadata, {
      properties: {
        [propertyKey]: property,
      },
    });

    Reflect.defineMetadata(SERVICE_MESSAGE_TOKEN, metadata, target);
  };
};

export const OneOf = (typeName: string) => {
  return (target: any, propertyKey: string) => {
    let metadata: RpcMessageType = Reflect.getMetadata(
      SERVICE_MESSAGE_TOKEN,
      target
    );

    if (!metadata?.oneofs) {
      metadata = {
        ...(metadata ?? {}),
        oneofs: {
          [typeName]: [propertyKey],
        },
      };
    } else {
      metadata = _.merge(metadata, {
        oneofs: {
          [typeName]: [propertyKey, ...(metadata.oneofs[typeName] ?? [])],
        },
      });
    }

    Reflect.defineMetadata(SERVICE_MESSAGE_TOKEN, metadata, target);
  };
};
