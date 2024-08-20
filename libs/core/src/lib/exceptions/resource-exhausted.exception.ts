import * as gRPC from '@grpc/grpc-js';
import { GrpcException } from './base.exception';

/*
 * Some resource has been exhausted, perhaps a per-user quota, or perhaps the
 * entire file system is out of space.
 * */
export class ResourceExhaustedException extends GrpcException {
  constructor(message?: string) {
    super(gRPC.status.RESOURCE_EXHAUSTED, message);
  }
}
