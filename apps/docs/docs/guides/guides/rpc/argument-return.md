---
sidebar_position: 2
title: Argument and Return
---

RPC's can accept an optional argument and may return a value, depending on the type of the RPC.

To define arguments and/or responses, pass the message type to the RPC decorator:

```typescript
import { UnaryCall } from './rpc.decorator';
import { Payload } from './param.decorator';

@Service()
class Service {
  @UnaryCall({ argument: MyArgument, return: MyReturn })
  private async MyRpc(@Payload() payload: MyArgument): Promise<MyReturn> {
    // [...]
  }
}
```

In this example, `MyArgument` is a message decorated with a `@Message()` decorator. The same applies to `MyReturn`
