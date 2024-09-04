## Extends

- `ChannelCredentials`

## Constructors

### new ChannelCredentials()

```ts
protected new ChannelCredentials(callCredentials?: CallCredentials): ChannelCredentials
```

#### Parameters

• **callCredentials?**: `CallCredentials`

#### Returns

[`ChannelCredentials`](/docs/api/external-references/ChannelCredentials.md)

#### Inherited from

`gRPC.ChannelCredentials.constructor`

#### Defined in

node\_modules/@grpc/grpc-js/build/src/channel-credentials.d.ts:30

## Properties

### callCredentials

```ts
protected callCredentials: CallCredentials;
```

#### Inherited from

`gRPC.ChannelCredentials.callCredentials`

#### Defined in

node\_modules/@grpc/grpc-js/build/src/channel-credentials.d.ts:29

## Methods

### \_equals()

```ts
abstract _equals(other: ChannelCredentials): boolean
```

Check whether two channel credentials objects are equal. Two secure
credentials are equal if they were constructed with the same parameters.

#### Parameters

• **other**: `ChannelCredentials`

The other ChannelCredentials Object

#### Returns

`boolean`

#### Inherited from

`gRPC.ChannelCredentials._equals`

#### Defined in

node\_modules/@grpc/grpc-js/build/src/channel-credentials.d.ts:57

***

### \_getCallCredentials()

```ts
_getCallCredentials(): CallCredentials
```

Gets the set of per-call credentials associated with this instance.

#### Returns

`CallCredentials`

#### Inherited from

`gRPC.ChannelCredentials._getCallCredentials`

#### Defined in

node\_modules/@grpc/grpc-js/build/src/channel-credentials.d.ts:41

***

### \_getConnectionOptions()

```ts
abstract _getConnectionOptions(): ConnectionOptions
```

Gets a SecureContext object generated from input parameters if this
instance was created with createSsl, or null if this instance was created
with createInsecure.

#### Returns

`ConnectionOptions`

#### Inherited from

`gRPC.ChannelCredentials._getConnectionOptions`

#### Defined in

node\_modules/@grpc/grpc-js/build/src/channel-credentials.d.ts:47

***

### \_isSecure()

```ts
abstract _isSecure(): boolean
```

Indicates whether this credentials object creates a secure channel.

#### Returns

`boolean`

#### Inherited from

`gRPC.ChannelCredentials._isSecure`

#### Defined in

node\_modules/@grpc/grpc-js/build/src/channel-credentials.d.ts:51

***

### compose()

```ts
abstract compose(callCredentials: CallCredentials): ChannelCredentials
```

Returns a copy of this object with the included set of per-call credentials
expanded to include callCredentials.

#### Parameters

• **callCredentials**: `CallCredentials`

A CallCredentials object to associate with this
instance.

#### Returns

`ChannelCredentials`

#### Inherited from

`gRPC.ChannelCredentials.compose`

#### Defined in

node\_modules/@grpc/grpc-js/build/src/channel-credentials.d.ts:37

***

### createFromSecureContext()

```ts
static createFromSecureContext(secureContext: SecureContext, verifyOptions?: VerifyOptions): ChannelCredentials
```

Return a new ChannelCredentials instance with credentials created using
the provided secureContext. The resulting instances can be used to
construct a Channel that communicates over TLS. gRPC will not override
anything in the provided secureContext, so the environment variables
GRPC_SSL_CIPHER_SUITES and GRPC_DEFAULT_SSL_ROOTS_FILE_PATH will
not be applied.

#### Parameters

• **secureContext**: `SecureContext`

The return value of tls.createSecureContext()

• **verifyOptions?**: `VerifyOptions`

Additional options to modify certificate verification

#### Returns

`ChannelCredentials`

#### Inherited from

`gRPC.ChannelCredentials.createFromSecureContext`

#### Defined in

node\_modules/@grpc/grpc-js/build/src/channel-credentials.d.ts:78

***

### createInsecure()

```ts
static createInsecure(): ChannelCredentials
```

Return a new ChannelCredentials instance with no credentials.

#### Returns

`ChannelCredentials`

#### Inherited from

`gRPC.ChannelCredentials.createInsecure`

#### Defined in

node\_modules/@grpc/grpc-js/build/src/channel-credentials.d.ts:82

***

### createSsl()

```ts
static createSsl(
   rootCerts?: Buffer, 
   privateKey?: Buffer, 
   certChain?: Buffer, 
   verifyOptions?: VerifyOptions): ChannelCredentials
```

Return a new ChannelCredentials instance with a given set of credentials.
The resulting instance can be used to construct a Channel that communicates
over TLS.

#### Parameters

• **rootCerts?**: `Buffer`

The root certificate data.

• **privateKey?**: `Buffer`

The client certificate private key, if available.

• **certChain?**: `Buffer`

The client certificate key chain, if available.

• **verifyOptions?**: `VerifyOptions`

Additional options to modify certificate verification

#### Returns

`ChannelCredentials`

#### Inherited from

`gRPC.ChannelCredentials.createSsl`

#### Defined in

node\_modules/@grpc/grpc-js/build/src/channel-credentials.d.ts:67
