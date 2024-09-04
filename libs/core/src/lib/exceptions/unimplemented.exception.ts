import * as gRPC from '@grpc/grpc-js';
import { ServerException } from './base.exception';

/**
 * The operation is not implemented or is not supported/enabled in this service.
 *
 * @category Exceptions
 * */
export class UnimplementedException extends ServerException {
  constructor(message?: string) {
    super(gRPC.status.UNIMPLEMENTED, message);
  }
}
