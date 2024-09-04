```ts
type RpcMessageType: object;
```

## Type declaration

### blockScoped?

```ts
optional blockScoped: boolean;
```

### messages?

```ts
optional messages: RpcMessageType[];
```

### oneofs?

```ts
optional oneofs: Record<string, string[]>;
```

### properties?

```ts
optional properties: Record<string, RpcProperty>;
```

### refs?

```ts
optional refs: Record<string, RpcMessageType>;
```

### type?

```ts
optional type: "message" | "enum";
```

### typeName?

```ts
optional typeName: string;
```

## Defined in

libs/core/src/lib/types/message.types.ts:28
