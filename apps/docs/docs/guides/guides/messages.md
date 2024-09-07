---
title: Messages
sidebar_position: 2
---

Messages are defined by the [`@Message()`](#) decorator imported from the core package.

An example of a message is:

```typescript
import { PropertyType, Message } from '@lumineer/core';

@Message()
class Article {
  @PropertyType('int32')
  id: number;

  @PropertyType('string')
  body: string;

  @PropertyType('string')
  publishedAt: Date;

  @PropertyType('string')
  lastChangedAt: Date;
}
```
Like in services, you can pass a different name into the decorator to override the class name:

```typescript
@Message({ typeName: 'Article' })
class PublicArticle {
// [...]
}
```

## Properties

To define our properties, we can use the `@PropertyType()` decorator.

In `protobuf` words, property decorated with `@PropertyType()` can be translated to [scalar types](https://protobuf.dev/programming-guides/proto3/#scalar) or [map](https://protobuf.dev/programming-guides/proto3/#maps).

The API is really simple:

```typescript
import { PropertyType } from '@lumineer/core';

@Message()
class GameRoom {
  @PropertyType('uint')
  numOfPlayers: number;
  
  // [...]
}
```
For custom types, or maps, it may require additional parameters, which can be passed in the second argument.

## Reference another message

If you wish to reference another message or enum, use the `@MessageRef()` decorator.

Here is an example:

```typescript
import { PropertyType, Enum, MessageRef } from '@lumineer/core';

@Enum()
class GameRoomAccess {
  static PUBLIC = 0;
  static PRIVATE = 1;
}

@Message()
class GameRoom {
  @MessageRef(GameRoomAccess)
  roomAccess: number;
  
  // [...]
}
```
The decorator also support block-scoped messages, which will generate a new message only available to the block where it was referenced:

```typescript
import { PropertyType, MessageRef } from '@lumineer/core';

@Message()
class MatchOptions {
  @PropertyType('uint32')
  maxDuration: number;

  // [...]
}

@Message()
class Player {
  // [...]
}

@Message()
class GameRoom {
  @MessageRef(MatchOptions, { blockScoped: true })
  matchOptions: MatchOptions;

  @MessageRef(Player)
  roomOwner: Player;
  // [...]
}
```

Which generates:


```protobuf
syntax = "proto3";

package com.ghanizadev.lumineer;

message Player {
  // [...]
}

message GameRoom {
  message MatchOptions {
    uint32 maxDuration = 1;
  }
  MatchOptions matchOptions = 2;
  optional Player roomOwner = 3;
}
```

## Property modifiers

Properties decorators also define modifiers, like `optional` for non-required fields and `repeated` which represent arrays.

Example:

```typescript
import { PropertyType, MessageRef } from '@lumineer/core';

@Message()
class Player {
  // [...]
}

@Message()
class GameRoom {
  @MessageRef(Player, { repeated: true })
  players: Player[];
  
  @PropertyType('string', { optional: true })
  roomName?: string;
  
  // [...]
}
```

These classes would generate the following `protobuf` definition:

```protobuf
syntax = "proto3";

package com.ghanizadev.lumineer;

message Player {
  // [...]
}

message GameRoom {
  repeated Player players = 1;
  optional string roomName = 2;
}

```

## Enum

Sadly we cannot decorate enums in Typescript yet, so we have to be creative. Instead of regular enums, we can create class enums, which relies on static properties to define its values.

Here is an example:

```typescript
import { Enum } from '@lumineer/core';

@Enum()
class MyEnum {
  static FIRST = 0;
  static SECOND = 1;
}
```

With this approach we can use the enum as follows:

```typescript
import { Service, Payload, Enum, MessageRef, Message, UnaryCall } from '@lumineer/core';

@Enum()
class MyEnum {
  static FIRST = 0;
  static SECOND = 1;
}

@Message()
class MyMessage {
  @MessageRef(MyEnum)
  myEnumValue: number;
}

@Service()
class MyEnum {
  @UnaryCall({ return: MyMessage })
  private async Foo(): Promise<MyMessage> {
    return {
      myEnumValue: MyEnum.FIRST,
      // [...]
    }
  }
}
```

## Map

A map `map<key, value>` are a way to create a sub-object inside a message without having to create a new message.

Maps can have `string` or a non-floating-point number (`uint`, `int32`...) as key, and any other data types as value (except for another map, see below).

In Lumineer, maps can be generated as follows:

```typescript
import { PropertyType } from './property.decorator';

@Message()
class MessageWithMap {
  @PropertyType('map', { key: 'string', value: 'bytes' })
  myMapValue: Record<string, Buffer>
}
```

this would be translated to `protobuf` as:

```protobuf
message MessageWithMap {
  map<string, bytes> myMapValue = 1;
}
```

:::warning

Maps cannot have another map as value, due to `protobuf` [limitation](https://protobuf.dev/programming-guides/proto3/#maps). If you desire to have nested maps, consider refactoring to different messages or using [references](#reference-another-message).

:::

## OneOf

When it comes for optional properties, it is possible to use `oneof`'s to group these properties.

To define a simple `oneof`:

```typescript
import { Message } from './message.decorator';
import { OneOf, PropertyType } from './property.decorator';

@Message()
class MyMessage {
  @OneOf('IdOrEmail')
  @PropertyType('int32')
  id?: number;

  @OneOf('IdOrEmail')
  @PropertyType('string')
  email?: string;

  @PropertyType('string')
  otherProperty: string;
}
```

Which generates:

```protobuf
syntax = "proto3";

package com.ghanizadev.lumineer;

message MyMessage {
  oneof IdOrEmail {
    int32 id = 1;
    string email = 2;
  }
  string otherProperty = 3;
}
```

The `@OneOf()` decorator only defines the `oneof`'s group name. To create another group, simply add a new decorator with a different label.

:::info

Each `oneof` must have at least 2 properties.

:::
