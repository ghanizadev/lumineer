import * as gRPC from '@grpc/grpc-js';
import { GrpcException } from './base.exception';

/*
 * Unknown error. For example, this error may be returned when a `Status` value
 * received from another address space belongs to an error space that is not
 * known in this address space. Also, errors raised by APIs that do not return
 * enough error information may be converted to this error.
 * */
export class UnknownException extends GrpcException {
  constructor(message?: string) {
    super(gRPC.status.UNKNOWN, message);
  }
}
