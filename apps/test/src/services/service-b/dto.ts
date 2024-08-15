import { MessageType, StringPropertyType } from '@cymbaline/core';

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
