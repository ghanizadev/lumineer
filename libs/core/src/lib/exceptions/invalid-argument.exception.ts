import * as gRPC from '@grpc/grpc-js';
import { ServerException } from './base.exception';

/**
 * The client specified an invalid argument. Note that this differs from
 * `FAILED_PRECONDITION`. `INVALID_ARGUMENT` indicates arguments that are
 * problematic regardless of the state of the system (e.g., a malformed file
 * name).
 *
 * @category Exceptions
 * */
export class InvalidArgumentException extends ServerException {
  constructor(message?: string) {
    super(gRPC.status.INVALID_ARGUMENT, message);
  }
}
