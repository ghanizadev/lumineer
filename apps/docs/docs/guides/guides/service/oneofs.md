---
sidebar_position: 5
title: OneOf
---

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

PS.: Each `oneof` must have at least 2 properties.
