---
title: RPC
sidebar_position: 3
---

RPCs can accept an optional argument and may return a value, depending on the type of the RPC.

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

In this example, `MyArgument` is a message decorated with a `@Message()` decorator. The same applies to `MyReturn`.

## Types of RPCs

### Unary call

Unary calls are the simplest RPC type. I can receive an input and produce an output.

To produce a result, just return the value from the handler, but be careful to provide all the required fields.

It can be defined using the [`@UnaryCall()`](/docs/api/decorators/UnaryCall.md) decorator.

#### Example

```typescript
import { UnaryCall, Service } from '@lumineer/core';

@Service()
class Service {
  @UnaryCall({ argument: /* Omitted */, return: /* Omitted */ })
  private async UnaryCallHandler() {
    // [...]
  }
}
```

### Client stream

It can be defined using the [`@ClientStreamCall()`](/docs/api/decorators/ClientStreamCall.md) decorator.

Here we expect a stream coming from the client. To handle this, we can iterate over the [readable stream](https://nodejs.org/api/stream.html#readable-streams) provided by the [`@Stream()`](/docs/api/decorators/Stream.md) decorator.

#### Example

```typescript
import { ClientStreamCall, Service } from '@lumineer/core';
import type { Readable } from 'node:stream';

@Service()
class Service {
  @ClientStreamCall({ argument: /* Omitted */, return: /* Omitted */ })
  private async OtherClientStreamCallHandler(@Stream() stream: Readable) {
    for await (const chunk of stream) {
      // Do something with the chunk
    }

    // Optionally return a value, like done on the unary call example
  }
}
```

### Server Stream

Server stream can be defined by using the [`@ServerStreamCall()`](/docs/api/decorators/ServerStreamCall.md) decorator.

To handle this type we can use the [writable stream](https://nodejs.org/api/stream.html#writable-streams) provided by the [`@Stream()`](/docs/api/decorators/Stream.md) decorator.

#### Example

```typescript
import { ClientStreServerStreamCall, Service, Stream } from '@lumineer/core';
import type { Writable } from "node:stream";

@Service()
class Service {
  constructor(private readonly repository: MyRepository) { }

  @ServerStreamCall({ argument: /* Omitted */, return: /* Omitted */ })
  private async OtherServerStreamCallHandler(@Stream() stream: Writable) {
    const dos = await this.repository.getDocs();

    for (const doc of docs) {
      stream.write(doc)
    }
    
    stream.end();
  }
}
```

### Bidirectional stream

Bidirectional RPCs use the [`@BidirectionalStreamCall()`](/docs/api/decorators/BidirectionalStreamCall.md) decorator, it relies on [`Duplex`](https://nodejs.org/api/stream.html#duplex-streams) streams (it acts like a `Readable` and a `Writable` stream at the same time) to handle these calls. Use the stream parameters value, provided by [`@Stream()`](/docs/api/decorators/Stream/md). 

#### Example

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

## Parameters

### Payload

Payload is the data that may come with a call if the `argument` option was supplied to the [call decorator](/docs/documentation/guides/rpc/call).

To access the request payload, use the `@Payload()` decorator.

#### Example

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

### Metadata

Metadata work like headers in a REST API.

The metadata instance is shared across layers, so it is a good place to put relevant information to other parts of your project, like authorization and user details.

To access the call's metadata, use the `@Metadata()` decorator.

#### Example

```typescript
import { UnaryCall, Metdata, MetadataContent, Service } from '@lumineer/core';

@Service()
class MyService {
  @UnaryCall()
  private async DoFoo(@Metadata() metadata: MetadataContent) {
    const apiKey = metadata.get('authorization');
    // Process the payload
  }
}
```

### Stream

Streams are present in all call types except for unary calls (as the name suggests).

To access the stream instance, use the `@Stream()` decorator.

Each call type has a different stream type, be careful to use the correct one:

- Client streams (`@ClientStreamCall()`): uses `Readable` streams;
- Server streams (`@ServerStreamCall()`): uses `Writable` streams;
- Bidirectional streams (`@BidirectionalStreamCall()`): uses `Duplex` streams;

For more information about streams, check [Node.js Stream](https://nodejs.org/api/stream.html) API.

#### Example

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
