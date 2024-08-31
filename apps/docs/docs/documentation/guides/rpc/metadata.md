---
sidebar_position: 4
title: Metadata
---

Metadata work like headers in a REST API.

The metadata instance is shared across layers, so it is a good place to put relevant information to other parts of your project, like authorization and user details.

To access the call's metadata, use the `@Metadata()` decorator.

## Example

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

