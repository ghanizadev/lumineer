import 'reflect-metadata';

import { GRPCServer } from '@cymbaline/core';
import { ServerReflection } from '@cymbaline/server-reflection';
import { ServiceModule } from './services/service-a/service';
import { ServiceWithAReallyLongNameIndeed } from './services/service-b/service';
import { GrpcClientPlugin } from '@cymbaline/client';

const PORT = process.env.PORT ?? 50051;

const main = async () => {
  const server = new GRPCServer({
    services: [ServiceModule, ServiceWithAReallyLongNameIndeed],
    config: {
      logger: true,
    },
  });

  server.use(ServerReflection);
  server.registerPlugin(GrpcClientPlugin);
  await server.run('0.0.0.0:' + PORT);
};

main();
