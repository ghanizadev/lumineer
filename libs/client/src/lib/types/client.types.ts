import * as gRPC from '@grpc/grpc-js';

export type GrpcClientPluginOptions = {
  /*
   * When should the discovery run:
   * - `true`: every server start
   * - `false`: Do not run
   * - `if-not-present`: Run if the configuration is not present
   * */
  discovery?: boolean | 'if-not-present';
  /*
   * If `true`, offline clients won't prevent the server to start, but an
   * exception will raise if client is accessed while still offline
   * */
  ignoreOfflineClients?: boolean;
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
