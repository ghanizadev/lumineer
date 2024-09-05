---
sidebar_position: 5
title: Stream
---

Streams are present in all call types except for unary calls (as the name suggests).

To access the stream instance, use the `@Stream()` decorator.

Each call type has a different stream type, be careful to use the correct one:

  - Client streams (`@ClientStreamCall()`): uses `Readable` streams;
  - Server streams (`@ServerStreamCall()`): uses `Writable` streams;
  - Bidirectional streams (`@BidirectionalStreamCall()`): uses `Duplex` streams;

For more information about streams, check [Node.js Stream](https://nodejs.org/api/stream.html) API.

## Example

```typescript
import { ClientStream, Service, Stream } from '@lumineer/core';
import type { Readable } from "node:stream"

@Service()
class MyService {
  @ClientStreamCall()
  private async DoFoo(@Stream() stream: Readable) {
    // Process the data
  }
}
```
