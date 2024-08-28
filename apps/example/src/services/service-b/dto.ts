import { Message, OneOf, PropertyType } from '@lumineer/core';

@Message()
export class ServiceBInput {
  @PropertyType('string')
  name: string;

  @PropertyType('string')
  email: string;

  @PropertyType('string')
  password: string;
}

@Message()
export class ServiceBOutput {
  @PropertyType('string')
  id: string;
}

@Message()
export class GetUserInput {
  @OneOf('IdOrEmail')
  @PropertyType('string')
  id?: string;

  @OneOf('IdOrEmail')
  @PropertyType('string')
  email?: string;
}

@Message()
export class UserMessage {
  @PropertyType('string')
  id?: string;

  @PropertyType('string')
  name?: string;

  @PropertyType('string')
  email?: string;
}
