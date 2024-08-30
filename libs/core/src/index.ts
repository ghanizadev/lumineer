//Re-exports
export {
  ServerCredentials,
  ChannelCredentials,
  Metadata as MetadataContent,
} from '@grpc/grpc-js';
export { injectable as Injectable, singleton as Singleton } from 'tsyringe';

export * from './lib';
