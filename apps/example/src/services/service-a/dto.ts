import { Message, Enum, PropertyType, MessageRef } from '@cymbaline/core';

@Message()
export class InputMessageType {
  @PropertyType('string', { required: true })
  name: string;
}

@Enum()
export class MyEnum {
  readonly YES = 0;
  readonly NO = 1;
}

@Message()
export class ReturnMessageType {
  @PropertyType('string')
  status: string;

  @PropertyType('string')
  message: string;
}

@Message()
export class PingRequest {
  @PropertyType('string')
  message: string;
}

@Message()
export class PingResponse {
  @PropertyType('string')
  pong: string;

  @PropertyType('string')
  randomNumber: number;

  // @MessageRef(MyEnum)
  enum: MyEnum;
}
