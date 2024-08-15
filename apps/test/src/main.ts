import 'reflect-metadata';

import { GRPCServer } from '@cymbaline/core';
import { ServerReflection } from '@cymbaline/server-reflection';
import { ServiceModule } from './services/service-a/service';
import { ServiceWithAReallyLongNameIndeed } from './services/service-b/service';

const main = async () => {
  const server = new GRPCServer({
    services: [ServiceModule, ServiceWithAReallyLongNameIndeed],
    config: {
      logger: true,
    },
  });

  server.use(ServerReflection);
  await server.run(50051);
};

main();
