import * as gRPC from '@grpc/grpc-js';
import { GrpcException } from './base.exception';

/*
 * The caller does not have permission to execute the specified operation.
 * `PERMISSION_DENIED` must not be used for rejections caused by exhausting
 * some resource (use `RESOURCE_EXHAUSTED` instead for those errors).
 * `PERMISSION_DENIED` must not be used if the caller can not be identified
 * (use `UNAUTHENTICATED` instead for those errors). This error code does not
 * imply the request is valid or the requested entity exists or satisfies other
 * pre-conditions.
 * */
export class PermissionDeniedException extends GrpcException {
  constructor(message?: string) {
    super(gRPC.status.PERMISSION_DENIED, message);
  }
}
