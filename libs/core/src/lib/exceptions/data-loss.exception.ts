import * as gRPC from '@grpc/grpc-js';
import { ServerException } from './base.exception';

/*
 * Unrecoverable data loss or corruption.
 * */
export class DataLossException extends ServerException {
  constructor(message?: string) {
    super(gRPC.status.DATA_LOSS, message);
  }
}
