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

```ts
coupon: Ref<Coupon | null>
```

The currently applied coupon, or `null` if no coupon is active.

```ts
interface Coupon {
  code: string            // Coupon code (e.g., "SUMMER20")
  discount: number        // Discount amount (currency or percentage)
  type: 'fixed' | 'percentage'  // Discount type
}
```

Only available when `coupons: true` is set in module configuration.

### Computed Properties

```ts
totalAmount: ComputedRef<number>
```

Sum of `price × quantity` for all items (before any discount).

```ts
discountedTotal: ComputedRef<number>
```

Total after applying the active coupon. For fixed discounts: `max(0, total - discount)`. For percentage discounts: `max(0, round(total × (100 - discount) / 100))`. When no coupon is active, equals `totalAmount`.

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

Remove all items and the active coupon from the cart.

### Coupon Mutations

Requires `coupons: true` in module configuration.

```ts
async applyCoupon(code: string): Promise<void>
```

Attempt to apply a coupon by code. Requires a validation hook to be registered first via `onValidateCoupon`. The hook receives the code and returns a `Coupon` object if valid, or `null` if invalid.

```ts
removeCoupon(): void
```

Remove the currently applied coupon.

```ts
onValidateCoupon(hook: ValidateCouponHook): void
```

Register a coupon validation handler.

```ts
type ValidateCouponHook = (code: string) => Promise<Coupon | null>
```

Example:

```ts
const cart = useCart()

cart.onValidateCoupon(async (code) => {
  const { data } = await useFetch('/api/coupon/validate', { query: { code } })
  return data.value
})

await cart.applyCoupon('SUMMER20')
```

### Persistence

```ts
persist(): void
```

Manually save the current cart state (items + coupon) to localStorage. When `persist: true` (default), the client-only plugin also calls this automatically on every change.

```ts
load(): void
```

Manually restore cart state from localStorage. When `persist: true`, the client-only plugin also calls this on client mount. Filters out invalid items and coupons using type guards.

### Checkout Hooks

```ts
onCheckout(hook: CheckoutHook): void
```

Register a checkout handler. Multiple handlers can be registered; they run sequentially. The first to return a `redirectUrl` wins.

```ts
type CheckoutHook = (cart: CartState) => Promise<{ redirectUrl?: string; error?: string }>
```

```ts
async checkout(): Promise<{ redirectUrl?: string; error?: string }>
```

Execute checkout. Serializes the cart and passes it to all registered hooks.

## Type Imports

Import types from the module directly:

```ts
import type { CartItem, CartState, Coupon, ModuleOptions, CheckoutHook, ValidateCouponHook } from 'nuxt-cart'
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
    <p>Discounted: {{ cart.discountedTotal.value }}</p>
    <p>Empty: {{ cart.isEmpty.value }}</p>
    <p>Hydrated: {{ cart.isHydrated.value }}</p>
  </div>
</template>
```

## Next Steps

- [Components](./components) — Ready-to-use cart UI components
- [Persistence](./persistence) — How hydration and auto-save work
- [Examples](/examples/basic-setup) — Complete implementation patterns
- [API Reference](/api/types) — Full type documentation
