import { Database } from '../../database';
import {
  ArgumentType,
  BodyParam,
  ReturnType,
  RPC,
  Service,
} from '@cymbaline/core';
import { ServiceBInput, ServiceBOutput } from './dto';

@Service()
export class ServiceB {
  constructor(private readonly db: Database) {}

  @RPC()
  @ArgumentType(ServiceBInput)
  @ReturnType(ServiceBOutput)
  private async makeUsername(
    @BodyParam() body: ServiceBInput
  ): Promise<ServiceBOutput> {
    return {
      username:
        body.name.toLowerCase() +
        '#' +
        Math.floor(Math.random() * 10000)
          .toString()
          .padStart(4, '0'),
    };
  }
}
