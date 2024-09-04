import { Logger } from '@lumineer/logger';
import { MetadataContent } from '../../index';

/**
 * @category Types
 * */
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

/**
 * @category Types
 * */
export type MiddlewareHandler = (
  context: MiddlewareContext
) => Promise<void> | void;

/**
 * @category Types
 * */
export type FunctionMiddleware = (
  context: MiddlewareContext
) => Promise<void> | void;

/**
 * @category Types
 * */
export type ClassMiddlewareType = { new (...args: any[]): {} };

/**
 * @category Classes
 * */
export abstract class ClassMiddleware {
  protected readonly logger = new Logger('Middleware', 'bgYellow');
  abstract handle(context: MiddlewareContext): Promise<void> | void;
}
