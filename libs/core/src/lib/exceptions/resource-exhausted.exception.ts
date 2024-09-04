import * as gRPC from '@grpc/grpc-js';
import { ServerException } from './base.exception';

/**
 * Some resource has been exhausted, perhaps a per-user quota, or perhaps the
 * entire file system is out of space.
 *
 * @category Exceptions
 * */
export class ResourceExhaustedException extends ServerException {
  constructor(message?: string) {
    super(gRPC.status.RESOURCE_EXHAUSTED, message);
  }
}
