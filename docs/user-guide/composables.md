# Composables

## `useCart()`

The main composable provided by the module. Import is automatic — Nuxt auto-imports it throughout your application.

```ts
const cart = useCart()
```

### State

```ts
items: Ref<CartItem[]>
```

The array of cart items. Each item has:

```ts
interface CartItem {
  productId: string   // Unique product identifier
  name: string        // Display name
  price: number       // Unit price
  quantity: number    // Quantity of this item in cart
  image?: string      // Optional image URL
  metadata?: Record<string, unknown>  // Optional custom data
}
```

### Computed Properties

```ts
totalAmount: ComputedRef<number>
```

Sum of `price × quantity` for all items.

```ts
itemCount: ComputedRef<number>
```

Total number of items (sum of all quantities). This is the count shown in cart badges — not the number of unique products.

```ts
isEmpty: ComputedRef<boolean>
```

Whether the cart has any items.

```ts
isHydrated: Ref<boolean>
```

`false` on the server and during initial client load. Becomes `true` after localStorage data is restored. Useful for avoiding hydration mismatches in SSR.

### Mutations

```ts
addItem(input: AddItemInput): void
```

Add an item to the cart. If an item with the same `productId` already exists, its quantity is incremented. Otherwise, a new item is appended.

**Input:**
```ts
interface AddItemInput {
  productId: string
  name: string
  price: number
  quantity?: number    // Default: 1
  image?: string
  metadata?: Record<string, unknown>
}
```

Quantity is clamped to the configured `maxQuantity` (default: 99).

```ts
removeItem(productId: string): void
```

Remove all of a product line from the cart.

```ts
updateQuantity(productId: string, quantity: number): void
```

Set the exact quantity for a product. If `quantity` is 0 or negative, the item is removed. Clamped to `maxQuantity`.

```ts
clear(): void
```

Remove all items from the cart.

### Persistence

```ts
persist(): void
```

Manually save the current cart state to localStorage. Called automatically by the plugin on every change.

```ts
load(): void
```

Manually restore cart state from localStorage. Called automatically by the plugin on app mount. Filters out invalid items using a type guard.

## Type Imports

Import types from the module directly:

```ts
import type { CartItem, CartState, ModuleOptions } from 'nuxt-cart'
```

## Full Example

```vue
<script setup lang="ts">
const cart = useCart()

function add() {
  cart.addItem({
    productId: 'p1',
    name: 'Widget',
    price: 29.99,
    quantity: 2,
  })
}

function update() {
  cart.updateQuantity('p1', 5)
}

function remove() {
  cart.removeItem('p1')
}
</script>

<template>
  <div>
    <p>Items: {{ cart.itemCount.value }}</p>
    <p>Total: {{ cart.totalAmount.value }}</p>
    <p>Empty: {{ cart.isEmpty.value }}</p>
    <p>Hydrated: {{ cart.isHydrated.value }}</p>
  </div>
</template>
```

## Next Steps

- [Persistence](./persistence) — How hydration and auto-save work
- [Examples](/examples/basic-setup) — Complete implementation patterns
- [API Reference](/api/types) — Full type documentation
