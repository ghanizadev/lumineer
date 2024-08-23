import { GrpcPlugin, HookContext } from '@cymbaline/core';
import * as protoLoader from '@grpc/proto-loader';
import * as gRPC from '@grpc/grpc-js';
import { GrpcServiceClient } from './service-client';
import { Discover } from './discover';

type GrpcClientPluginOptions = {
  clients: {
    [clientId: string]: {
      /*
       * Credentials to be used with this client. If `undefined`, insecure credentials will be used instead
       */
      credentials?: gRPC.ChannelCredentials;
      /*
       * The client connection string
       */
      url: string;
    };
  };
};

export class GrpcClientPlugin extends GrpcPlugin {
  private readonly serviceMap: Record<string, any> = {};

  /*
   * Create a new instance with options;
   */
  constructor(private readonly options: GrpcClientPluginOptions) {
    super();
  }

  async preConfig(context: HookContext): Promise<void> {
    const { targetClass } = context.request;

    const keys = Reflect.getMetadataKeys(targetClass);

    for (const key of keys) {
      if (key.startsWith('grpc-client:') && !this.serviceMap[key]) {
        this.serviceMap[key] = true;
      }
    }

    for (const clientId in this.options.clients) {
      const clientConfig = this.options.clients[clientId];

      let credentials: gRPC.ChannelCredentials;

      if (clientConfig.credentials) {
        //TODO: Log a warn about missing credentials
        credentials = clientConfig.credentials;
      } else {
        credentials = gRPC.credentials.createInsecure();
      }

      const discovery = new Discover(clientConfig.url, credentials);
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
      context.dependencyContainer.register('grpc-client:' + clientId, {
        useValue: new GrpcServiceClient(clientId, clientConfig.url, {
          pkg,
          clients: this.options.clients,
        }),
      });
    }
  }
}
