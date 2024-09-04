import { SERVICE_TOKEN } from '../constants';
import { injectable } from 'tsyringe';

/**
 * @category Decorators
 */
export const Service = (options?: { name?: string }) => {
  return <T extends { new (...args: any[]): any }>(constructor: T) => {
    Reflect.defineMetadata(
      SERVICE_TOKEN,
      { name: options?.name ?? constructor.name },
      constructor
    );
    return injectable()(constructor);
  };
};
