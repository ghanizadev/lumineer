import * as gRPC from '@grpc/grpc-js';
import { GrpcException } from './base.exception';

/*
 * Some requested entity (e.g., file or directory) was not found. Note to
 * server developers: if a request is denied for an entire class of users, such
 * as gradual feature rollout or undocumented allowlist, `NOT_FOUND` may be used.
 * If a request is denied for some users within a class of users, such as
 * user-based access control, `PERMISSION_DENIED` must be used.
 * */
export class NotFoundException extends GrpcException {
  constructor(message?: string) {
    super(gRPC.status.NOT_FOUND, message);
  }
}
