import { GrpcException } from './exceptions/base.exception';

export class ExceptionHandler {
  static handleError(e: Error, call: any, callback: any) {
    if (e instanceof GrpcException) {
      if (callback) {
        callback(e.toException());
      } else {
        call.emit('error', e.toException());
      }
    }
  }
}
