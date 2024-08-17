import {
  MessageType,
  NumberPropertyType,
  StreamMessageType,
  StringPropertyType,
} from '@cymbaline/core';

@MessageType()
export class InputType {
  @StringPropertyType({ required: true })
  name: string;
}

@StreamMessageType()
export class ReturnType {
  @StringPropertyType()
  status: string;

  @StringPropertyType()
  message: string;
}

@MessageType({ stream: true })
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
