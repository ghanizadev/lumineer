import { GrpcPlugin, HookContext } from '@cymbaline/core';
import * as protoLoader from '@grpc/proto-loader';
import * as gRPC from '@grpc/grpc-js';
import { GrpcServiceClient } from './service-client';
import { Discover } from './discover';

type GrpcClientPluginOptions = {
  /*
   * When should the introspect run: `true` - every server start; `false` -
   * Do not run; `if-not-present` - Run if the configuration is not present
   * */
  introspectMode?: boolean | 'if-not-present';
  /*
   * Client configuration with `clientId` as key
   * */
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
  /*
   * Create a new instance with options;
   */
  constructor(private readonly options: GrpcClientPluginOptions) {
    super();
  }

  async preConfig(context: HookContext): Promise<void> {
    const { targetClass } = context.request;

    const keys: string[] = [];
    for (const registeredClient of Reflect.getMetadataKeys(targetClass) ?? []) {
      if (registeredClient.startsWith('grpc-client:')) {
        keys.push(registeredClient);
      }
    }

    if (keys.length === 0) return;

    for (const clientId in this.options.clients) {
      const clientConfig = this.options.clients[clientId];
      const metadata = Reflect.getMetadata(
        'grpc-client:' + clientId,
        targetClass
      );

      if (!metadata) continue;

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
        discovery.filePath + '.proto',
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
        useValue: new GrpcServiceClient(
          {
            clientId: clientId,
            serviceName: metadata?.serviceName,
            url: clientConfig.url,
            credentials: clientConfig.credentials,
            packageName: discovery.packageName,
          },
          pkg
        ),
      });
    }
  }
}
