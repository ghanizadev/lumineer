---
title: Service
---

A minimal service configuration is:

```typescript
import { 
  PropertyType,
  Message,
  Service,
  RPC,
  ArgumentType,
  ReturnType,
  BodyParam
} from '@lumineer/core';

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
    // [...]
  }
}
```

This can be translated to a `protobuf` file like:

```protobuf
syntax = "proto3";

package com.ghanizadev.lumineer;

service UserService {
  rpc CreateUser (CreateUser) returns (User) {};
}

message CreateUser {
  string username = 1;
  string email = 2;
  string password = 3;
}

message User {
  string id = 1;
  string username = 2;
  string email = 3;
  string createdAt = 4;
  string updatedAt = 5;
}

```

Optionally, you can pass an alternative name to be used by this class:

```typescript
@Service('CustomName')
class UserService {
// [...]
}
```
