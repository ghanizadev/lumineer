---
sidebar_position: 1
title: Messages
---

Messages are defined by the `@Message()` decorator imported from the core package.

An example of a message is:

```typescript
import { PropertyType, Message } from '@Lumineer/core';

@Message()
class Article {
  @PropertyType('int32')
  id: number;

  @PropertyType('string')
  body: string;

  @PropertyType('string')
  publishedAt: Date;

  @PropertyType('string')
  lastChangedAt: Date;
}
```
Like services, you can pass a different name into the decorator to override the class name:

```typescript
@Message('Article')
class PublicArticle {
// [...]
}
```
## Nested Messages
