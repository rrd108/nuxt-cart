# Nuxt Cart
[![npm version](https://img.shields.io/npm/v/nuxt-cart/latest.svg)](https://www.npmjs.com/package/nuxt-cart)
[![npm downloads](https://img.shields.io/npm/dm/nuxt-cart.svg)](https://www.npmjs.com/package/nuxt-cart)
[![License](https://img.shields.io/npm/l/nuxt-cart.svg)](https://github.com/rrd108/nuxt-cart/blob/main/LICENSE)
[![ci](https://github.com/rrd108/nuxt-cart/actions/workflows/ci.yml/badge.svg)](https://github.com/rrd108/nuxt-cart/actions/workflows/ci.yml)
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
  - `itemCount` — sum of all quantities
  - `isEmpty` — quick empty check

- 🧩 **Built on Pinia**
  - Pinia setup store under the hood
  - Devtools support out of the box
  - Shared state across components

- 🔌 **Pluggable Architecture**
  - Coupon system with validation hooks (coming in Phase 2)
  - Hook-based payment gateway integration (coming in Phase 4)
  - Server API routes with database support (coming in Phase 4)

- 🎨 **Nuxt UI Components** (coming in Phase 3)
  - `NCartDrawer`, `NCartItem`, `NCartSummary`, `NCartQuantity`

## Installation

```bash
npm install nuxt-cart
```

The module requires `@pinia/nuxt` in your project:

```bash
npm install @pinia/nuxt
```

Add both to your `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  modules: ['@pinia/nuxt', 'nuxt-cart'],

  nuxtCart: {
    persist: true,
    storageKey: 'my-cart',
    currency: 'USD',
    maxQuantity: 99,
  },
})
```

> **Note:** `@pinia/nuxt` must be listed before `nuxt-cart` in the modules array.

## Zero-Config Quick Start

The module works with no configuration at all:

```typescript
export default defineNuxtConfig({
  modules: ['@pinia/nuxt', 'nuxt-cart'],
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

cart.items           // CartItem[]
cart.totalAmount     // sum of price * quantity
cart.itemCount       // sum of all quantities
cart.isEmpty         // boolean
cart.isHydrated      // true after localStorage restore
```

## API

### `useCart()` composable

| Return | Type | Description |
|--------|------|-------------|
| `items` | `Ref<CartItem[]>` | Array of cart items |
| `totalAmount` | `ComputedRef<number>` | Sum of `price × quantity` |
| `itemCount` | `ComputedRef<number>` | Total number of items (sum of quantities) |
| `isEmpty` | `ComputedRef<boolean>` | Whether the cart has any items |
| `isHydrated` | `Ref<boolean>` | `true` after localStorage data is loaded |
| `addItem(item)` | `(input) => void` | Add item (merges by `productId`, increments quantity) |
| `removeItem(productId)` | `(id: string) => void` | Remove all of a product line |
| `updateQuantity(productId, qty)` | `(id: string, qty: number) => void` | Set exact quantity (removes if 0) |
| `clear()` | `() => void` | Empty the cart |
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
| `currency` | `string` | `'USD'` | Currency symbol/format |
| `maxQuantity` | `number` | `99` | Maximum quantity per item |
| `apiRoutes` | `boolean` | `false` | Enable server API routes (Phase 4) |
| `coupons` | `boolean` | `false` | Enable coupon support (Phase 2) |

## Types

Import types from the module:

```typescript
import type { ModuleOptions, CartItem, CartState, Coupon } from 'nuxt-cart'
```

## Persistence Behavior

The module automatically:
1. On mount — loads cart from `localStorage` and validates item shapes
2. On every change — deep-watches `items` and auto-saves
3. On `beforeunload` / `pagehide` — saves as a safety net
4. On server — no localStorage access, `isHydrated` stays `false`

Corrupt data is silently discarded; invalid items are filtered out during hydration.

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
│       └── composables/
│           └── useCart.ts         # Pinia store + composable
├── test/
│   └── composables/
│       └── useCart.spec.ts        # Unit tests (35 tests)
├── package.json
├── build.config.ts
├── tsconfig.json
└── vitest.config.ts
```

## Development

```bash
# Install dependencies
pnpm install

# Run tests
pnpm test

# Watch mode
pnpm test:watch

# Build the module
pnpm prepack
```

## Implementation Status

| Phase | Feature | Status |
|-------|---------|--------|
| **1 (MVP)** | `useCart()` + Pinia store + localStorage + types + plugin | ✅ Done |
| **2** | Coupons (`applyCoupon`, `discountedTotal`, validation hook) | 🔜 Planned |
| **3** | Nuxt UI components (`NCartDrawer`, `NCartItem`, `NCartSummary`, `NCartQuantity`) | 🔜 Planned |
| **4** | Server API routes + DB + token middleware + checkout | 🔜 Planned |
| **5** | Tests, docs, playground, publish | 🏗️ In progress |

## License

MIT
