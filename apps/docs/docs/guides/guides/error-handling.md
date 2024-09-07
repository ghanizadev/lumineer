---
sidebar_position: 7
title: Error handling
---

Lumineer covers most of the common gRPC errors. To make use of the built-in error handler, you can just throw any of the pre-made errors:

- [AbortedException](/docs/api/exceptions/AbortedException.md)
- [AlreadyExistsException](/docs/api/exceptions/AlreadyExistsException.md)
- [DataLossException](/docs/api/exceptions/DataLossException.md)
- [DeadlineExceededException](/docs/api/exceptions/DeadlineExceededException.md)
- [FailedPreconditionException](/docs/api/exceptions/FailedPreconditionException.md)
- [InternalException](/docs/api/exceptions/InternalException.md)
- [InvalidArgumentException](/docs/api/exceptions/InvalidArgumentException.md)
- [NotFoundException](/docs/api/exceptions/NotFoundException.md)
- [OutOfRangeException](/docs/api/exceptions/OutOfRangeException.md)
- [PermissionDeniedException](/docs/api/exceptions/PermissionDeniedException.md)
- [ResourceExhaustedException](/docs/api/exceptions/ResourceExhaustedException.md)
- [UnauthenticatedException](/docs/api/exceptions/UnauthenticatedException.md)
- [UnimplementedException](/docs/api/exceptions/UnimplementedException.md)
- [UnknownException](/docs/api/exceptions/UnknownException.md)

Check the recommended usage [here](https://grpc.io/docs/guides/error/).

#### Example

```typescript
import { Service, UnaryCall, Payload, InvalidArgumentException } from "@lumineer/core";

@Service()
class MyService {
  @UnaryCall({ argument: MyArgument })
  private MyRPC(@Payload() payload: MyArgument) {
    if (!payload.name)
      throw new InvalidArgumentException('Missing the "name" property');
    
    // [...]
  }
}

```
