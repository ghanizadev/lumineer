```ts
type Optional<T, K>: Pick<Partial<T>, K> & Omit<T, K>;
```

## Type Parameters

• **T**

• **K** *extends* keyof `T`

## Defined in

libs/core/src/lib/types/shared.types.ts:9
