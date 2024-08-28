import { Logger } from '@lumineer/logger';

export type MiddlewareContext = {
  logger: Logger;
  request?: {
    body?: Record<string, any>;
    metadata?: Record<string, any>;
  };
  call?: any;
  callback?: any;
};

export type MiddlewareHandler = (
  context: MiddlewareContext
) => Promise<void> | void;

export type GRPCFunctionMiddleware = (
  context: MiddlewareContext
) => Promise<void> | void;

export type GRPCClassMiddlewareType = { new (...args: any[]): {} };

export abstract class GRPCClassMiddleware {
  protected readonly logger = new Logger('Middleware', 'bgYellow');
  abstract handle(context: MiddlewareContext): Promise<void> | void;
}
