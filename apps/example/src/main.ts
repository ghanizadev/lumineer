import 'reflect-metadata';

import { GRPCServer, ServerCredentials } from '@cymbaline/core';
import { ServerReflectionPlugin } from '@cymbaline/server-reflection';
import { ServiceModule } from './services/service-a/service';
import { ServiceB } from './services/service-b/service';
import { GrpcClientPlugin } from '@cymbaline/client';
import { ChannelCredentials } from '@grpc/grpc-js';
import { DataSource } from 'typeorm';
import { DatabaseConnection } from './database';

const PORT = process.env.PORT ?? 50051;

const main = async () => {
  const server = new GRPCServer({
    services: [ServiceModule, ServiceB],
    providers: [
      {
        provide: DataSource,
        useValue: DatabaseConnection.configure(),
      },
    ],
    config: {
      logger: true,
      credentials: ServerCredentials.createInsecure(),
      proto: {
        // generate: process.env.NODE_ENV !== 'production',
      },
      packageName: 'some.service',
    },
  });

  server.registerPlugin(ServerReflectionPlugin);
  server.registerPlugin(
    new GrpcClientPlugin({
      discovery: process.env.NODE_ENV !== 'production',
      ignoreOfflineClients: true,
      clients: {
        'post-service': {
          url: '127.0.0.1:50052',
          credentials: ChannelCredentials.createInsecure(),
        },
      },
    })
  );
  await server.run('0.0.0.0:' + PORT);
};

main().catch();
