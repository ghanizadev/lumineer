import { GrpcPlugin, GrpcPluginContext } from '@cymbaline/core';
import * as protoLoader from '@grpc/proto-loader';
import * as gRPC from '@grpc/grpc-js';
import { GrpcServiceClient } from './service-client';
import { Discover } from './discover';
import * as _ from 'lodash';

export class GrpcClientPlugin extends GrpcPlugin {
  private readonly serviceMap: Record<string, any> = {};

  public getClientConfiguration() {
    return this.serviceMap;
  }

  configure(context: GrpcPluginContext): Promise<void> | void {
    context.dependencyContainer.register('GRPC_CLIENT', {
      useValue: new GrpcServiceClient(this),
    });

    context.registerHook('preBind', ({ targetClass }) => {
      const keys = Reflect.getMetadataKeys(targetClass);

      for (const key of keys) {
        if (key.startsWith('grpc-client:') && !this.serviceMap[key]) {
          const metadata = Reflect.getMetadata(key, targetClass);
          const discovery = new Discover(metadata.url);

          this.serviceMap[key] = { ...metadata };
          const protoPath = discovery.protoFilePath;

          discovery.introspect().then(() => {
            const pkgDefinition = protoLoader.loadSync(protoPath + '.proto', {
              keepCase: true,
              longs: String,
              enums: String,
              defaults: true,
              oneofs: true,
            });

            this.serviceMap[key] = _.merge(this.serviceMap[key], {
              pkg: gRPC.loadPackageDefinition(pkgDefinition),
            });
          });
        }
      }
    });
  }
}
