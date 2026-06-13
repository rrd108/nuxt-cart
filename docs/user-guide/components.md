# Components

Nuxt Cart provides four ready-to-use Vue components built on `@nuxt/ui` v4. They are auto-imported with the `N` prefix when `@nuxt/ui` is listed in your Nuxt modules.

> **Requires:** `@nuxt/ui` v4 installed **and** added to the `modules` array in `nuxt.config.ts`. Without it, only the headless `useCart()` composable is available.

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['nuxt-cart', '@nuxt/ui'],
})
```

## NCartQuantity

Quantity selector with `+` / `-` buttons and a numeric display.

### Usage

```vue
<NCartQuantity
  v-model="quantity"
  :max="10"
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `number` | — | Current quantity value (required) |
| `max` | `number` | `99` | Maximum allowed quantity |

### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `value: number` | Emitted when the user clicks `+` / `-` |

The `+` button is disabled when `modelValue >= max`. The `-` button is disabled when `modelValue <= 1`.

## NCartItem

A single cart line item showing image, name, unit price, quantity selector, line total, and a remove button.

### Usage

```vue
<NCartItem
  :item="item"
  @update:quantity="q => cart.updateQuantity(item.productId, q)"
  @remove="cart.removeItem(item.productId)"
/>
```

### Props

| Prop | Type | Description |
|------|------|-------------|
| `item` | `CartItem` | The cart item to display |

### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:quantity` | `value: number` | User changed the quantity |
| `remove` | — | User clicked the remove button |

The component uses `useRuntimeConfig` to read `currency` and `maxQuantity` for formatting and clamping.

## NCartSummary

Displays the subtotal, active discount (if a coupon is applied), grand total, and a checkout button.

### Usage

```vue
<NCartSummary @checkout="handleCheckout" />
```

### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `checkout` | — | User clicked the checkout button |

The checkout button is disabled when the cart is empty.

## NCartDrawer

A slide-out drawer (using `USlideover`) showing cart items, an optional coupon input, and the summary with checkout button.

### Usage

```vue
<NCartDrawer
  :open="isCartOpen"
  @close="isCartOpen = false"
  @checkout="handleCheckout"
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | — | Whether the drawer is visible (required) |

### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `close` | — | User closed the drawer |
| `checkout` | — | User clicked the checkout button |

### Features

- **Empty state** — Shows a shopping cart icon and message when the cart has no items
- **Coupon input** — When `coupons: true` in module config, shows a coupon code input with an Apply button
- **Auto-scroll** — Item list scrolls independently; summary stays fixed at the bottom

## Full Example

```vue
<script setup lang="ts">
const cart = useCart()
const isCartOpen = ref(false)

function addToCart(product: { id: string; name: string; price: number }) {
  cart.addItem({
    productId: product.id,
    name: product.name,
    price: product.price,
  })
  isCartOpen.value = true
}

async function handleCheckout() {
  // Redirect to checkout page or call cart.checkout()
}
</script>

<template>
  <div>
    <UButton @click="isCartOpen = true">
      Cart ({{ cart.itemCount.value }})
    </UButton>

    <NCartDrawer
      :open="isCartOpen"
      @close="isCartOpen = false"
      @checkout="handleCheckout"
    />
  </div>
</template>
```

## Styling

Components use `@nuxt/ui` v4 semantic classes (`text-default`, `text-muted`, `bg-muted`, `border-border`) and respect your `@nuxt/ui` theme configuration. Override styles via the `class` prop or global `@nuxt/ui` theming.

## Next Steps

- [Composables](./composables) — Full `useCart()` API reference
- [Examples](/examples/basic-setup) — Complete implementation patterns
- [API Reference](/api/) — Type documentation
