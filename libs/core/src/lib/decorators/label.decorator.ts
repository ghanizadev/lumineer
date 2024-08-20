import { RpcProperty, RpcScalar } from '../types/message.types';
import { PROPERTY_TYPE_TOKEN } from '../constants';

export const Optional = () => {
  return (target: any, propertyName: string) => {
    let metadata: RpcProperty =
      Reflect.getMetadata(PROPERTY_TYPE_TOKEN + propertyName, target) ?? {};
    metadata = { ...metadata, propertyName, optional: true };
    Reflect.defineMetadata(
      PROPERTY_TYPE_TOKEN + propertyName,
      metadata,
      target
    );
  };
};

export const Repeated = () => {
  return (target: any, propertyName: string) => {
    let metadata: RpcProperty =
      Reflect.getMetadata(PROPERTY_TYPE_TOKEN + propertyName, target) ?? {};
    metadata = { ...metadata, propertyName, repeated: true };
    Reflect.defineMetadata(
      PROPERTY_TYPE_TOKEN + propertyName,
      metadata,
      target
    );
  };
};

export const Map = (key: RpcScalar, value: RpcScalar) => {
  return (target: any, propertyName: string) => {
    let metadata: RpcProperty =
      Reflect.getMetadata(PROPERTY_TYPE_TOKEN + propertyName, target) ?? {};
    metadata = { ...metadata, propertyName, map: [key, value] };
    Reflect.defineMetadata(
      PROPERTY_TYPE_TOKEN + propertyName,
      metadata,
      target
    );
  };
};
