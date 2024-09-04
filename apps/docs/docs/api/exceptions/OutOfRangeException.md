The operation was attempted past the valid range. E.g., seeking or reading
past end-of-file. Unlike `INVALID_ARGUMENT`, this error indicates a problem
that may be fixed if the system state changes. For example, a 32-bit file
system will generate `INVALID_ARGUMENT` if asked to read at an offset that
is not in the range [0,2^32-1], but it will generate `OUT_OF_RANGE` if asked
to read from an offset past the current file size. There is a fair bit of
overlap between `FAILED_PRECONDITION` and `OUT_OF_RANGE`. We recommend using
`OUT_OF_RANGE` (the more specific error) when it applies so that callers who
are iterating through a space can easily look for an `OUT_OF_RANGE` error to
detect when they are done.

## Extends

- `ServerException`

## Constructors

### new OutOfRangeException()

```ts
new OutOfRangeException(message?: string): OutOfRangeException
```

#### Parameters

• **message?**: `string`

#### Returns

[`OutOfRangeException`](/docs/api/exceptions/OutOfRangeException.md)

#### Overrides

`ServerException.constructor`

#### Defined in

libs/core/src/lib/exceptions/out-of-range.exception.ts:19

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
