import type { DependencyContainer } from 'tsyringe';

export type HookStage = 'onInit' | 'preBind' | 'preCall' | 'postCall';

export type HookContext = {
  targetObject?: any;
  targetClass?: any;
  targetHandlerName?: string;
};

export type HookHandler = (context: HookContext) => Promise<void> | void;

export type GrpcPluginContext = {
  registerHook: (stage: HookStage, handler: HookHandler) => void;
  dependencyContainer: DependencyContainer;
};

export abstract class GrpcPlugin {
  abstract configure(context: GrpcPluginContext): Promise<void> | void;
}
