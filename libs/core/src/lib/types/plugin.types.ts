import type { Server } from '@grpc/grpc-js';
import type { PackageDefinition } from '@grpc/proto-loader';
import type { DependencyContainer } from 'tsyringe';

export type HookStage = keyof GrpcPlugin;

export type HookContext = {
  dependencyContainer: DependencyContainer;
  server: Server;
  packageDefinition?: PackageDefinition;
  request?: {
    targetObject?: any;
    targetClass?: any;
    targetHandlerName?: string;
  };
};

export type HookHandler = (context: HookContext) => Promise<void> | void;

export abstract class GrpcPlugin {
  public async onInit(context: HookContext) {}
  public async preBind(context: HookContext) {}
  public async preConfig(context: HookContext) {}
  public async preCall(context: HookContext) {}
  public async postCall(context: HookContext) {}
  public async onShutdown(context: HookContext) {}
}
