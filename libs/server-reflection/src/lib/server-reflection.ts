import { ReflectionService } from '@grpc/reflection';
import { GRPCClassMiddleware, MiddlewareContext } from '@cymbaline/core';

export class ServerReflection extends GRPCClassMiddleware {
  public handle(context: MiddlewareContext): Promise<void> | void {
    const reflection = new ReflectionService(context.packageDefinition);
    reflection.addToServer(context.server);
  }
}
