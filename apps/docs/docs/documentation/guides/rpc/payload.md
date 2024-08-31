---
sidebar_position: 3
title: Payload
---

Payload is the data that may come with a call if the `argument` option was supplied to the [call decorator](/docs/documentation/guides/rpc/call).

To access the request payload, use the `@Payload()` decorator.

## Example

```typescript
import { UnaryCall, Payload, Service } from '@lumineer/core';

@Service()
class MyService {
  @UnaryCall({ argument: MyPayload })
  private async DoFoo(@Payload() payload: MyPayload) {
    // Process the payload
  }
}
```
