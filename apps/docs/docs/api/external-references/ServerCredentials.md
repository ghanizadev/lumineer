## Extends

- `ServerCredentials`

## Constructors

### new ServerCredentials()

```ts
new ServerCredentials(): ServerCredentials
```

#### Returns

[`ServerCredentials`](/docs/api/external-references/ServerCredentials.md)

#### Inherited from

`gRPC.ServerCredentials.constructor`

## Methods

### \_addWatcher()

```ts
_addWatcher(watcher: SecureContextWatcher): void
```

#### Parameters

• **watcher**: `SecureContextWatcher`

#### Returns

`void`

#### Inherited from

`gRPC.ServerCredentials._addWatcher`

#### Defined in

node\_modules/@grpc/grpc-js/build/src/server-credentials.d.ts:17

***

### \_equals()

```ts
abstract _equals(other: ServerCredentials): boolean
```

#### Parameters

• **other**: `ServerCredentials`

#### Returns

`boolean`

#### Inherited from

`gRPC.ServerCredentials._equals`

#### Defined in

node\_modules/@grpc/grpc-js/build/src/server-credentials.d.ts:23

***

### \_getInterceptors()

```ts
_getInterceptors(): ServerInterceptor[]
```

#### Returns

`ServerInterceptor`[]

#### Inherited from

`gRPC.ServerCredentials._getInterceptors`

#### Defined in

node\_modules/@grpc/grpc-js/build/src/server-credentials.d.ts:22

***

### \_getSettings()

```ts
_getSettings(): SecureServerOptions
```

#### Returns

`SecureServerOptions`

#### Inherited from

`gRPC.ServerCredentials._getSettings`

#### Defined in

node\_modules/@grpc/grpc-js/build/src/server-credentials.d.ts:21

***

### \_isSecure()

```ts
abstract _isSecure(): boolean
```

#### Returns

`boolean`

#### Inherited from

`gRPC.ServerCredentials._isSecure`

#### Defined in

node\_modules/@grpc/grpc-js/build/src/server-credentials.d.ts:20

***

### \_removeWatcher()

```ts
_removeWatcher(watcher: SecureContextWatcher): void
```

#### Parameters

• **watcher**: `SecureContextWatcher`

#### Returns

`void`

#### Inherited from

`gRPC.ServerCredentials._removeWatcher`

#### Defined in

node\_modules/@grpc/grpc-js/build/src/server-credentials.d.ts:18

***

### updateSecureContextOptions()

```ts
protected updateSecureContextOptions(options: SecureServerOptions): void
```

#### Parameters

• **options**: `SecureServerOptions`

#### Returns

`void`

#### Inherited from

`gRPC.ServerCredentials.updateSecureContextOptions`

#### Defined in

node\_modules/@grpc/grpc-js/build/src/server-credentials.d.ts:19

***

### createInsecure()

```ts
static createInsecure(): ServerCredentials
```

#### Returns

`ServerCredentials`

#### Inherited from

`gRPC.ServerCredentials.createInsecure`

#### Defined in

node\_modules/@grpc/grpc-js/build/src/server-credentials.d.ts:24

***

### createSsl()

```ts
static createSsl(
   rootCerts: Buffer, 
   keyCertPairs: KeyCertPair[], 
   checkClientCertificate?: boolean): ServerCredentials
```

#### Parameters

• **rootCerts**: `Buffer`

• **keyCertPairs**: `KeyCertPair`[]

• **checkClientCertificate?**: `boolean`

#### Returns

`ServerCredentials`

#### Inherited from

`gRPC.ServerCredentials.createSsl`

#### Defined in

node\_modules/@grpc/grpc-js/build/src/server-credentials.d.ts:25
