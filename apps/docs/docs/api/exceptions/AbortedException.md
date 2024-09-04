The operation was aborted, typically due to a concurrency issue such as a
sequencer check failure or transaction abort. See the guidelines above for
deciding between `FAILED_PRECONDITION`, `ABORTED`, and `UNAVAILABLE`.

## Extends

- `ServerException`

## Constructors

### new AbortedException()

```ts
new AbortedException(message?: string): AbortedException
```

#### Parameters

• **message?**: `string`

#### Returns

[`AbortedException`](/docs/api/exceptions/AbortedException.md)

#### Overrides

`ServerException.constructor`

#### Defined in

libs/core/src/lib/exceptions/aborted.exception.ts:12

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
