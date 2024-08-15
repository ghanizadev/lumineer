import {
  MessageType,
  NumberPropertyType,
  StringPropertyType,
} from '@cymbaline/core';

@MessageType()
export class InputType {
  @StringPropertyType({ required: true })
  name: string;
}

@MessageType()
export class ReturnType {
  @StringPropertyType()
  status: string;

  @StringPropertyType()
  message: string;
}

@MessageType()
export class PingRequest {
  @StringPropertyType()
  message: string;
}

@MessageType()
export class PingResponse {
  @StringPropertyType()
  pong: string;

  @NumberPropertyType({ type: 'int32' })
  randomNumber: number;
}
