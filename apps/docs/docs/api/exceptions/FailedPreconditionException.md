The operation was rejected because the system is not in a state required
for the operation’s execution. For example, the directory to be deleted is
non-empty, a rmdir operation is applied to a non-directory, etc. Service
implementors can use the following guidelines to decide between
`FAILED_PRECONDITION`, `ABORTED`, and `UNAVAILABLE`: (a) Use `UNAVAILABLE` if
the client can retry just the failing call. (b) Use `ABORTED` if the client
should retry at a higher level (e.g., when a client-specified test-and-set
fails, indicating the client should restart a read-modify-write sequence).
(c) Use `FAILED_PRECONDITION` if the client should not retry until the system
state has been explicitly fixed. E.g., if a “rmdir” fails because the
directory is non-empty, `FAILED_PRECONDITION` should be returned since the
client should not retry unless the files are deleted from the directory.

## Extends

- `ServerException`

## Constructors

### new FailedPreconditionException()

```ts
new FailedPreconditionException(message?: string): FailedPreconditionException
```

#### Parameters

• **message?**: `string`

#### Returns

[`FailedPreconditionException`](/docs/api/exceptions/FailedPreconditionException.md)

#### Overrides

`ServerException.constructor`

#### Defined in

libs/core/src/lib/exceptions/failed-precondition.exception.ts:21

## Properties

### cause?

```ts
optional cause: unknown;
```

#### Inherited from

`ServerException.cause`

#### Defined in

node\_modules/typescript/lib/lib.es2022.error.d.ts:24

***

### code

```ts
readonly code: number;
```

#### Inherited from

`ServerException.code`

#### Defined in

libs/core/src/lib/exceptions/base.exception.ts:2

***

### message

```ts
readonly message: string;
```

#### Inherited from

`ServerException.message`

#### Defined in

libs/core/src/lib/exceptions/base.exception.ts:2

***

### name

```ts
name: string;
```

#### Inherited from

`ServerException.name`

#### Defined in

node\_modules/typescript/lib/lib.es5.d.ts:1076

***

### stack?

```ts
optional stack: string;
```

#### Inherited from

`ServerException.stack`

#### Defined in

node\_modules/typescript/lib/lib.es5.d.ts:1078

***

### prepareStackTrace()?

```ts
static optional prepareStackTrace: (err: Error, stackTraces: CallSite[]) => any;
```

Optional override for formatting stack traces

#### Parameters

• **err**: `Error`

• **stackTraces**: `CallSite`[]

#### Returns

`any`

#### See

https://v8.dev/docs/stack-trace-api#customizing-stack-traces

#### Inherited from

`ServerException.prepareStackTrace`

#### Defined in

node\_modules/@types/node/globals.d.ts:27

***

### stackTraceLimit

```ts
static stackTraceLimit: number;
```

#### Inherited from

`ServerException.stackTraceLimit`

#### Defined in

node\_modules/@types/node/globals.d.ts:29

## Methods

### toException()

```ts
toException(): object
```

#### Returns

`object`

##### code

```ts
code: number;
```

##### details

```ts
details: string;
```

#### Inherited from

`ServerException.toException`

#### Defined in

libs/core/src/lib/exceptions/base.exception.ts:6

***

### captureStackTrace()

```ts
static captureStackTrace(targetObject: object, constructorOpt?: Function): void
```

Create .stack property on a target object

#### Parameters

• **targetObject**: `object`

• **constructorOpt?**: `Function`

#### Returns

`void`

#### Inherited from

`ServerException.captureStackTrace`

#### Defined in

node\_modules/@types/node/globals.d.ts:20
