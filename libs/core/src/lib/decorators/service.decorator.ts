import { SERVICE_TOKEN } from '../constants';
import { injectable } from 'tsyringe';

export const Service = () => {
  return <T extends { new (...args: any[]): {} }>(constructor: T) => {
    Reflect.defineMetadata(
      SERVICE_TOKEN,
      { name: constructor.name },
      constructor
    );
    return injectable()(constructor);

    // // @autoInjectable()
    // class serviceClass extends constructor {}
    // return serviceClass;
  };
};
