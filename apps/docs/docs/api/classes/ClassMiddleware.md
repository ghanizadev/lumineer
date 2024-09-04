## Constructors

### new ClassMiddleware()

```ts
new ClassMiddleware(): ClassMiddleware
```

#### Returns

[`ClassMiddleware`](/docs/api/classes/ClassMiddleware.md)

## Properties

### logger

```ts
protected readonly logger: Logger;
```

#### Defined in

libs/core/src/lib/types/middleware.types.ts:42

## Methods

### handle()

```ts
abstract handle(context: MiddlewareContext): void | Promise<void>
```

#### Parameters

• **context**: [`MiddlewareContext`](/docs/api/types/MiddlewareContext.md)

#### Returns

`void` \| `Promise`\<`void`\>

#### Defined in

libs/core/src/lib/types/middleware.types.ts:43
