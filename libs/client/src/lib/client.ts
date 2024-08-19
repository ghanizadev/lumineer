import { GrpcPlugin, HookContext } from '@cymbaline/core';
import * as protoLoader from '@grpc/proto-loader';
import * as gRPC from '@grpc/grpc-js';
import { GrpcServiceClient } from './service-client';
import { Discover } from './discover';

type GrpcClientPluginOptions = {
  clients?: {
    [clientUrl: string]: {
      /*
       * Credentials to be used with this client. If undefined, insecure credentials will be used instead
       */
      credentials?: gRPC.ChannelCredentials;
    };
  };
};

export class GrpcClientPlugin extends GrpcPlugin {
  private readonly serviceMap: Record<string, any> = {};
  private options: GrpcClientPluginOptions = {};

  /*
   * Create a new instance with options;
   */
  static configure(options: GrpcClientPluginOptions): GrpcPlugin {
    const instance = new GrpcClientPlugin();
    instance.options = options;
    return instance;
  }

  async preConfig(context: HookContext): Promise<void> {
    const { targetClass } = context.request;

    const keys = Reflect.getMetadataKeys(targetClass);

    for (const key of keys) {
      if (key.startsWith('grpc-client:') && !this.serviceMap[key]) {
        const metadata = Reflect.getMetadata(key, targetClass);
        let credentials: gRPC.ChannelCredentials;

        if (this.options.clients[metadata.url].credentials) {
          credentials = this.options.clients[metadata.url].credentials;
        } else {
          credentials = gRPC.credentials.createInsecure();
        }

        const discovery = new Discover(metadata.url, credentials);
        await discovery.introspect();

        const pkgDefinition = protoLoader.loadSync(
          discovery.protoFilePath + '.proto',
          {
            keepCase: true,
            longs: String,
            enums: String,
            defaults: true,
            oneofs: true,
          }
        );

        const pkg = gRPC.loadPackageDefinition(pkgDefinition);
        this.serviceMap[key] = true;

        context.dependencyContainer.register('GRPC_CLIENT', {
          useValue: new GrpcServiceClient({
            pkg,
            ...metadata,
          }),
        });
      }
    }
  }
}
