import * as gRPC from '@grpc/grpc-js';
import { ServerException } from './base.exception';

/*
 * The deadline expired before the operation could complete. For operations that
 * change the state of the system, this error may be returned even if the
 * operation has completed successfully. For example, a successful response
 * from a server could have been delayed long
 * */
export class DeadlineExceededException extends ServerException {
  constructor(message?: string) {
    super(gRPC.status.DEADLINE_EXCEEDED, message);
  }
}
