---
sidebar_position: 1
title: Call
---

## Unary call

Unary call are the simplest RPC type. I can receive an input and produce an output.

To produce a result, just return the value from the handler, but be careful to provide all the required fields.

It can be defined using the `@UnaryCall()` decorator.

### Example

```typescript
import { UnaryCall } from '@lumineer/core';

@Service()
class Service {
  @UnaryCall()
  private async UnaryCallHandler() {
    // [...]
  }
}
```

## Client stream

It can be defined using the `@ClientStreamCall()` decorator.

Here we expect a stream of data coming from the client, which means we might have multiple invocations in this handler for a single call.

To handle this, we can iterate over the [readable stream](#) provided by the `@Stream()` decorator (see more [here](#).

### Example

```typescript
import { ClientStreamCall } from '@lumineer/core';
import type { Readable } from 'node:stream';

@Service()
class Service {
  @ClientStreamCall()
  private async OtherClientStreamCallHandler(@Stream() stream: Readable) {
    for await (const chunk of stream) {
      // Do something with the chunk
    }

    // Optionally return a value, like done on the unary call example
  }
}
```

## Server Stream

Server stream can be defined by using the `@ServerStreamCall()` decorator.

To handle this type, we can either use [async generators](#) or use the [writable stream](#) provided by the `@Stream()` decorator (see more [here](#).

### Example

```typescript
import { ClientStreamCall, Stream } from '@lumineer/core';
import type { Writable } from "node:stream";

@Service()
class Service {
  constructor(private readonly repository: MyRepository) { }

  @ServerStreamCall()
  private async* ServerStreamCallHandler() {
    const dos = await this.repository.getDocs();

    for (const doc of docs) {
      yield doc;
    }
  }

  @ServerStreamCall()
  private async OtherServerStreamCallHandler(@Stream() stream: Writable) {
    const dos = await this.repository.getDocs();

    for (const doc of docs) {
      stream.write(doc)
    }
    
    stream.end();
  }
}
```

## Bidirectional stream

Bidirectional streams user the `@BidirectionalStreamCall()` decorator, and they act like a `Readable` and a `Writable` stream at the same time.

The easiest way to handle these calls is to use the stream parameters, provided by [`@Stream()`](#). 

### Example

```typescript
import { BidirectionalStreamCall } from '@lumineer/core';
import type { Duplex } from "node:stream";

@Service()
class Service {
  @BidirectionalStreamCall()
  private async BidirectionalStreamCallHandler(@Stream() stream: Duplex) {
    for await(const chunk of stream) {
      const doc = await this.repository.getDoc(chunk)
      stream.write(doc);
    }
    
    stream.end();
  }
}
```
