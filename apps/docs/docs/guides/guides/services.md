---
title: Services
sidebar_position: 1
---

In this guide we will learn how to make your first services with Lumineer, from bottom up.

Services are the base of our application, here we can define the handler methods of our RPCs and make use of our messages and other structures

For example, a minimal service configuration could be defined as:

```typescript
import {
  PropertyType,
  Message,
  Service,
  Payload,
  UnaryCall,
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

  @PropertyType('string')
  createdAt: Date;

  @PropertyType('string')
  updatedAt: Date;
}

@Service()
class UserService {
  @UnaryCall({ argument: CreateUser, return: User })
  private async CreateUser(@Payload() requestBody: CreateUser): Promise<User> {
    // [...]
  }
}
```

And this can be translated to a `protobuf` file like:

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

Services are instantiated when the server starts, and it will be reused during the execution. It uses a dependency injection container, which allows automatically instancing classes. 

Optionally, we can override the service name using the optional argument of the `@Service()` decorator:

```typescript
@Service({ name: 'UserService' })
class UserServiceV2 {}

```
