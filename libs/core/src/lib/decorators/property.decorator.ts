export type PropertyTypeOptions = {
    required?: boolean;
};

export type PropertyNumberOption = {
    type: 'int32' | 'int64' | 'double' | 'float';
};

export type InputTypeOptions = PropertyTypeOptions & { stream?: boolean };

export const MessageType = (options: InputTypeOptions = {}) => {
    return (constructor: { new (...args: any[]): {} }) => {
        Reflect.defineMetadata('type', { type: 'message', name: constructor.name, ...options }, constructor);
    };
};

export const EnumType = (options: InputTypeOptions = {}) => {
    return (constructor: { new (...args: any[]): {} }) => {
        Reflect.defineMetadata('type', { type: 'message', name: constructor.name, ...options }, constructor);
    };
};

export const PropertyType =
    <T = any>(type: string) =>
    (options?: PropertyTypeOptions & T) => {
        return (target: any, propertyKey: string) => {
            Reflect.defineMetadata(propertyKey, { type, ...(options ?? {}) }, target);
        };
    };

export const StringPropertyType = PropertyType('string');

export const NumberPropertyType = PropertyType<PropertyNumberOption>('number');

export const BooleanPropertyType = PropertyType('bool');

export const BytesPropertyType = PropertyType('bytes');
