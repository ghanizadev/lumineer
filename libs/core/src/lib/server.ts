import * as gRPC from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import * as path from 'node:path';
import * as _ from 'lodash';
import { container } from 'tsyringe';
import { Logger, Logger as BaseLogger } from '@cymbaline/logger';
import { ProtoGenerator } from './proto';
import {
  GRPCClassMiddleware,
  GRPCClassMiddlewareType,
  GRPCFunctionMiddleware,
  MiddlewareContext,
  MiddlewareHandler,
} from './types';
import {
  SERVICE_MIDDLEWARE_TOKEN,
  SERVICE_RPC_ARGS_TOKEN,
  SERVICE_RPC_TOKEN,
  SERVICE_TOKEN,
} from './constants';

type ServiceType = { new (...args: any[]): {} };

export type GRPCServerOptions = {
  services: ServiceType[];
  config?: {
    proto?: {
      path?: string;
      file?: string;
    };
    logger?: boolean;
  };
};

const DEFAULT_OPTIONS: Partial<GRPCServerOptions> = {
  config: {
    proto: {
      path: path.resolve(process.cwd(), '.grpc'),
      file: '.proto',
    },
  },
};

type HandlerData = {
  middlewares: MiddlewareHandler[];
  data: any;
  metadata: any;
};

export class GRPCServer {
  private readonly services: Record<string, any> = {};
  private readonly protoGenerator: ProtoGenerator;

  private readonly logger: BaseLogger;
  private readonly server: gRPC.Server;
  private readonly packageDefinition: protoLoader.PackageDefinition;
  private readonly grpcObject: gRPC.GrpcObject;
  private readonly package: gRPC.GrpcObject;

  private port: number;
  private globalMiddlewares: (
    | GRPCFunctionMiddleware
    | GRPCClassMiddlewareType
  )[] = [];
  private options: GRPCServerOptions;

  constructor(options: GRPCServerOptions) {
    this.updateOptions(options);
    this.logger = new BaseLogger('Server');

    this.protoGenerator = new ProtoGenerator(
      this.options.config?.proto?.path!,
      this.options.config?.proto?.file!
    );
    this.parseServices(options.services);

    const protoFile = this.protoGenerator.makeProtoFile(this.services);
    this.protoGenerator.writeProtoFile(protoFile);

    this.server = new gRPC.Server();
    this.packageDefinition = protoLoader.loadSync(
      this.protoGenerator.protoFilePath,
      {}
    );
    this.grpcObject = gRPC.loadPackageDefinition(this.packageDefinition);

    this.package = this.grpcObject.app as gRPC.GrpcObject;

    this.configureModules();
  }

  public async run(port: string | number) {
    for (const middleware of this.globalMiddlewares) {
      const mw = this.processMiddleware(middleware);
      await mw.call(mw, this.makeMiddlewareContext());
    }

    this.server.bindAsync(
      typeof port === 'string' ? port : '127.0.0.1:' + port,
      gRPC.ServerCredentials.createInsecure(),
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
  }

  public use(middleware: GRPCFunctionMiddleware | GRPCClassMiddlewareType) {
    this.globalMiddlewares.push(middleware);
  }

  private makeArguments(call: any, instance: any, handlerName: string) {
    const args = Reflect.getMetadata(
      SERVICE_RPC_ARGS_TOKEN,
      instance,
      handlerName
    );
    const result: any[] = new Array(instance[handlerName].length);

    for (let i = 0; i < result.length; i++) {
      if (args[i]) {
        const { type } = args[i];

        console.log(call.stream);

        switch (type) {
          case 'body':
            result[i] = call.request;
            break;
          case 'metadata':
            result[i] = call.metadata;
            break;
          case 'stream':
            result[i] = call;
            break;
          default:
            break;
        }
      }
    }

    return result;
  }

  private parseServices(services: ServiceType[]) {
    for (const service of services) {
      const start = performance.now();

      const metadata = Reflect.getMetadata(SERVICE_TOKEN, service);

      if (!metadata || !metadata.name) throw new Error('Forgot decorator?');

      const c = container.createChildContainer();
      c.register(Logger, { useValue: new Logger(metadata.name, 'bgMagenta') });
      const instance: any = c.resolve(service);

      const middlewares =
        Reflect.getMetadata(SERVICE_MIDDLEWARE_TOKEN, service) ?? [];

      this.services[metadata.name] = {
        instance,
        middlewares,
        ...metadata,
      };

      const end = performance.now();
      this.logger.info(
        `Service "${metadata.name}" mapped in ${(end - start).toFixed(2)}ms`
      );
    }
  }

  private configureModules() {
    for (const [serviceName, data] of Object.entries(this.services)) {
      const serviceDef = (
        this.package[serviceName] as gRPC.ServiceClientConstructor
      ).service;
      this.server.removeService(serviceDef);

      const serviceImplementations: gRPC.UntypedServiceImplementation = {};

      for (const key of Reflect.getMetadataKeys(data.instance)) {
        if (!key.startsWith(SERVICE_RPC_TOKEN)) continue;

        const metadata = Reflect.getMetadata(key, data.instance);
        const instanceMiddlewares =
          Reflect.getMetadata(SERVICE_MIDDLEWARE_TOKEN, data.instance) ?? {};

        const middlewares = [
          ...(data.middlewares['*'] ?? []),
          ...(instanceMiddlewares[metadata.propertyKey] ?? []),
        ].map<MiddlewareHandler>(this.processMiddleware.bind(this));

        const handler: gRPC.UntypedHandleCall = async (
          call: any,
          callback: any
        ) => {
          await this.makeHandler(call, callback, {
            middlewares,
            data,
            metadata,
          });
        };

        serviceImplementations[metadata.propertyKey] = handler.bind(this);
      }

      this.server.addService(serviceDef, serviceImplementations);
    }
  }

  private makeMiddlewareContext(call?: any): MiddlewareContext {
    return {
      server: this.server,
      packageDefinition: this.packageDefinition,
      logger: this.logger.withContext('Middleware', 'bgYellow'),
      request: {
        body: call?.request,
        metadata: call?.metadata,
      },
    };
  }

  private updateOptions(options?: GRPCServerOptions) {
    if (options) this.options = _.defaultsDeep(DEFAULT_OPTIONS, options);
  }

  private processMiddleware(
    middleware: any
  ): (context: MiddlewareContext) => Promise<void> | void {
    try {
      const instance = container.resolve<GRPCClassMiddleware>(middleware);
      return instance.handle.bind(instance);
    } catch {}

    return middleware;
  }

  private async makeHandler(call: any, callback: any, additional: HandlerData) {
    const { middlewares, data, metadata } = additional;

    const start = performance.now();

    try {
      for (const mw of middlewares) {
        await mw.call(mw, this.makeMiddlewareContext(call));
      }
      const args = this.makeArguments(
        call,
        data.instance,
        metadata.propertyKey
      );

      const fn = data.instance[metadata.propertyKey].bind(data.instance);

      if (metadata.returnType.metadata.stream) {
        if (fn.constructor.name.includes('GeneratorFunction')) {
          for await (const response of fn(...args)) {
            call.write(response);
          }
        } else {
          Promise.resolve(fn(...args))
            .then(() => {
              const end = performance.now();
              this.logger.info(
                `RPC to ${data.name}.${metadata.propertyKey} done in ${(
                  end - start
                ).toFixed(3)}ms`
              );
            })
            .catch((e) => {
              this.logger.error(
                `RPC to ${data.name}.${metadata.propertyKey} failed: ${e}`
              );

              call.emit('error', { code: gRPC.status.INTERNAL });
            });
        }
      } else {
        const response = await Promise.resolve(fn(...args));
        callback(null, response);

        const end = performance.now();
        this.logger.info(
          `RPC to ${data.name}.${metadata.propertyKey} done in ${(
            end - start
          ).toFixed(3)}ms`
        );
      }
    } catch (e) {
      if (callback) {
        callback(e);
      } else {
        call.emit('error', { status: gRPC.status.INTERNAL });
      }
      this.logger.error(
        `RPC to ${data.name}.${metadata.propertyKey} failed: ${e}`
      );
    }
  }
}
