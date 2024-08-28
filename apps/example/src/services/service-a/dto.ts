import { Message, Enum, PropertyType, MessageRef, OneOf } from '@lumineer/core';

@Message()
export class InputMessageType {
  @PropertyType('string', { required: true })
  name: string;
}

@Enum()
export class MyEnum {
  static readonly YES = 0;
  static readonly NO = 1;
}

@Message()
export class MappedMessageType {
  @PropertyType('string')
  status: string;

  @PropertyType('string')
  message: string;
}

@Message()
export class ReturnMessageType {
  @PropertyType('string')
  status: string;

  @PropertyType('map', { key: 'string', value: MappedMessageType })
  message: { [key: string]: MappedMessageType };
}

@Message()
export class AnotherMessage {
  @PropertyType('string')
  status: string;
}

@Message()
export class PingRequest {
  @PropertyType('string')
  message: string;

  @OneOf('Color')
  @PropertyType('string')
  colorName: string;

  @OneOf('Color')
  @PropertyType('int32')
  colorDec: number;

  @MessageRef(AnotherMessage, { blockScoped: true })
  scoped: AnotherMessage;
}

@Message()
export class PingResponse {
  @PropertyType('string')
  pong: string;

  @PropertyType('string')
  randomNumber: number;

  @MessageRef(MyEnum)
  myEnumProperty: MyEnum;
}
