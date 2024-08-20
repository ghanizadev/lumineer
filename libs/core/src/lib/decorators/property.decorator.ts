import { SERVICE_MESSAGE_TOKEN } from '../constants';
import { RpcMessageType, RpcProperty, RpcScalar } from '../types/message.types';
import * as _ from 'lodash';

export type DecoratorFunction = (target: any, propertyKey: string) => void;

export type TransformFunction<T = any> = (
  value: T,
  options: PropertyTypeOptions
) => T;

export type PropertyTypeOptions = {
  required?: boolean;
  repeated?: boolean;
  options?: boolean;
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
  type: 'float',
  options?: PropertyTypeOptions,
  transform?: TransformFunction<string>
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
  type: RpcScalar,
  options?: PropertyTypeOptions,
  transform?: TransformFunction
): DecoratorFunction {
  return (target, propertyName) => {
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

    metadata = _.merge(metadata, {
      properties: {
        [propertyName]: property,
      },
    });

    Reflect.defineMetadata(SERVICE_MESSAGE_TOKEN, metadata, target);
  };
}

export const MessageRef = (
  ref: { new (): {} },
  options?: PropertyTypeOptions
) => {
  return (target: any, propertyKey: string) => {
    let metadata: RpcMessageType = Reflect.getMetadata(
      SERVICE_MESSAGE_TOKEN,
      target.constructor
    );

    let property: RpcProperty | undefined = metadata?.properties[propertyKey];

    if (!property) {
      property = {
        propertyName: propertyKey,
        ref: ref.name,
      };
    }

    if (options) {
      property = _.merge(property, options);
    }

    metadata = _.merge(metadata, {
      properties: {
        [propertyKey]: property,
      },
    });

    Reflect.defineMetadata(SERVICE_MESSAGE_TOKEN, metadata, target.constructor);
  };
};
