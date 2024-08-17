import { PROPERTY_TYPE_TOKEN } from '../constants';

export type PropertyTypeOptions = {
  required?: boolean;
};

export type PropertyNumberOption = {
  type: 'int32' | 'int64' | 'double' | 'float';
};

export type InputTypeOptions = PropertyTypeOptions & { stream?: boolean };

export const MessageType = (options: InputTypeOptions = {}) => {
  return (constructor: { new (...args: any[]): {} }) => {
    Reflect.defineMetadata(
      'type',
      { type: 'message', name: constructor.name, ...options },
      constructor
    );
  };
};

export const StreamMessageType = (options: InputTypeOptions = {}) => {
  return (constructor: { new (...args: any[]): {} }) => {
    Reflect.defineMetadata(
      'type',
      { type: 'message', stream: true, name: constructor.name, ...options },
      constructor
    );
  };
};

export const EnumType = (options: InputTypeOptions = {}) => {
  return (constructor: { new (...args: any[]): {} }) => {
    Reflect.defineMetadata(
      'type',
      { type: 'enum', name: constructor.name, ...options },
      constructor
    );
  };
};

const propertyTypeDecorator =
  <T = any>(
    type: string,
    transform?: <U = any>(
      metadataValue: U,
      options: PropertyTypeOptions & T
    ) => U
  ) =>
  (options?: PropertyTypeOptions & T) => {
    return (target: any, propertyKey: string) => {
      const metadata = { type, propertyKey, ...(options ?? {}) };
      Reflect.defineMetadata(
        PROPERTY_TYPE_TOKEN + propertyKey,
        transform ? transform(metadata, options) : metadata,
        target
      );
    };
  };

export const StringPropertyType = propertyTypeDecorator('string');

export const BooleanPropertyType = propertyTypeDecorator('bool');

export const BytesPropertyType = propertyTypeDecorator('bytes');

export const NumberPropertyType = propertyTypeDecorator<PropertyNumberOption>(
  'number',
  (metadata, options) => ({ ...metadata, type: options?.type ?? 'int32' })
);
