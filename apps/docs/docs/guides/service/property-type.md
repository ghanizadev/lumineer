---
sidebar_position: 2
title: Property Type
---

It is used along with messages to define property types.

Property values can be translated to [scalar types](https://protobuf.dev/programming-guides/proto3/#scalar) or [map](https://protobuf.dev/programming-guides/proto3/#maps) in the `protobuf` world.

The API is really simple:

```typescript
import { PropertyType } from './property.decorator';

@Message()
class GameRoom {
  @PropertyType('uint')
  numOfPlayers: number;
  
  // [...]
}
```
For custom types, or maps, it may require additional parameters, which can be passed in the second argument.
