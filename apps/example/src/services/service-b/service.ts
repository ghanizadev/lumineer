import {
  ArgumentType,
  BodyParam,
  NotFoundException,
  ReturnType,
  RPC,
  Service,
} from '@lumineer/core';
import { DataSource } from 'typeorm';
import {
  GetUserInput,
  ServiceBInput,
  ServiceBOutput,
  UserMessage,
} from './dto';
import { User } from './model';

@Service()
export class ServiceB {
  constructor(private readonly dataSource: DataSource) {}

  @RPC()
  @ArgumentType(ServiceBInput)
  @ReturnType(ServiceBOutput)
  private async createUser(
    @BodyParam() body: ServiceBInput
  ): Promise<ServiceBOutput> {
    const user = new User();
    user.name = body.name;
    user.email = body.email;
    user.password = body.password;

    await this.dataSource.mongoManager.save(user);

    return {
      id: user._id.toString(),
    };
  }

  @RPC()
  @ArgumentType(GetUserInput)
  @ReturnType(UserMessage)
  private async getUser(@BodyParam() body: GetUserInput): Promise<UserMessage> {
    const user = await this.dataSource.mongoManager.findOne(User, {
      where: { $or: [{ email: body.email }, { _id: body.id }] },
    });

    if (!user) throw new NotFoundException('User not found');

    return {
      ...user,
      id: user._id.toString(),
    };
  }
}
