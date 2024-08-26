# Cymbaline

<p align="center">A code-first gRPC framework for building efficient services</p>

## Description

---

## Goals

---

## Getting started

---

### Install the packages

Install the package using your favorite package manager:

```shell
npm install --save @cymbaline/core
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
      packageName: 'com.ghanizadev.cymbaline',
    },
  });

  await server.run('0.0.0.0:' + PORT);
}

run();
```

The service is now available at `localhost:50051`.

### Using server reflection

To use server reflection, install the plugin:

```shell
npm install --save @cymbaline/server-reflection
```
And add it to your server configuration:

```typescript
async function run() {
  const server = new GRPCServer({ ... });

  server.registerPlugin(ServerReflectionPlugin)

  await server.run('0.0.0.0:' + PORT);
}

run();
```
And done, as simple as that. Now your server is using server reflection.

For more information, please check the [plugin documentation](libs/server-reflection/README.md).

### Connecting to other services

You can connect to other services using the `@grpc/grpc-js` module, but here we provide a solution more suited to the purpose of this package.

Install the client plugin:

```shell
npm install --save @cymbaline/client 
```

And hook the plugin into our server:

```typescript
async function run() {
  const server = new GRPCServer({ ... });

  server.registerPlugin(new GrpcClientPlugin({
    clients: {
      "news-service": {
        url: "localhost:50052",
        credentials: ChannelCredentials.createInsecure(),
        protoPath: path.join(__dirname, "..", "protos", "news_service.proto")
      }
    }
  }))

  await server.run('0.0.0.0:50051');
}

run();
```

And then inside our service, we can inject the provider:

```typescript
@Service()
class UserService {
  constructor(
    @GrpcClient('news-service', "NewsService") newsServiceClient: GrpcServiceClient
  ) {}

  @RPC()
  @ArgumentType(PublishArticle)
  @ReturnType(Article)
  private async PublishNews(@BodyParam() requestBody: PublishArticle): Promise<User> {
    const article = await this.newsServiceClient.unaryRequest('GetArticleById', { id: body.articleId });
    [...]
  }
}
```

#### Connecting to other services using server reflection

If the client service uses reflection, you can just swap the proto path configuration and flag it should be using reflection instead:

```diff
async function run() {
  const server = new GRPCServer({ ... });

  server.registerPlugin(new GrpcClientPlugin({
    clients: {
      "news-service": {
        url: "localhost:50052",
        credentials: ChannelCredentials.createInsecure(),
-       protoPath: path.join(__dirname, "..", "protos", "news_service.proto")
+       useReflection: true,
      }
    }
  }))

  await server.run('0.0.0.0:50051');
}

run();
```
It will work just as before, except the server now can update the service definition on every build - or every restart if it is running in development.

For more information, please check the [plugin documentation](libs/client/README.md).

### Using providers

Cymbaline uses dependency injection to resolve any instance. Because of this, you can create providers to be injected at runtime.

```typescript
import { DataSource } from 'typeorm';

async function run() {
  const server = new GRPCServer({
    services: [UserService],
    providers: [
      {
        token: DataSource,
        useValue: new DataSource({
          // [...]
        }).initialize()
      }
    ]
  });

  await server.run('0.0.0.0:50051');
}

run();
```
Providers are registered in the global scope of the application, so it could be used in any service.

```typescript
import { DataSource } from 'typeorm';

@Service()
class UserService {
  constructor(
    private readonly dataSource: DataSource
  ) { }

  @RPC()
  @ArgumentType(GetUserInput)
  @ReturnType(User)
  private async GetUser(@BodyParam() requestBody: GetUserInput): Promise<User> {
    const user = await this.dataSource.findOne({ where: [{ id: requestBody.userId }, { email: requestBody.email }] })
    // [...]
  }
}
```

### Advanced service definition

Check the package documentation for a more detailed information

## License

---
