import * as gRPC from '@grpc/grpc-js';
import { ServerException } from './base.exception';

/*
 * Internal errors. This means that some invariants expected by the underlying
 * system have been broken. This error code is reserved for serious errors.
 * */
export class InternalException extends ServerException {
  constructor(message?: string) {
    super(gRPC.status.INTERNAL, message);
  }
}
