```ts
type MiddlewareHandler: (context: MiddlewareContext) => Promise<void> | void;
```

## Parameters

• **context**: [`MiddlewareContext`](/docs/api/types/MiddlewareContext.md)

## Returns

`Promise`\<`void`\> \| `void`

## Defined in

libs/core/src/lib/types/middleware.types.ts:22
