export class GrpcException extends Error {
  constructor(public readonly code: number, public readonly message: string) {
    super(message);
  }

  public toException() {
    return {
      details: this.message,
      code: this.code,
    };
  }
}
