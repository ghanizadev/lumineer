import * as gRPC from '@grpc/grpc-js';
import { GrpcException } from './base.exception';

/*
 * The operation is not implemented or is not supported/enabled in this service.
 * */
export class UnimplementedException extends GrpcException {
  constructor(message?: string) {
    super(gRPC.status.UNIMPLEMENTED, message);
  }
}
