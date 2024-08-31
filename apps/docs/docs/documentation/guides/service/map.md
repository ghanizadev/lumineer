---
sidebar_position: 4
title: Map
---

A map `map<key, value>` are a way to create a sub-object inside a message without having to create a new message.

Maps can have `string` or a non-floating-point number (`uint`, `int32`...) as key, and any other data types as value.

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

Also, maps cannot have another map as value, due to `protobuf` [limitation](https://protobuf.dev/programming-guides/proto3/#maps). If you desire to have nested maps, consider refactoring to different messages or using [references](/docs/tutorial/guides/service/property-type#reference-another-message).
