import { GrpcPlugin, HookContext } from '@cymbaline/core';
import * as protoLoader from '@grpc/proto-loader';
import * as gRPC from '@grpc/grpc-js';
import { GrpcServiceClient } from './service-client';
import { Discover } from './discover';

export class GrpcClientPlugin extends GrpcPlugin {
  private readonly serviceMap: Record<string, any> = {};

  async preConfig(context: HookContext): Promise<void> {
    const { targetClass } = context.request;

    const keys = Reflect.getMetadataKeys(targetClass);

    for (const key of keys) {
      if (key.startsWith('grpc-client:') && !this.serviceMap[key]) {
        const metadata = Reflect.getMetadata(key, targetClass);
        const discovery = new Discover(metadata.url);
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
