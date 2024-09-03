import * as gRPC from '@grpc/grpc-js';
import { ServerException } from './base.exception';

/*
 * The request does not have valid authentication credentials for the operation.
 * */
export class UnauthenticatedException extends ServerException {
  constructor(message?: string) {
    super(gRPC.status.UNAUTHENTICATED, message);
  }
}
