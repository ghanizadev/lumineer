import { ServerException } from './exceptions/base.exception';

export class ExceptionHandler {
  static handleError(e: Error, call: any, callback: any) {
    if (e instanceof ServerException) {
      if (callback) {
        callback(e.toException());
      } else {
        call.emit('error', e.toException());
      }
    }
  }
}
