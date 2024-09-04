import type { Server } from '@grpc/grpc-js';
import type { PackageDefinition } from '@grpc/proto-loader';
import type { DependencyContainer } from 'tsyringe';

/**
 * @category Types
 * */
export type HookStage = keyof GrpcPlugin;

/**
 * @category Types
 * */
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

/**
 * @category Types
 * */
export type HookHandler = (context: HookContext) => Promise<void> | void;

/**
 * @category Classes
 * */
export abstract class GrpcPlugin {
  public async onInit(context: HookContext) {}
  public async preBind(context: HookContext) {}
  public async preConfig(context: HookContext) {}
  public async postConfig(context: HookContext) {}
  public async preCall(context: HookContext) {}
  public async postCall(context: HookContext) {}
  public async onShutdown(context: HookContext) {}
}
