import * as gRPC from '@grpc/grpc-js';
import { GrpcException } from './base.exception';

/*
 * The request does not have valid authentication credentials for the operation.
 * */
export class UnauthenticatedException extends GrpcException {
  constructor(message?: string) {
    super(gRPC.status.UNAUTHENTICATED, message);
  }
}
