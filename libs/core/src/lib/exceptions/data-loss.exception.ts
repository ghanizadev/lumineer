import * as gRPC from '@grpc/grpc-js';
import { GrpcException } from './base.exception';

/*
 * Unrecoverable data loss or corruption.
 * */
export class DataLossException extends GrpcException {
  constructor(message?: string) {
    super(gRPC.status.DATA_LOSS, message);
  }
}
