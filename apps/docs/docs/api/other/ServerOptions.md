```ts
type ServerOptions: object;
```

## Type declaration

### credentials

```ts
credentials: gRPC.ServerCredentials;
```

Server credentials to be used by the core gRPC Server

### providers?

```ts
optional providers: object[];
```

Providers to be included in this server

### services

```ts
services: ClassConstructor[];
```

Services to be included in this server

## Defined in

libs/core/src/lib/types/server.types.ts:5
