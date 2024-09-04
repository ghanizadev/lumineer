## Constructors

### new GrpcPlugin()

```ts
new GrpcPlugin(): GrpcPlugin
```

#### Returns

[`GrpcPlugin`](/docs/api/classes/GrpcPlugin.md)

## Methods

### onInit()

```ts
onInit(context: HookContext): Promise<void>
```

#### Parameters

• **context**: [`HookContext`](/docs/api/types/HookContext.md)

#### Returns

`Promise`\<`void`\>

#### Defined in

libs/core/src/lib/types/plugin.types.ts:33

***

### onShutdown()

```ts
onShutdown(context: HookContext): Promise<void>
```

#### Parameters

• **context**: [`HookContext`](/docs/api/types/HookContext.md)

#### Returns

`Promise`\<`void`\>

#### Defined in

libs/core/src/lib/types/plugin.types.ts:39

***

### postCall()

```ts
postCall(context: HookContext): Promise<void>
```

#### Parameters

• **context**: [`HookContext`](/docs/api/types/HookContext.md)

#### Returns

`Promise`\<`void`\>

#### Defined in

libs/core/src/lib/types/plugin.types.ts:38

***

### postConfig()

```ts
postConfig(context: HookContext): Promise<void>
```

#### Parameters

• **context**: [`HookContext`](/docs/api/types/HookContext.md)

#### Returns

`Promise`\<`void`\>

#### Defined in

libs/core/src/lib/types/plugin.types.ts:36

***

### preBind()

```ts
preBind(context: HookContext): Promise<void>
```

#### Parameters

• **context**: [`HookContext`](/docs/api/types/HookContext.md)

#### Returns

`Promise`\<`void`\>

#### Defined in

libs/core/src/lib/types/plugin.types.ts:34

***

### preCall()

```ts
preCall(context: HookContext): Promise<void>
```

#### Parameters

• **context**: [`HookContext`](/docs/api/types/HookContext.md)

#### Returns

`Promise`\<`void`\>

#### Defined in

libs/core/src/lib/types/plugin.types.ts:37

***

### preConfig()

```ts
preConfig(context: HookContext): Promise<void>
```

#### Parameters

• **context**: [`HookContext`](/docs/api/types/HookContext.md)

#### Returns

`Promise`\<`void`\>

#### Defined in

libs/core/src/lib/types/plugin.types.ts:35
