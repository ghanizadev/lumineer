# Lumineer

<p align="center">A code-first gRPC framework for building efficient services</p>

## Getting started

---

### Install the packages

Install the package using your favorite package manager:

```shell
npm install --save @lumineer/core
```

### Minimal setup

Create the service definition:

```typescript
@Message()
class CreateUser {
  @PropertyType('string')
  username: string;

  @PropertyType('string')
  email: string;

  @PropertyType('string')
  passoword: string;
}

@Message()
class User {
  @PropertyType('string')
  id: string;

  @PropertyType('string')
  username: string;

  @PropertyType('string')
  email: string;

  @PropertyType('DateTime')
  createdAt: Date;

  @PropertyType('DateTime')
  updatedAt: Date;
}

@Service()
class UserService {
  @RPC()
  @ArgumentType(CreateUser)
  @ReturnType(User)
  private async CreateUser(@BodyParam() requestBody: CreateUser): Promise<User> {
    const user = await this.repository.createUser(requestBody);
    return user;
  }
}
```
And then start the server:

```typescript
const PORT = 50051

async function run() {
  const server = new GRPCServer({
    services: [UserService],
    config: {
      logger: true,
      credentials: ServerCredentials.createInsecure(),
      packageName: 'com.ghanizadev.lumineer',
    },
  });

  await server.run('0.0.0.0:' + PORT);
}

run();
```

The service is now available at `localhost:50051`.

### Documentation

Check the package [documentation](https://cybaline.ghanizadev.com) for a more detailed information

## License

---
