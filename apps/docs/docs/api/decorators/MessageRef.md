```ts
function MessageRef(ref: ClassConstructor, options: PropertyRefOptions): (target: any, propertyKey: string) => void
```

## Parameters

• **ref**: [`ClassConstructor`](/docs/api/type-aliases/ClassConstructor.md)

• **options**: [`PropertyRefOptions`](/docs/api/types/PropertyRefOptions.md) = `{}`

## Returns

`Function`

### Parameters

• **target**: `any`

• **propertyKey**: `string`

### Returns

`void`

## Defined in

libs/core/src/lib/decorators/property.decorator.ts:171
