import * as gRPC from '@grpc/grpc-js';
import { GrpcException } from './base.exception';

/*
 * The entity that a client attempted to create (e.g., file or directory)
 * already exists.
 * */
export class AlreadyExistsException extends GrpcException {
  constructor(message?: string) {
    super(gRPC.status.ALREADY_EXISTS, message);
  }
}
