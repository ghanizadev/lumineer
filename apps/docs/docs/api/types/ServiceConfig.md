```ts
type ServiceConfig: object;
```

## Type declaration

### instance

```ts
instance: any;
```

### middlewares?

```ts
optional middlewares: object;
```

#### Index Signature

 \[`key`: `string`\]: ([`FunctionMiddleware`](/docs/api/decorators/Middleware.md) \| [`ClassMiddlewareType`](/docs/api/types/ClassMiddlewareType.md))[]

### name

```ts
name: string;
```

### serviceClass

```ts
serviceClass: ClassConstructor;
```

## Defined in

libs/core/src/lib/types/server.types.ts:37
