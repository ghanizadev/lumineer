---
sidebar_position: 3
title: Enums
---

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
import { Service } from '@lumineer/core';
import { Payload } from './param.decorator';

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
