# Nuxt Cart
[![npm version](https://img.shields.io/npm/v/nuxt-cart/latest.svg)](https://www.npmjs.com/package/nuxt-cart)
[![npm downloads](https://img.shields.io/npm/dm/nuxt-cart.svg)](https://www.npmjs.com/package/nuxt-cart)
[![License](https://img.shields.io/npm/l/nuxt-cart.svg)](https://github.com/rrd108/nuxt-cart/blob/main/LICENSE)
[![Nuxt 4](https://img.shields.io/badge/Nuxt-4-00DC82.svg?logo=nuxt.js&logoColor=white)](https://nuxt.com)

A generic, reusable shopping cart module for Nuxt 4 applications. Zero-config localStorage cart out of the box, opt-in server API routes, coupon support, and a hook-based payment gateway system.

## Features

- 🛒 **Cart Management**
  - Add, remove, and update items with quantity support
  - Items grouped by `productId` with automatic quantity merging
  - Configurable max quantity per item

- 💾 **Persistence**
  - Automatic localStorage persistence with hydration
  - SSR-safe — no localStorage access on the server
  - Type-guard validation on load to prevent corrupt data
  - Auto-save on change with `beforeunload` fallback

- 📐 **Computed Values**
  - `totalAmount` — sum of `price × quantity`
  - `discountedTotal` — total after coupon discount
  - `itemCount` — sum of all quantities
  - `isEmpty` — quick empty check

- 🎫 **Coupon Support**
  - Built-in `applyCoupon` / `removeCoupon` API
  - `discountedTotal` computed for fixed and percentage discounts
  - Hook-based validation via `onValidateCoupon`
  - Persisted with cart state

- 🧩 **Built on Pinia**
  - Pinia setup store under the hood
  - Devtools support out of the box
  - Shared state across components

- 🎨 **Nuxt UI Components**
  - `NCartDrawer` — slide-out cart drawer with `USlideover`
  - `NCartItem` — line item with image, price, quantity control
  - `NCartSummary` — subtotal, discount, grand total, checkout CTA
  - `NCartQuantity` — `+` / `-` quantity selector

- 🔌 **Pluggable Architecture** (coming in Phase 4-5)
  - Hook-based payment gateway integration
  - Server API routes with database support

## Installation

```bash
npm install nuxt-cart
```

The module requires `@pinia/nuxt` in your project:

```bash
npm install @pinia/nuxt
```

Add the module to your `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  modules: ['nuxt-cart'],

  nuxtCart: {
    persist: true,
    storageKey: 'my-cart',
    currency: 'USD',
    maxQuantity: 99,
  },
})
```

> **Note:** `@pinia/nuxt` is declared as a module dependency and is auto-registered by Nuxt. You still need to install it (`npm install @pinia/nuxt`), but you do not need to list it manually in `modules` unless you want to pass Pinia-specific options.

For UI components, also add `@nuxt/ui` to modules:

```typescript
export default defineNuxtConfig({
  modules: ['nuxt-cart', '@nuxt/ui'],
})
```

## Zero-Config Quick Start

The module works with no configuration at all:

```typescript
export default defineNuxtConfig({
  modules: ['nuxt-cart'],
})
```

Default settings:
- localStorage persistence enabled
- Storage key: `nuxt-cart`
- Max quantity per item: 99
- Currency: `USD`
- Coupons disabled
- API routes disabled

## Usage

### Basic (add to cart, display)

```vue
<script setup lang="ts">
const cart = useCart()

function buy(product: { id: string; name: string; price: number }) {
  cart.addItem({
    productId: product.id,
    name: product.name,
    price: product.price,
  })
}
</script>

<template>
  <button @click="buy(product)">Add to Cart</button>

  <p v-if="!cart.isEmpty.value">
    {{ cart.itemCount.value }} items — {{ cart.totalAmount.value }}€
  </p>
</template>
```

### With components

Requires `@nuxt/ui` v4:

```vue
<script setup lang="ts">
const cart = useCart()
const isCartOpen = ref(false)
</script>

<template>
  <UButton @click="isCartOpen = true">
    Cart ({{ cart.itemCount.value }})
  </UButton>

  <NCartDrawer
    :open="isCartOpen"
    @close="isCartOpen = false"
    @checkout="handleCheckout"
  />
</template>
```

### With coupons

```typescript
const cart = useCart()

// Register a validation hook
cart.onValidateCoupon(async (code) => {
  const { data } = await useFetch('/api/coupon/validate', { query: { code } })
  return data.value // { code, discount, type } or null
})

// Apply a coupon
await cart.applyCoupon('SUMMER20')
console.log(cart.discountedTotal.value) // total after discount

// Remove coupon
cart.removeCoupon()
```

### With quantity

```typescript
const cart = useCart()

// Add with specific quantity (default: 1)
cart.addItem({ productId: 'p1', name: 'Product', price: 100, quantity: 3 })

// Updating quantity
cart.updateQuantity('p1', 5)
```

### Removing items

```typescript
cart.removeItem('p1')   // removes entire product line
cart.updateQuantity('p1', 0)  // also removes
```

### Checking cart state

```typescript
const cart = useCart()

cart.items              // CartItem[]
cart.coupon             // Coupon | null
cart.totalAmount        // sum of price * quantity
cart.discountedTotal    // total after coupon discount
cart.itemCount          // sum of all quantities
cart.isEmpty            // boolean
cart.isHydrated         // true after localStorage restore
```

## API

### `useCart()` composable

| Return | Type | Description |
|--------|------|-------------|
| `items` | `Ref<CartItem[]>` | Array of cart items |
| `coupon` | `Ref<Coupon \| null>` | Currently applied coupon |
| `totalAmount` | `ComputedRef<number>` | Sum of `price × quantity` (before discount) |
| `discountedTotal` | `ComputedRef<number>` | Total after coupon discount |
| `itemCount` | `ComputedRef<number>` | Total number of items (sum of quantities) |
| `isEmpty` | `ComputedRef<boolean>` | Whether the cart has any items |
| `isHydrated` | `Ref<boolean>` | `true` after localStorage data is loaded |
| `addItem(input)` | `() => void` | Add item (merges by `productId`, increments quantity) |
| `removeItem(productId)` | `(id: string) => void` | Remove all of a product line |
| `updateQuantity(productId, qty)` | `(id: string, qty: number) => void` | Set exact quantity (removes if 0) |
| `clear()` | `() => void` | Empty the cart and remove coupon |
| `applyCoupon(code)` | `(code: string) => Promise<void>` | Apply coupon via registered hook |
| `removeCoupon()` | `() => void` | Remove the active coupon |
| `onValidateCoupon(hook)` | `(hook: ValidateCouponHook) => void` | Register coupon validation handler |
| `persist()` | `() => void` | Save to localStorage |
| `load()` | `() => void` | Restore from localStorage |

### `addItem` input

```typescript
interface AddItemInput {
  productId: string
  name: string
  price: number
  quantity?: number   // defaults to 1
  image?: string
  metadata?: Record<string, unknown>
}
```

If an item with the same `productId` already exists, its quantity is incremented (clamped to `maxQuantity`).

## Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `persist` | `boolean` | `true` | Enable localStorage persistence |
| `storageKey` | `string` | `'nuxt-cart'` | localStorage key |
| `currency` | `string` | `'USD'` | Currency format |
| `maxQuantity` | `number` | `99` | Maximum quantity per item |
| `coupons` | `boolean` | `false` | Enable coupon support |
| `apiRoutes` | `boolean` | `false` | Enable server API routes (Phase 4) |

## Types

Import types from the module:

```typescript
import type { ModuleOptions, CartItem, CartState, Coupon, CheckoutHook, ValidateCouponHook } from 'nuxt-cart'
```

## Persistence Behavior

When `persist: true` (default), the client-only plugin automatically:
1. On client mount — loads cart from `localStorage` and validates item/coupon shapes
2. On every change — deep-watches `items` + `coupon` and auto-saves
3. On `beforeunload` / `pagehide` — saves as a safety net

On the server, no localStorage access occurs and `isHydrated` stays `false`.

Set `persist: false` to disable automatic hydration and auto-save. Manual `cart.persist()` / `cart.load()` remain available.

Corrupt data is silently discarded; invalid items and coupons are filtered out during hydration.

## Agent Skill

Install the **nuxt-cart** Agent Skill so your AI coding agent (Cursor, Claude Code, etc.) has procedural knowledge for this module. One-time install:

```bash
npx skills add rrd108/nuxt-cart
```

## Module Structure

```
nuxt-cart/
├── src/
│   ├── module.ts                  # Module entry point
│   ├── types.ts                   # TypeScript types
│   ├── default-options.ts         # Default configuration
│   └── runtime/
│       ├── plugin.ts              # Hydration + auto-persist
│       ├── composables/
│       │   └── useCart.ts         # Pinia store + composable
│       └── components/            # Registered when @nuxt/ui is in modules
│           ├── NCartDrawer.vue
│           ├── NCartItem.vue
│           ├── NCartSummary.vue
│           └── NCartQuantity.vue
├── playground/                    # Development app
│   ├── nuxt.config.ts
│   └── app.vue
├── test/
│   └── composables/
│       └── useCart.spec.ts        # 49 unit tests
├── docs/                          # VitePress documentation
├── package.json
├── build.config.ts
├── tsconfig.json
└── vitest.config.ts
```

## Development

```bash
# Install dependencies
pnpm install

# Prepare stubs and playground types
pnpm dev:prepare

# Run the playground dev server
pnpm dev

# Run tests
pnpm test

# Watch mode
pnpm test:watch

# Build the module
pnpm prepack

# Documentation
pnpm docs:dev
```

## Implementation Status

| Phase | Feature | Status |
|-------|---------|--------|
| **1 (MVP)** | `useCart()` + Pinia store + localStorage + types + plugin | ✅ Done |
| **2 (Coupons)** | `applyCoupon`, `removeCoupon`, `discountedTotal`, validation hooks | ✅ Done |
| **3 (Components)** | `NCartDrawer`, `NCartItem`, `NCartSummary`, `NCartQuantity` | ✅ Done |
| **4 (Server)** | REST API + DB + token middleware + checkout | 🔜 Next |
| **5 (Polish)** | `onCheckout`/`checkout` hooks, CI, publish | 🔜 Planned |

## License

MIT
