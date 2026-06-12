# nuxt-cart — Module Specification

> A generic, reusable shopping cart module for Nuxt 4 applications.
> Published as `nuxt-cart` on npm.

---

## Rationale

All three of my Nuxt webshop apps (`piac`, `efoka`, `krisnavolgy`) reimplement the same cart pattern from scratch — a Pinia store with `Record<string, CartItem>`, computed totals, add/remove/clear actions, and localStorage persistence. Each iteration evolved (coupons, dates, payment integration), but zero code was shared.

No standalone, backend-agnostic Nuxt cart module exists on npm. Existing solutions are:
- Tied to specific commerce platforms (`@nuxtjs/snipcart`, `@nuxtjs/shopify`)
- Full enterprise suites requiring middleware (`@vue-storefront/nuxt`)
- Backend-dependent (`@commercejs/nuxt` requires CommerceJS adapter)
- Just starter templates without reusable modules

`nuxt-cart` fills this gap: zero-config localStorage cart out of the box, opt-in server API routes, coupon support, and a hook-based payment gateway system.

---

## Architecture Decisions

| Decision | Choice | Reasoning |
|----------|--------|-----------|
| **State management** | Pinia (setup store) | Matches all existing apps, @pinia/nuxt is standard |
| **Persistence** | localStorage (default), opt-in server DB | Zero-config useful, server routes for recovery |
| **Components** | Built on @nuxt/ui v4 | Matches CommerceJS approach, clean DX |
| **Payments** | Hook-based (`cart.onCheckout(fn)`) | Flexible, any gateway (SimplePay, Stripe, etc.) |
| **Coupons** | Built-in composable logic | Client-side by default, server validation via hook |
| **Module builder** | unbuild + @nuxt/module-builder | Matches nuxt-users, nuxt-api-shield conventions |
| **Package manager** | yarn (to match nuxt-users) | Or pnpm — TBD |

---

## Module Structure

```
nuxt-cart/
├── package.json
├── build.config.ts
├── tsconfig.json
├── eslint.config.mjs
├── renovate.json
├── .github/
│   └── workflows/
│       └── ci.yml
├── playground/
│   ├── nuxt.config.ts
│   ├── app.vue
│   ├── pages/
│   │   ├── index.vue
│   │   └── checkout.vue
│   └── server/
│       └── db/
│           └── migrations/
│               └── 001-create-cart.sql
├── src/
│   ├── module.ts
│   ├── types.ts
│   ├── default-options.ts
│   └── runtime/
│       ├── plugin.ts
│       ├── composables/
│       │   └── useCart.ts
│       ├── components/
│       │   ├── NCartDrawer.vue
│       │   ├── NCartItem.vue
│       │   ├── NCartSummary.vue
│       │   └── NCartQuantity.vue
│       ├── middleware/
│       │   └── cart.client.ts         # optional: redirect if cart empty
│       └── server/
│           ├── tsconfig.json
│           ├── api/
│           │   └── cart/
│           │       ├── index.get.ts
│           │       ├── index.post.ts
│           │       ├── items.post.ts
│           │       ├── items/[itemId].patch.ts
│           │       ├── items/[itemId].delete.ts
│           │       └── checkout.post.ts
│           ├── composables/
│           │   └── useCartDb.ts
│           ├── middleware/
│           │   └── cart-token.ts
│           ├── plugins/
│           │   └── auto-migrate.ts
│           └── utils/
│               ├── cart-validator.ts
│               └── pricing.ts
└── test/
    ├── composables/
    │   └── useCart.spec.ts
    └── server/
        └── api.test.ts
```

---

## Package.json

```json
{
  "name": "nuxt-cart",
  "version": "0.1.0",
  "type": "module",
  "license": "MIT",
  "exports": {
    ".": {
      "types": "./dist/module.d.mts",
      "import": "./dist/module.mjs"
    }
  },
  "main": "./dist/module.mjs",
  "types": "./dist/module.d.mts",
  "files": ["dist"],
  "scripts": {
    "prepack": "nuxt-module-build build",
    "dev": "nuxi dev playground",
    "dev:build": "nuxi build playground",
    "dev:prepare": "nuxt-module-build build --stub && nuxt-module-build prepare && nuxi prepare playground",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "test": "vitest run",
    "test:watch": "vitest watch",
    "test:types": "vue-tsc --noEmit",
    "release": "changelogen --release && npm publish && git push --follow-tags"
  },
  "dependencies": {
    "@nuxt/kit": "^4.0.0",
    "defu": "^6.1.4",
    "destr": "^2.0.3"
  },
  "devDependencies": {
    "@nuxt/devtools": "^3.0.0",
    "@nuxt/eslint-config": "^1.0.0",
    "@nuxt/module-builder": "^1.0.0",
    "@nuxt/schema": "^4.0.0",
    "@nuxt/test-utils": "^3.x.x",
    "@nuxt/ui": "^4.0.0",
    "@types/node": "^25.x.x",
    "changelogen": "^0.6.0",
    "eslint": "^9.x.x",
    "nuxi": "^3.x.x",
    "nuxt": "^4.0.0",
    "typescript": "~5.8.3",
    "vitest": "^4.0.0",
    "vue-tsc": "^3.0.0"
  }
}
```

---

## Module Entry (`src/module.ts`)

```typescript
import { defineNuxtModule, createResolver, addPlugin, addImportsDir, addComponentsDir, addServerHandler, addServerScanDir } from '@nuxt/kit'
import { defu } from 'defu'
import type { ModuleOptions } from './types'

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-cart',
    configKey: 'nuxtCart',
    compatibility: { nuxt: '>=4.0.0' }
  },
  defaults: {
    persist: true,
    storageKey: 'nuxt-cart',
    apiRoutes: false,
    currency: 'USD',
    coupons: false,
    maxQuantity: 99,
  },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    // Runtime config
    nuxt.options.runtimeConfig.public.nuxtCart = defu(
      nuxt.options.runtimeConfig.public.nuxtCart,
      options
    )

    // Plugin (localStorage init/hydration)
    addPlugin(resolver.resolve('./runtime/plugin'))

    // Composables
    addImportsDir(resolver.resolve('./runtime/composables'))

    // Components (optional — only if @nuxt/ui is available)
    addComponentsDir({
      path: resolver.resolve('./runtime/components'),
      pathPrefix: false,
      prefix: 'N',
      global: true
    })

    // Server API routes (opt-in)
    if (options.apiRoutes) {
      addServerHandler({ route: '/api/cart', method: 'get', handler: resolver.resolve('./runtime/server/api/cart/index.get') })
      addServerHandler({ route: '/api/cart', method: 'post', handler: resolver.resolve('./runtime/server/api/cart/index.post') })
      addServerHandler({ route: '/api/cart/items', method: 'post', handler: resolver.resolve('./runtime/server/api/cart/items.post') })
      addServerHandler({ route: '/api/cart/items/:itemId', method: 'patch', handler: resolver.resolve('./runtime/server/api/cart/items/[itemId].patch') })
      addServerHandler({ route: '/api/cart/items/:itemId', method: 'delete', handler: resolver.resolve('./runtime/server/api/cart/items/[itemId].delete') })
      addServerHandler({ route: '/api/cart/checkout', method: 'post', handler: resolver.resolve('./runtime/server/api/cart/checkout.post') })
      addServerMiddleware({ handler: resolver.resolve('./runtime/server/middleware/cart-token') })
      addServerPlugin(resolver.resolve('./runtime/server/plugins/auto-migrate'))
      addServerScanDir(resolver.resolve('./runtime/server'))
    }
  }
})
```

---

## Types (`src/types.ts`)

```typescript
export interface ModuleOptions {
  persist?: boolean
  storageKey?: string
  apiRoutes?: boolean
  currency?: string
  coupons?: boolean
  maxQuantity?: number
}

export interface CartItem {
  productId: string
  name: string
  price: number
  quantity: number
  image?: string
  metadata?: Record<string, unknown>
}

export interface Coupon {
  code: string
  discount: number
  type: 'fixed' | 'percentage'
}

export interface CartState {
  items: CartItem[]
  coupon: Coupon | null
  createdAt?: string
  updatedAt?: string
}

export interface CheckoutHook {
  (cart: CartState): Promise<{ redirectUrl?: string; error?: string }>
}

export interface ValidateCouponHook {
  (code: string): Promise<Coupon | null>
}
```

---

## Composable API (`src/runtime/composables/useCart.ts`)

```typescript
export function useCart(): {
  // State
  items: Ref<CartItem[]>
  coupon: Ref<Coupon | null>

  // Computed
  totalAmount: ComputedRef<number>
  itemCount: ComputedRef<number>
  discountedTotal: ComputedRef<number>
  isEmpty: ComputedRef<boolean>
  isHydrated: Ref<boolean>

  // Mutations
  addItem(item: Omit<CartItem, 'quantity'> & { quantity?: number }): void
  removeItem(productId: string): void
  updateQuantity(productId: string, quantity: number): void
  clear(): void
  applyCoupon(code: string): Promise<void>
  removeCoupon(): void

  // Persistence
  persist(): void
  load(): void

  // Checkout
  onCheckout: (hook: CheckoutHook) => void
  checkout(): Promise<{ redirectUrl?: string; error?: string }>
}
```

### Behavior

- `addItem`: If item exists by `productId`, increment quantity. Otherwise append. Clamped to `maxQuantity`.
- `removeItem`: Splice item from array entirely.
- `updateQuantity`: Set exact quantity. If 0, remove item.
- `applyCoupon`: If `coupons` enabled, calls optional `validateCoupon` hook. Stores coupon.
- `onCheckout`: Registers a handler. Multiple handlers chain (run sequentially).
- `checkout`: Serializes cart, passes to all registered hooks. First hook that returns `redirectUrl` wins.

### Hydration

The plugin (`src/runtime/plugin.ts`) handles SSR safety:
- On mount (`import.meta.client`), load from `localStorage` via `destr`
- Set `isHydrated.value = true` once loaded
- `watch(items, persist, { deep: true })` auto-saves on every change
- On server, `isHydrated` stays `false`, no localStorage access

---

## Components (Nuxt UI based)

### `NCartDrawer`
- Slide-out drawer (uses `UDrawer` or `USlideover`)
- Shows item list, totals, coupon input, checkout button
- Props: `open: boolean`, emit: `close`

### `NCartItem`  
- Single line item: image, name, price, quantity selector, remove button
- Uses `NCartQuantity` for the quantity control

### `NCartSummary`
- Total breakdown: subtotal, discount (if coupon), grand total
- Checkout CTA button

### `NCartQuantity`
- `+` / `-` buttons with number display
- Emits `update:quantity`
- Respects `maxQuantity`

---

## Server API Routes (when `apiRoutes: true`)

All routes use the `nuxt-cart` DB table (SQLite/MySQL/PostgreSQL via `@nuxt/database` or direct Drizzle):

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/api/cart?token=` | Fetch cart by token |
| `POST` | `/api/cart` | Create new cart, return `{ token }` |
| `POST` | `/api/cart/items` | Add item to cart |
| `PATCH` | `/api/cart/items/:itemId` | Update quantity |
| `DELETE` | `/api/cart/items/:itemId` | Remove item |
| `POST` | `/api/cart/checkout` | Freeze cart, return order reference |

Cart token is stored in a cookie (httpOnly) by the `cart-token` middleware.

### Auto-migration

Server plugin `auto-migrate.ts` creates the table on first run:

```sql
CREATE TABLE IF NOT EXISTS nuxt_cart_carts (
  id TEXT PRIMARY KEY,
  token TEXT UNIQUE NOT NULL,
  items TEXT NOT NULL,        -- JSON
  coupon TEXT,                -- JSON or NULL
  currency TEXT NOT NULL DEFAULT 'USD',
  total INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',  -- active | checked-out | abandoned
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

---

## Nuxt Config Usage

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['nuxt-cart', '@nuxt/ui'],

  nuxtCart: {
    persist: true,
    storageKey: 'my-cart',
    apiRoutes: true,
    currency: 'HUF',
    coupons: true,
    maxQuantity: 50,
  }
})
```

---

## Usage Examples

### Basic (add to cart, display)

```vue
<script setup lang="ts">
const cart = useCart()

function buy(product: { id: string; name: string; price: number }) {
  cart.addItem({ productId: product.id, name: product.name, price: product.price })
}
</script>

<template>
  <button @click="buy(product)">Add to Cart</button>
  <NCartDrawer :open="showCart" @close="showCart = false" />
  <NCartSummary />
</template>
```

### With coupon

```typescript
const cart = useCart()
await cart.applyCoupon('SUMMER20')
console.log(cart.discountedTotal.value)
```

### With payment (SimplePay)

```typescript
const cart = useCart()
cart.onCheckout(async (cartData) => {
  const { data } = await useFetch('/api/simplepay/init', {
    method: 'POST',
    body: { items: cartData.items, total: cartData.total }
  })
  return { redirectUrl: data.value.paymentUrl }
})

async function handleCheckout() {
  const result = await cart.checkout()
  if (result.redirectUrl) navigateTo(result.redirectUrl, { external: true })
}
```

### With custom coupon validation

```typescript
const cart = useCart()
cart.onValidateCoupon(async (code) => {
  const { data } = await useFetch('/api/coupon/validate', { query: { code } })
  return data.value // { code, discount, type }
})
```

---

## Implementation Phases

| Phase | Scope | Est. time | Key files |
|-------|-------|-----------|-----------|
| **1. MVP** | `useCart()` + Pinia store + localStorage + types + plugin | **2 days** | `module.ts`, `types.ts`, `composables/useCart.ts`, `plugin.ts` |
| **2. Coupons** | `applyCoupon`, `removeCoupon`, `discountedTotal` | **+1 day** | Update `useCart.ts`, `types.ts` |
| **3. Components** | `NCartDrawer`, `NCartItem`, `NCartSummary`, `NCartQuantity` | **+1-2 days** | `components/` folder |
| **4. Server routes** | REST API + DB + token middleware + auto-migrate + checkout | **+2-3 days** | `server/api/`, `server/composables/useCartDb.ts` |
| **5. Polish** | Tests, docs, README, playground, publish | **+1-2 days** | `test/`, `README.md` |

**Total: ~7-10 days for full v1.**

---

## Conventions (matching nuxt-users / nuxt-api-shield)

- **Module name**: `nuxt-cart`
- **Config key**: `nuxtCart`
- **Component prefix**: `N` (e.g., `NCartDrawer`, `NCartItem`)
- **API route naming**: `{resource}.{method}.ts` (e.g., `items.post.ts`)
- **Build**: unbuild with `build.config.ts`, externals for `@nuxt/kit`, `nuxt`, `vue`
- **Tests**: vitest + `@nuxt/test-utils`
- **Type checking**: `vue-tsc --noEmit`
- **CI**: GitHub Actions (lint → typecheck → test)

---

## Open Questions

1. Package manager: yarn (like nuxt-users) or pnpm?
2. Database: use `@nuxt/database` (if stable) or raw Drizzle/Kysely?
3. Should `auto-migrate` be a separate module dependency (like `nuxt-db-migrations`) or built-in?
4. Component styling: provide base Tailwind classes, or fully unstyled and rely on Nuxt UI?
