import * as gRPC from '@grpc/grpc-js';
import { ServerException } from './base.exception';

/**
 * The entity that a client attempted to create (e.g., file or directory)
 * already exists.
 *
 * @category Exceptions
 * */
export class AlreadyExistsException extends ServerException {
  constructor(message?: string) {
    super(gRPC.status.ALREADY_EXISTS, message);
  }
}
