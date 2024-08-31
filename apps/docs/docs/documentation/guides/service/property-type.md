---
sidebar_position: 2
title: Property Type
---

It is used along with messages to define property types.

Property values can be translated to [scalar types](https://protobuf.dev/programming-guides/proto3/#scalar) or [map](https://protobuf.dev/programming-guides/proto3/#maps) in the `protobuf` world.

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
