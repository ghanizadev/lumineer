import { Message, PropertyType } from '@cymbaline/core';

@Message()
export class ServiceBInput {
  @PropertyType('string')
  name: string;
}

@Message()
export class ServiceBOutput {
  @PropertyType('string')
  username: string;
}
