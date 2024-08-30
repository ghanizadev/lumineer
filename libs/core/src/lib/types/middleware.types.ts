import { Logger } from '@lumineer/logger';
import { MetadataContent } from '../../index';

export type MiddlewareContext = {
  logger: Logger;
  request: {
    body?: Record<string, any>;
    metadata: MetadataContent;
  };
  call?: any;
  callback?: any;
  instance: any;
  handlerName: string;
};

export type MiddlewareHandler = (
  context: MiddlewareContext
) => Promise<void> | void;

export type FunctionMiddleware = (
  context: MiddlewareContext
) => Promise<void> | void;

export type ClassMiddlewareType = { new (...args: any[]): {} };

export abstract class ClassMiddleware {
  protected readonly logger = new Logger('Middleware', 'bgYellow');
  abstract handle(context: MiddlewareContext): Promise<void> | void;
}
