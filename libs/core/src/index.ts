import * as gRPC from '@grpc/grpc-js';
import * as tsyringe from 'tsyringe';

/**
 * @category External references
 * */
export abstract class ServerCredentials extends gRPC.ServerCredentials {}

/**
 * @category External references
 * */
export abstract class ChannelCredentials extends gRPC.ChannelCredentials {}

/**
 * @category External references
 * */
export type MetadataContent = gRPC.Metadata;

/**
 * @category External references
 * */
export const Injectable = tsyringe.injectable;

/**
 * @category External references
 * */
export const Singleton = tsyringe.singleton;

export * from './lib';
