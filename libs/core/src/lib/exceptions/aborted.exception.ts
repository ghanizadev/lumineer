import * as gRPC from '@grpc/grpc-js';
import { GrpcException } from './base.exception';

/*
 * The operation was aborted, typically due to a concurrency issue such as a
 * sequencer check failure or transaction abort. See the guidelines above for
 * deciding between `FAILED_PRECONDITION`, `ABORTED`, and `UNAVAILABLE`.
 * */
export class AbortedException extends GrpcException {
  constructor(message?: string) {
    super(gRPC.status.ABORTED, message);
  }
}
