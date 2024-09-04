import * as gRPC from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import * as path from 'node:path';
import * as _ from 'lodash';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { container, DependencyContainer } from 'tsyringe';
import { Logger, Logger as BaseLogger } from '@lumineer/logger';
import { ProtoGenerator } from './proto';
import {
  ClassConstructor,
  ClassMiddleware,
  ClassMiddlewareType,
  FunctionMiddleware,
  GrpcPlugin,
  ServerOptions,
  HookContext,
  HookStage,
  MiddlewareContext,
  MiddlewareHandler,
  ServiceConfig,
  RpcMetadata,
  LumineerConfig,
  MiddlewareKind,
} from './types';
import {
  SERVICE_MIDDLEWARE_TOKEN,
  SERVICE_RPC_TOKEN,
  SERVICE_TOKEN,
} from './constants';
import { Handler } from './handler';
import { ExceptionHandler } from './exception-handler';
import * as process from 'node:process';
import { ConfigLoader } from './config-loader';
import * as fs from 'node:fs';
import { EventEmitter } from 'node:events';

const DEFAULT_OPTIONS: Partial<ServerOptions> = {
  providers: [],
  credentials: gRPC.ServerCredentials.createInsecure(),
  channelOptions: {},
};

const DEFAULT_CONFIG: LumineerConfig = {
  configFolder: path.resolve(process.cwd(), '.lumineer'),
  packageName: 'app',
};

/**
 * @category Classes
 * */
export class Lumineer {
  private readonly services: Record<string, ServiceConfig> = {};
  private readonly plugins: GrpcPlugin[] = [];
  private readonly dependencyContainer: DependencyContainer;
  private readonly server: gRPC.Server;
  private readonly events: EventEmitter;
  private readonly logger: BaseLogger;

  private lumineerConfig: LumineerConfig;
  private globalMiddlewares: MiddlewareKind[] = [];
  private options: ServerOptions;
  private packageDefinition: protoLoader.PackageDefinition;
  private grpcObject: gRPC.GrpcObject;
  private package: gRPC.GrpcObject;

  private port = 0;
  private listening = false;

  constructor(options: ServerOptions) {
    this.updateOptions(options);
    this.logger = new BaseLogger('Server');
    this.dependencyContainer = container.createChildContainer();
    this.server = new gRPC.Server({ ...options.channelOptions! });
    this.events = new EventEmitter();

    if (this.getFlag('dryRun')) {
      Promise.all([
        this.config.apply(this),
        this.configureModules.apply(this),
      ]).then(() => {
        process.exit(0);
      });
    }
  }

  private async loadConfig() {
    const configLoader = new ConfigLoader();
    this.lumineerConfig = await configLoader.loadConfig();
    this.lumineerConfig = _.defaultsDeep(this.lumineerConfig, DEFAULT_CONFIG);
  }

  private async config() {
    await this.loadConfig();
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

    if (this.getFlag('generateProtobufDefs')) {
      const start = performance.now();

      const protoGenerator = new ProtoGenerator(
        this.lumineerConfig.configFolder,
        this.lumineerConfig.packageName
      );

      const protoFile = protoGenerator.makeProtoFile(this.services);
      protoGenerator.writeProtoFile(protoFile);
      const elapsed = (performance.now() - start).toFixed(2);
      this.logger.info(`File protobuf spec generated in ${elapsed}ms`);
    }

    this.packageDefinition = protoLoader.loadSync(this.loadProtoFiles(), {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
    });
    this.grpcObject = gRPC.loadPackageDefinition(this.packageDefinition);
    this.package = _.get(
      this.grpcObject,
      this.lumineerConfig.packageName
    ) as gRPC.GrpcObject;
  }

  public async run(port: string | number) {
    if (this.getFlag('dryRun')) return;

    await this.config();
    await this.configureModules();

    this.server.bindAsync(
      typeof port === 'string' ? port : '127.0.0.1:' + port,
      this.options.credentials,
      (err, port) => {
        this.port = port;
        this.logger.info('Server started at ' + port);
        this.listening = true;
        this.events.emit('listen');
      }
    );

    const shutdownHandler = this.shutdown.bind(this);

    process.on('SIGINT', shutdownHandler);
    process.on('SIGTERM', shutdownHandler);
    process.on('SIGHUP', shutdownHandler);
  }

  public async close() {
    this.runHooks('onShutdown').catch();
    this.server.unbind('127.0.0.1:' + this.port);
    this.server.forceShutdown();
    this.events.emit('close');
  }

  public use(middleware: FunctionMiddleware | ClassMiddlewareType) {
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

  get isListening(): Promise<boolean> {
    if (this.listening) return Promise.resolve(true);
    return new Promise((res) => {
      this.events.on('listen', () => {
        res(true);
      });

      setTimeout(() => res(false), 30_000);
    });
  }

  get listenPort() {
    return this.port;
  }

  private getFlag(flag: string) {
    const argv = yargs(hideBin(process.argv)).argv;
    return argv[flag];
  }

  private shutdown() {
    this.server.forceShutdown();
  }

  private loadProtoFiles() {
    if (!fs.existsSync(this.lumineerConfig.configFolder))
      throw new Error('Configuration was not found');

    const files = fs.readdirSync(this.lumineerConfig.configFolder);

    return files
      .filter((file) => {
        const stat = fs.statSync(
          path.resolve(this.lumineerConfig.configFolder, file)
        );
        return stat.isFile() && file.endsWith('.proto');
      })
      .map((file) => path.resolve(this.lumineerConfig.configFolder, file));
  }

  private async runHooks(
    stage: HookStage,
    context?: Omit<
      HookContext,
      'server' | 'dependencyContainer' | 'packageDefinition'
    >
  ) {
    await Promise.all(
      this.plugins.map((pluginInstance) =>
        pluginInstance[stage].call(pluginInstance, {
          ...context,
          server: this.server,
          dependencyContainer: this.dependencyContainer,
          packageDefinition: this.packageDefinition,
        })
      )
    );
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
        Reflect.getMetadata(SERVICE_MIDDLEWARE_TOKEN, service) ?? {};

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

            for (const middleware of this.globalMiddlewares) {
              const mw = this.processMiddleware(middleware);
              await mw.call(
                mw,
                this.makeMiddlewareContext(
                  data.instance,
                  rpc.rpcName,
                  call,
                  callback
                )
              );
            }

            for (const mw of middlewares) {
              await mw.call(
                mw,
                this.makeMiddlewareContext(
                  data.instance,
                  rpc.rpcName,
                  call,
                  callback
                )
              );
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
            this.logger.error(
              `RPC to ${data.name}.${rpc.rpcName} failed: ${e}`
            );
          }
        };

        serviceImplementations[rpc.rpcName] = handler.bind(this);
      }

      this.server.addService(serviceDef, serviceImplementations);
    }

    await this.runHooks('postConfig');
  }

  private makeMiddlewareContext(
    instance: any,
    handlerName: string,
    call?: any,
    callback?: any
  ): MiddlewareContext {
    return {
      logger: new Logger('Middleware', 'bgYellow'),
      call,
      request: {
        body: call?.request,
        metadata: call?.metadata,
      },
      callback,
      instance,
      handlerName,
    };
  }

  private updateOptions(options?: ServerOptions) {
    if (options) this.options = _.defaultsDeep(options, DEFAULT_OPTIONS);
  }

  private processMiddleware(
    middleware: any
  ): (context: MiddlewareContext) => Promise<void> | void {
    if (middleware.prototype && middleware.constructor.name) {
      const instance = container.resolve<ClassMiddleware>(middleware);
      return instance.handle.bind(instance);
    }

    if (middleware.handle) return middleware.handle;

    return middleware;
  }
}
