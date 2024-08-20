import 'reflect-metadata';

import { GRPCServer, ServerCredentials } from '@cymbaline/core';
import { ServerReflectionPlugin } from '@cymbaline/server-reflection';
import { ServiceModule } from './services/service-a/service';
import { GrpcClientPlugin } from '@cymbaline/client';
import { ChannelCredentials } from '@grpc/grpc-js';

const PORT = process.env.PORT ?? 50051;

const main = async () => {
  const server = new GRPCServer({
    services: [ServiceModule],
    config: {
      logger: true,
      credentials: ServerCredentials.createInsecure(),
    },
  });

  server.registerPlugin(ServerReflectionPlugin);
  server.registerPlugin(
    GrpcClientPlugin.configure({
      clients: {
        '127.0.0.1:50052': {
          credentials: ChannelCredentials.createInsecure(),
        },
      },
    })
  );
  await server.run('0.0.0.0:' + PORT);
};

main().catch();
