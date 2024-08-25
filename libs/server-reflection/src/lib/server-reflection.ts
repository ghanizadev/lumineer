import { ReflectionService } from '@grpc/reflection';
import { GrpcPlugin, HookContext } from '@cymbaline/core';

export class ServerReflectionPlugin extends GrpcPlugin {
  async postConfig(context: HookContext): Promise<void> {
    const reflection = new ReflectionService(context.packageDefinition);
    reflection.addToServer(context.server);
  }
}
