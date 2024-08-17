import { MessageType, StringPropertyType } from '@cymbaline/core';

@MessageType()
export class InputMessageType {
  @StringPropertyType({ required: true })
  name: string;
}

@MessageType()
export class ReturnMessageType {
  @StringPropertyType()
  status: string;

  @StringPropertyType()
  message: string;
}
