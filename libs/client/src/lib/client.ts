import { GrpcPlugin, HookContext } from '@lumineer/core';
import * as protoLoader from '@grpc/proto-loader';
import * as gRPC from '@grpc/grpc-js';
import { GrpcServiceClient } from './service-client';
import { Discover } from './discover';
import { GrpcClientPluginOptions } from './types';

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

      const discovery = new Discover(clientConfig.url, clientId, credentials);
      await discovery.run().catch((e) => {
        if (!this.options.ignoreOfflineClients) {
          throw e;
        }
      });

      const protoFiles = discovery.allProtoFiles;

      const pkgDefinition = protoLoader.loadSync(protoFiles, {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
      });

      const pkg = gRPC.loadPackageDefinition(pkgDefinition);

      context.dependencyContainer.register('grpc-client:' + clientId, {
        useValue: new GrpcServiceClient(
          {
            clientId: clientId,
            serviceName: metadata?.serviceName,
            url: clientConfig.url,
            credentials: clientConfig.credentials,
            packageName: discovery.packageName,
            failOnLoad: !this.options.ignoreOfflineClients,
          },
          pkg
        ),
      });
    }
  }
}
