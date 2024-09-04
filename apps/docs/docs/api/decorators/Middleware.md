```ts
function Middleware(...middleware: (object | ClassMiddlewareType | FunctionMiddleware)[]): (target: any, propertyKey?: string) => void
```

## Parameters

• ...**middleware**: (`object` \| [`ClassMiddlewareType`](/docs/api/types/ClassMiddlewareType.md) \| [`FunctionMiddleware`](/docs/api/decorators/Middleware.md))[]

## Returns

`Function`

### Parameters

• **target**: `any`

• **propertyKey?**: `string`

### Returns

`void`

## Defined in

libs/core/src/lib/decorators/middleware.decorator.ts:8
