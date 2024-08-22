import * as gRPC from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import * as path from 'node:path';
import * as _ from 'lodash';
import { container, DependencyContainer } from 'tsyringe';
import { Logger, Logger as BaseLogger } from '@cymbaline/logger';
import { ProtoGenerator } from './proto';
import {
  GRPCClassMiddlewareType,
  GRPCFunctionMiddleware,
  GrpcPlugin,
  HookContext,
  HookStage,
  MiddlewareContext,
  MiddlewareHandler,
} from './types';
import {
  SERVICE_MIDDLEWARE_TOKEN,
  SERVICE_RPC_TOKEN,
  SERVICE_TOKEN,
} from './constants';
import { Handler } from './handler';
import { ExceptionHandler } from './exception-handler';
import { RpcMetadata } from './types/message.types';

type ClassConstructor<T = {}> = { new (...args: any[]): T };

export type GRPCServerOptions = {
  services: ClassConstructor[];
  providers?: {
    provide: ClassConstructor;
    useValue?: any;
    useClass?: ClassConstructor;
  }[];
  config?: {
    proto?: {
      path?: string;
      file?: string;
    };
    logger?: boolean;
    packageName?: string;
    credentials: gRPC.ServerCredentials;
  };
};

const DEFAULT_OPTIONS: Partial<GRPCServerOptions> = {
  providers: [],
  config: {
    proto: {
      path: path.resolve(process.cwd(), '.cymbaline'),
    },
    packageName: 'app',
    credentials: gRPC.ServerCredentials.createInsecure(),
  },
};

export class GRPCServer {
  private readonly services: Record<string, any> = {};
  private readonly protoGenerator: ProtoGenerator;
  private readonly plugins: GrpcPlugin[] = [];
  private readonly dependencyContainer: DependencyContainer;
  private readonly server: gRPC.Server;

  private readonly logger: BaseLogger;

  private port: number;
  private globalMiddlewares: (
    | GRPCFunctionMiddleware
    | GRPCClassMiddlewareType
  )[] = [];
  private options: GRPCServerOptions;
  private packageDefinition: protoLoader.PackageDefinition;
  private grpcObject: gRPC.GrpcObject;
  private package: gRPC.GrpcObject;

  constructor(options: GRPCServerOptions) {
    this.updateOptions(options);
    this.logger = new BaseLogger('Server');
    this.dependencyContainer = container.createChildContainer();
    this.server = new gRPC.Server();

    this.protoGenerator = new ProtoGenerator(
      this.options.config?.proto?.path!,
      this.options.config?.proto?.file ??
        this.options.config.packageName + '.proto'
    );
  }

  private async config() {
    await this.runHooks('onInit');

    for (const provider of this.options.providers) {
      const dependencyProvider: any = {};

      if (provider.useClass) {
        dependencyProvider.useClass = provider.useClass;
      } else if (provider.useValue) {
        dependencyProvider.useValue = await provider.useValue;
      } else {
        throw new Error('Invalid provider');
      }

      this.dependencyContainer.register(provider.provide, dependencyProvider);
    }

    await this.parseServices(this.options.services);

    const protoFile = this.protoGenerator.makeProtoFile(this.services);
    this.protoGenerator.writeProtoFile(protoFile);

    this.packageDefinition = protoLoader.loadSync(
      this.protoGenerator.protoFilePath,
      {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
      }
    );
    this.grpcObject = gRPC.loadPackageDefinition(this.packageDefinition);
    this.package = this.grpcObject.app as gRPC.GrpcObject;
  }

  public async run(port: string | number) {
    await this.config();
    await this.configureModules();

    for (const middleware of this.globalMiddlewares) {
      const mw = this.processMiddleware(middleware);
      await mw.call(mw, this.makeMiddlewareContext());
    }

    this.server.bindAsync(
      typeof port === 'string' ? port : '127.0.0.1:' + port,
      this.options.config.credentials,
      (err, port) => {
        this.port = port;
        if (this.options.config?.logger)
          this.logger.info('Server started at ' + port);
      }
    );
  }

  public close() {
    this.server.unbind('127.0.0.1:' + this.port);
    this.server.forceShutdown();
    this.runHooks('onShutdown').catch();
  }

  public use(middleware: GRPCFunctionMiddleware | GRPCClassMiddlewareType) {
    this.globalMiddlewares.push(middleware);
  }

  public registerPlugin(plugin: { new (): GrpcPlugin } | GrpcPlugin) {
    let instance: GrpcPlugin;

    if (plugin instanceof GrpcPlugin) {
      instance = plugin;
    } else {
      instance = this.dependencyContainer.resolve<GrpcPlugin>(plugin);
    }

    this.plugins.push(instance);
    this.logger.info(`Plugin "${instance.constructor.name}" added.`);
  }

  private async runHooks(
    stage: HookStage,
    context?: Omit<
      HookContext,
      'server' | 'dependencyContainer' | 'packageDefinition'
    >
  ) {
    await Promise.allSettled(
      this.plugins.map((pluginInstance) =>
        pluginInstance[stage].call(pluginInstance, {
          ...context,
          server: this.server,
          dependencyContainer: this.dependencyContainer,
          packageDefinition: this.packageDefinition,
        })
      )
    ).catch((e) => console.error(e));
  }

  private async parseServices(services: ClassConstructor[]) {
    for (const service of services) {
      const start = performance.now();

      await this.runHooks('preConfig', {
        request: {
          targetClass: service,
        },
      });

      const metadata = Reflect.getMetadata(SERVICE_TOKEN, service);

      if (!metadata || !metadata.name) throw new Error('Forgot decorator?');

      this.dependencyContainer.register(Logger, {
        useValue: new Logger(metadata.name, 'bgMagenta'),
      });
      const instance: any = this.dependencyContainer.resolve(service);

      const middlewares =
        Reflect.getMetadata(SERVICE_MIDDLEWARE_TOKEN, service) ?? [];

      this.services[metadata.name] = {
        instance,
        middlewares,
        serviceClass: service,
        ...metadata,
      };

      const end = performance.now();
      this.logger.info(
        `Service "${metadata.name}" mapped in ${(end - start).toFixed(2)}ms`
      );
    }
  }

  private async configureModules() {
    for (const [serviceName, data] of Object.entries(this.services)) {
      const serviceDef = (
        this.package[serviceName] as gRPC.ServiceClientConstructor
      ).service;
      this.server.removeService(serviceDef);

      const serviceImplementations: gRPC.UntypedServiceImplementation = {};

      const rpcMap: Record<string, RpcMetadata> = Reflect.getMetadata(
        SERVICE_RPC_TOKEN,
        data.instance
      );

      for (const key in rpcMap) {
        const rpc = rpcMap[key];

        await this.runHooks('preBind', {
          request: {
            targetHandlerName: rpc.rpcName,
            targetObject: data.instance,
            targetClass: data.serviceClass,
          },
        });

        const instanceMiddlewares =
          Reflect.getMetadata(SERVICE_MIDDLEWARE_TOKEN, data.instance) ?? {};

        const middlewares = [
          ...(data.middlewares['*'] ?? []),
          ...(instanceMiddlewares[rpc.rpcName] ?? []),
        ].map<MiddlewareHandler>(this.processMiddleware.bind(this));

        const handlerInstance = new Handler({ data, metadata: rpc });

        const handler: gRPC.UntypedHandleCall = async (
          call: any,
          callback: any
        ) => {
          try {
            await this.runHooks('preCall', {
              request: {
                targetHandlerName: rpc.rpcName,
                targetObject: data.instance,
                targetClass: data.serviceClass,
              },
            });

            for (const mw of middlewares) {
              await mw.call(mw, this.makeMiddlewareContext(call, callback));
            }

            await handlerInstance.invoke(call, callback);

            await this.runHooks('postCall', {
              request: {
                targetHandlerName: rpc.rpcName,
                targetObject: data.instance,
                targetClass: data.serviceClass,
              },
            });
          } catch (e) {
            ExceptionHandler.handleError(e, call, callback);
          }
        };

        serviceImplementations[rpc.rpcName] = handler.bind(this);
      }

      this.server.addService(serviceDef, serviceImplementations);
    }
  }

  private makeMiddlewareContext(call?: any, callback?: any): MiddlewareContext {
    return {
      logger: new Logger('Middleware', 'bgYellow'),
      call,
      request: {
        body: call?.request,
        metadata: call?.metadata,
      },
      callback,
    };
  }

  private updateOptions(options?: GRPCServerOptions) {
    if (options) this.options = _.defaultsDeep(DEFAULT_OPTIONS, options);
  }

  private processMiddleware(
    middleware: any
  ): (context: MiddlewareContext) => Promise<void> | void {
    if (middleware.prototype && middleware.constructor.name) {
      const instance = new middleware();
      return instance.handle.bind(instance);
    }
    return middleware;
  }
}
