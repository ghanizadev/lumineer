import type { Server } from '@grpc/grpc-js';
import type { PackageDefinition } from '@grpc/proto-loader';
import { Logger } from '@cymbaline/logger';

export type MiddlewareContext = {
  server: Server;
  packageDefinition: PackageDefinition;
  logger: Logger;
  request: {
    body?: Record<string, any>;
    metadata?: Record<string, any>;
  };
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
