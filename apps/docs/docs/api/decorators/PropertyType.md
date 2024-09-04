## PropertyType(type, options, transform)

```ts
function PropertyType(
   type: "string", 
   options?: PropertyTypeOptions, 
   transform?: TransformFunction<string>): DecoratorFunction
```

### Parameters

• **type**: `"string"`

• **options?**: [`PropertyTypeOptions`](/docs/api/types/PropertyTypeOptions.md)

• **transform?**: [`TransformFunction`](/docs/api/types/TransformFunction.md)\<`string`\>

### Returns

[`DecoratorFunction`](/docs/api/types/DecoratorFunction.md)

### Defined in

libs/core/src/lib/decorators/property.decorator.ts:52

## PropertyType(type, options, transform)

```ts
function PropertyType(
   type: 
  | "double"
  | "float"
  | "int64"
  | "uint64"
  | "int32"
  | "fixed64"
  | "fixed32"
  | "uint32"
  | "sfixed32"
  | "sfixed64"
  | "sint32"
  | "sint64", 
   options?: PropertyTypeOptions, 
   transform?: TransformFunction<number>): DecoratorFunction
```

### Parameters

• **type**: 
  \| `"double"`
  \| `"float"`
  \| `"int64"`
  \| `"uint64"`
  \| `"int32"`
  \| `"fixed64"`
  \| `"fixed32"`
  \| `"uint32"`
  \| `"sfixed32"`
  \| `"sfixed64"`
  \| `"sint32"`
  \| `"sint64"`

• **options?**: [`PropertyTypeOptions`](/docs/api/types/PropertyTypeOptions.md)

• **transform?**: [`TransformFunction`](/docs/api/types/TransformFunction.md)\<`number`\>

### Returns

[`DecoratorFunction`](/docs/api/types/DecoratorFunction.md)

### Defined in

libs/core/src/lib/decorators/property.decorator.ts:58

## PropertyType(type, options, transform)

```ts
function PropertyType(
   type: "double" | "float" | "int64" | "int32", 
   options?: PropertyTypeOptions, 
   transform?: TransformFunction<number>): DecoratorFunction
```

### Parameters

• **type**: `"double"` \| `"float"` \| `"int64"` \| `"int32"`

• **options?**: [`PropertyTypeOptions`](/docs/api/types/PropertyTypeOptions.md)

• **transform?**: [`TransformFunction`](/docs/api/types/TransformFunction.md)\<`number`\>

### Returns

[`DecoratorFunction`](/docs/api/types/DecoratorFunction.md)

### Defined in

libs/core/src/lib/decorators/property.decorator.ts:76

## PropertyType(type, options, transform)

```ts
function PropertyType(
   type: "bool", 
   options?: PropertyTypeOptions, 
   transform?: TransformFunction<boolean>): DecoratorFunction
```

### Parameters

• **type**: `"bool"`

• **options?**: [`PropertyTypeOptions`](/docs/api/types/PropertyTypeOptions.md)

• **transform?**: [`TransformFunction`](/docs/api/types/TransformFunction.md)\<`boolean`\>

### Returns

[`DecoratorFunction`](/docs/api/types/DecoratorFunction.md)

### Defined in

libs/core/src/lib/decorators/property.decorator.ts:82

## PropertyType(type, options, transform)

```ts
function PropertyType(
   type: "bytes", 
   options?: PropertyTypeOptions, 
   transform?: TransformFunction<Buffer | Uint8Array>): DecoratorFunction
```

### Parameters

• **type**: `"bytes"`

• **options?**: [`PropertyTypeOptions`](/docs/api/types/PropertyTypeOptions.md)

• **transform?**: [`TransformFunction`](/docs/api/types/TransformFunction.md)\<`Buffer` \| `Uint8Array`\>

### Returns

[`DecoratorFunction`](/docs/api/types/DecoratorFunction.md)

### Defined in

libs/core/src/lib/decorators/property.decorator.ts:88

## PropertyType(type, options, transform)

```ts
function PropertyType(
   type: "unknown", 
   options?: PropertyTypeOptions, 
   transform?: TransformFunction<any>): DecoratorFunction
```

### Parameters

• **type**: `"unknown"`

• **options?**: [`PropertyTypeOptions`](/docs/api/types/PropertyTypeOptions.md)

• **transform?**: [`TransformFunction`](/docs/api/types/TransformFunction.md)\<`any`\>

### Returns

[`DecoratorFunction`](/docs/api/types/DecoratorFunction.md)

### Defined in

libs/core/src/lib/decorators/property.decorator.ts:94

## PropertyType(type, options, transform)

```ts
function PropertyType(
   type: "map", 
   options: PropertyTypeOptions & PropertyTypeMapOptions, 
   transform?: TransformFunction<any>): DecoratorFunction
```

### Parameters

• **type**: `"map"`

• **options**: [`PropertyTypeOptions`](/docs/api/types/PropertyTypeOptions.md) & [`PropertyTypeMapOptions`](/docs/api/types/PropertyTypeMapOptions.md)

• **transform?**: [`TransformFunction`](/docs/api/types/TransformFunction.md)\<`any`\>

### Returns

[`DecoratorFunction`](/docs/api/types/DecoratorFunction.md)

### Defined in

libs/core/src/lib/decorators/property.decorator.ts:100
