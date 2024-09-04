```ts
type PropertyTypeMapOptions: object;
```

## Type declaration

### key

```ts
key: Omit<RpcScalar, "float" | "double" | "bytes">;
```

### value

```ts
value: RpcScalar | (...args: any[]) => object;
```

## Defined in

libs/core/src/lib/decorators/property.decorator.ts:35
