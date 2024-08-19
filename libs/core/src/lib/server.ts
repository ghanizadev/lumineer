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
  SERVICE_SERVER_RPC_TOKEN,
  SERVICE_TOKEN,
} from './constants';
import { Handler } from './handler';

type ServiceType = { new (...args: any[]): {} };

export type GRPCServerOptions = {
  services: ServiceType[];
  config?: {
    proto?: {
      path?: string;
      file?: string;
    };
    logger?: boolean;
    credentials: gRPC.ServerCredentials;
  };
};

const DEFAULT_OPTIONS: Partial<GRPCServerOptions> = {
  config: {
    proto: {
      path: path.resolve(process.cwd(), '.cymbaline'),
      file: 'app.proto',
    },
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
      this.options.config?.proto?.file!
    );
  }

  private async config() {
    await this.runHooks('onInit', {
      server: this.server,
      packageDefinition: this.packageDefinition,
      dependencyContainer: this.dependencyContainer,
    });

    await this.parseServices(this.options.services);

    const protoFile = this.protoGenerator.makeProtoFile(this.services);
    this.protoGenerator.writeProtoFile(protoFile);

    this.packageDefinition = protoLoader.loadSync(
      this.protoGenerator.protoFilePath,
      {}
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
    this.runHooks('onShutdown', {
      server: this.server,
      packageDefinition: this.packageDefinition,
      dependencyContainer: this.dependencyContainer,
    }).catch();
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

  private async runHooks(stage: HookStage, context: HookContext) {
    await Promise.allSettled(
      this.plugins.map((pluginInstance) =>
        pluginInstance[stage].call(pluginInstance, context)
      )
    ).catch((e) => console.error(e));
  }

  private async parseServices(services: ServiceType[]) {
    for (const service of services) {
      const start = performance.now();

      await this.runHooks('preConfig', {
        server: this.server,
        packageDefinition: this.packageDefinition,
        dependencyContainer: this.dependencyContainer,
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

      for (const key of Reflect.getMetadataKeys(data.instance)) {
        if (!key.startsWith(SERVICE_SERVER_RPC_TOKEN)) continue;

        const metadata = Reflect.getMetadata(key, data.instance);

        await this.runHooks('preBind', {
          server: this.server,
          packageDefinition: this.packageDefinition,
          dependencyContainer: this.dependencyContainer,
          request: {
            targetHandlerName: metadata.propertyKey,
            targetObject: data.instance,
            targetClass: data.serviceClass,
          },
        });

        const instanceMiddlewares =
          Reflect.getMetadata(SERVICE_MIDDLEWARE_TOKEN, data.instance) ?? {};

        const middlewares = [
          ...(data.middlewares['*'] ?? []),
          ...(instanceMiddlewares[metadata.propertyKey] ?? []),
        ].map<MiddlewareHandler>(this.processMiddleware.bind(this));

        const handlerInstance = new Handler({ data, metadata });

        const handler: gRPC.UntypedHandleCall = async (
          call: any,
          callback: any
        ) => {
          await this.runHooks('preCall', {
            server: this.server,
            packageDefinition: this.packageDefinition,
            dependencyContainer: this.dependencyContainer,
            request: {
              targetHandlerName: metadata.propertyKey,
              targetObject: data.instance,
              targetClass: data.serviceClass,
            },
          });

          for (const mw of middlewares) {
            await mw.call(mw, this.makeMiddlewareContext(call, callback));
          }

          await handlerInstance.invoke(call, callback);

          await this.runHooks('postCall', {
            server: this.server,
            packageDefinition: this.packageDefinition,
            dependencyContainer: this.dependencyContainer,
            request: {
              targetHandlerName: metadata.propertyKey,
              targetObject: data.instance,
              targetClass: data.serviceClass,
            },
          });
        };

        serviceImplementations[metadata.propertyKey] = handler.bind(this);
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
      // const instance = container.resolve<GRPCClassMiddleware>(middleware);
      const instance = new middleware();
      return instance.handle.bind(instance);
    }
    return middleware;
  }
}
