## Constructors

### new Lumineer()

```ts
new Lumineer(options: ServerOptions): Lumineer
```

#### Parameters

• **options**: [`ServerOptions`](/docs/api/other/ServerOptions.md)

#### Returns

[`Lumineer`](/docs/api/classes/Lumineer.md)

#### Defined in

libs/core/src/lib/server.ts:72

## Accessors

### isListening

```ts
get isListening(): Promise<boolean>
```

#### Returns

`Promise`\<`boolean`\>

#### Defined in

libs/core/src/lib/server.ts:191

***

### listenPort

```ts
get listenPort(): number
```

#### Returns

`number`

#### Defined in

libs/core/src/lib/server.ts:202

## Methods

### close()

```ts
close(): Promise<void>
```

#### Returns

`Promise`\<`void`\>

#### Defined in

libs/core/src/lib/server.ts:167

***

### registerPlugin()

```ts
registerPlugin(plugin: GrpcPlugin | () => GrpcPlugin): void
```

#### Parameters

• **plugin**: [`GrpcPlugin`](/docs/api/classes/GrpcPlugin.md) \| () => [`GrpcPlugin`](/docs/api/classes/GrpcPlugin.md)

#### Returns

`void`

#### Defined in

libs/core/src/lib/server.ts:178

***

### run()

```ts
run(port: string | number): Promise<void>
```

#### Parameters

• **port**: `string` \| `number`

#### Returns

`Promise`\<`void`\>

#### Defined in

libs/core/src/lib/server.ts:143

***

### use()

```ts
use(middleware: ClassMiddlewareType | FunctionMiddleware): void
```

#### Parameters

• **middleware**: [`ClassMiddlewareType`](/docs/api/types/ClassMiddlewareType.md) \| [`FunctionMiddleware`](/docs/api/decorators/Middleware.md)

#### Returns

`void`

#### Defined in

libs/core/src/lib/server.ts:174
