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

Define your configuration.

`lumineer.config.js`:

```javascript
/** @type {import('@lumineer/core').LumineerConfig}  */
module.exports = {
  packageName: 'com.package.my',
};
```

Create the service definition

`service.ts`:

```typescript
import { Message, PropertyType, UnaryCall, Service } from "@lumineer/core";

@Message()
class CreateUser {
  @PropertyType('string')
  username: string;

  @PropertyType('string')
  email: string;

  @PropertyType('string')
  password: string;
}

@Message()
class User {
  @PropertyType('string')
  id: string;

  @PropertyType('string')
  username: string;

  @PropertyType('string')
  email: string;

  @PropertyType('string')
  createdAt: Date;

  @PropertyType('string')
  updatedAt: Date;
}

@Service()
export class UserService {
  @UnaryCall({ argument: CreateUser, return: User })
  private async CreateUser(@BodyParam() requestBody: CreateUser): Promise<User> {
    const user = await this.repository.createUser(requestBody);
    return user;
  }
}
```

And then start the server:

`main.ts`:

```typescript
import { Lumineer, UnaryCall, Service, ServerCredentials } from "@lumineer/core";
import { UserService } from "./service";

const PORT = 50051

async function run() {
  const server = new Lumineer({
    services: [UserService],
    credentials: ServerCredentials.createInsecure(),
  });

  await server.run('0.0.0.0:' + PORT);
}

run();
```

The service is now available at `localhost:50051`.

### Documentation

Check the package [documentation](https://lumineer.ghanizadev.com) for a more detailed information

## License

MIT License Copyright (c) 2024 Lumineer

---
