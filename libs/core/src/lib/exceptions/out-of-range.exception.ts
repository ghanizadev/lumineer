import * as gRPC from '@grpc/grpc-js';
import { ServerException } from './base.exception';

/**
 * The operation was attempted past the valid range. E.g., seeking or reading
 * past end-of-file. Unlike `INVALID_ARGUMENT`, this error indicates a problem
 * that may be fixed if the system state changes. For example, a 32-bit file
 * system will generate `INVALID_ARGUMENT` if asked to read at an offset that
 * is not in the range [0,2^32-1], but it will generate `OUT_OF_RANGE` if asked
 * to read from an offset past the current file size. There is a fair bit of
 * overlap between `FAILED_PRECONDITION` and `OUT_OF_RANGE`. We recommend using
 * `OUT_OF_RANGE` (the more specific error) when it applies so that callers who
 * are iterating through a space can easily look for an `OUT_OF_RANGE` error to
 * detect when they are done.
 *
 * @category Exceptions
 * */
export class OutOfRangeException extends ServerException {
  constructor(message?: string) {
    super(gRPC.status.OUT_OF_RANGE, message);
  }
}
