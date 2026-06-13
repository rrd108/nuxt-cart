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

| Decision | Choice | Reasoning | Status |
|----------|--------|-----------|--------|
| **State management** | Pinia (setup store) | Matches all existing apps, @pinia/nuxt is standard | ✅ |
| **Persistence** | localStorage (default), opt-in server DB | Zero-config useful, server routes for recovery | ✅ (localStorage) ✅ (server DB) |
| **Components** | Built on @nuxt/ui v4 | Matches CommerceJS approach, clean DX | ✅ |
| **Payments** | Hook-based (`cart.onCheckout(fn)`) | Flexible, any gateway (SimplePay, Stripe, etc.) | ⬜ (Phase 5) |
| **Coupons** | Built-in composable logic | Client-side by default, server validation via hook | ✅ |
| **Module builder** | unbuild + @nuxt/module-builder | Matches nuxt-users, nuxt-api-shield conventions | ✅ |
| **Package manager** | pnpm | Chosen over yarn | ✅ |

---

## Module Structure

```
nuxt-cart/
├── package.json                  ✅
├── build.config.ts               ✅
├── tsconfig.json                 ✅
├── eslint.config.mjs             ✅ (Phase 5)
├── renovate.json                 ✅ (Phase 5)
├── .github/
│   └── workflows/
│       └── ci.yml                ✅ (Phase 5)
├── playground/                   ✅ (Phase 5)
│   ├── nuxt.config.ts
│   ├── app.vue
│   ├── pages/
│   │   ├── index.vue
│   │   └── checkout.vue
│   └── server/
│       └── db/
│           └── migrations/
│               └── 001-create-cart.sql
├── src/                          ✅
│   ├── module.ts                 ✅
│   ├── types.ts                  ✅
│   ├── default-options.ts        ✅
│   └── runtime/
│       ├── plugin.ts             ✅
│       ├── composables/
│       │   └── useCart.ts        ✅
│       ├── components/           ✅
│       │   ├── NCartDrawer.vue   ✅
│       │   ├── NCartItem.vue     ✅
│       │   ├── NCartSummary.vue  ✅
│       │   └── NCartQuantity.vue ✅
│       ├── middleware/
│       │   └── cart.client.ts    ⬜
│       └── server/               ✅ (Phase 4)
│           ├── api/
│           │   └── cart/
│           │       ├── index.get.ts          ✅
│           │       ├── index.post.ts         ✅
│           │       ├── index.delete.ts       ✅
│           │       ├── items.post.ts         ✅
│           │       ├── items/[itemId].patch.ts ✅
│           │       ├── items/[itemId].delete.ts ✅
│           │       ├── coupon.post.ts        ✅
│           │       ├── coupon.delete.ts      ✅
│           │       └── checkout.post.ts      ✅
│           ├── composables/
│           │   └── useCartDb.ts              ✅
│           ├── middleware/
│           │   └── cart-token.ts             ✅
│           ├── plugins/
│           │   └── auto-migrate.ts           ✅
│           └── utils/
│               ├── build-time.ts             ✅
│               ├── db.ts                     ✅
│               ├── migrate.ts                ✅
│               ├── create-carts-table.ts     ✅
│               └── cart.ts                   ✅
└── test/
    ├── composables/
    │   └── useCart.spec.ts       ✅ (49 tests)
    └── server/
        └── api.spec.ts           ✅ (Phase 4)
```

---

## Package.json

```json
{
  "name": "nuxt-cart",             ✅
  "version": "0.1.0",              ✅
  "type": "module",                 ✅
  "license": "MIT",                 ✅
  "exports": { ".": { "types": "...", "import": "..." } },  ✅
  "main": "./dist/module.mjs",     ✅
  "types": "./dist/module.d.mts",  ✅
  "files": ["dist"],               ✅
  "scripts": {
    "prepack": "nuxt-module-build build",        ✅
    "dev": "nuxi dev playground",                ⬜ (needs playground)
    "dev:build": "nuxi build playground",         ⬜ (needs playground)
    "dev:prepare": "nuxt-module-build build --stub && ...", ⬜ (needs playground)
    "lint": "eslint .",                          ✅ (Phase 5)
    "lint:fix": "eslint . --fix",                ✅ (Phase 5)
    "test": "vitest run",                        ✅
    "test:watch": "vitest watch",                ✅
    "test:types": "vue-tsc --noEmit",            ✅ (Phase 5)
    "release": "changelogen --release && ...",   ✅ (Phase 5)
    "docs:dev": "vitepress dev docs",            ✅
    "docs:build": "vitepress build docs",        ✅
    "docs:preview": "vitepress preview docs"     ✅
  },
  "dependencies": {
    "@nuxt/kit": "^4.0.0",         ✅
    "defu": "^6.1.4",              ✅
    "destr": "^2.0.3"              ✅
  },
  "devDependencies": {
    "@nuxt/module-builder": "^1.0.0",  ✅
    "@nuxt/schema": "^4.0.0",          ✅
    "@types/node": "^22.14.1",         ✅
    "nuxt": "^4.0.0",                  ✅
    "pinia": "^3.0.0",                 ✅
    "typescript": "~5.8.3",            ✅
    "vitepress": "^1.6.4",             ✅
    "vitest": "^3.1.2",                ✅
    "vue": "^3.5.38",                  ✅
    "vue-tsc": "^3.0.0"               ✅ (but script not wired)
  },
  "peerDependencies": {
    "@nuxt/ui": "^4.0.0",             ✅ (optional)
    "@pinia/nuxt": "^0.x.x",          ✅
    "pinia": "^3.0.0"                 ✅
  }
}
```

---

## Module Entry (`src/module.ts`)

Current implementation (✅) — plugin, composables, components dir registered:

```typescript
import { defineNuxtModule, createResolver, addPlugin, addImportsDir, addComponentsDir } from '@nuxt/kit'
import { defu } from 'defu'
import type { ModuleOptions } from './types'
import { defaultOptions } from './default-options'

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-cart',
    configKey: 'nuxtCart',
    compatibility: { nuxt: '>=4.0.0' }
  },
  defaults: defaultOptions,
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)
    nuxt.options.runtimeConfig.public.nuxtCart = defu(nuxt.options.runtimeConfig.public.nuxtCart, options)
    addPlugin(resolver.resolve('./runtime/plugin'))
    addImportsDir(resolver.resolve('./runtime/composables'))
    addComponentsDir({ path: resolver.resolve('./runtime/components'), pathPrefix: false, prefix: 'N', global: true })
  }
})
```

Implemented (✅ Phase 4) — server API routes block:

```typescript
    // ✅ Server API routes (opt-in)
    if (options.apiRoutes) {
      const serverDir = resolver.resolve('./runtime/server')
      addServerHandler({ route: '/api/cart', method: 'get', handler: `${serverDir}/api/cart/index.get` })
      addServerHandler({ route: '/api/cart', method: 'post', handler: `${serverDir}/api/cart/index.post` })
      addServerHandler({ route: '/api/cart', method: 'delete', handler: `${serverDir}/api/cart/index.delete` })
      addServerHandler({ route: '/api/cart/items', method: 'post', handler: `${serverDir}/api/cart/items.post` })
      addServerHandler({ route: '/api/cart/items/:itemId', method: 'patch', handler: `${serverDir}/api/cart/items/[itemId].patch` })
      addServerHandler({ route: '/api/cart/items/:itemId', method: 'delete', handler: `${serverDir}/api/cart/items/[itemId].delete` })
      addServerHandler({ route: '/api/cart/coupon', method: 'post', handler: `${serverDir}/api/cart/coupon.post` })
      addServerHandler({ route: '/api/cart/coupon', method: 'delete', handler: `${serverDir}/api/cart/coupon.delete` })
      addServerHandler({ route: '/api/cart/checkout', method: 'post', handler: `${serverDir}/api/cart/checkout.post` })
      addServerHandler({ middleware: true, handler: `${serverDir}/middleware/cart-token` })
      addServerPlugin(resolver.resolve('./runtime/server/plugins/auto-migrate'))
      nuxt.options.nitro.experimental = nuxt.options.nitro.experimental || {}
      nuxt.options.nitro.experimental.database = true
    }
```

---

## Types (`src/types.ts`) ✅ All implemented

```typescript
export type DatabaseType = 'sqlite' | 'mysql' | 'postgresql'   ✅ (Phase 4)
export interface DatabaseConfig { ... }                         ✅ (Phase 4)
export interface ModuleOptions { ... connector?: ... }          ✅
export interface CartItem { ... }                               ✅
export interface Coupon { ... }                                 ✅
export interface CartState { ... }                              ✅
export interface CheckoutHook { ... }                           ✅ (defined, checkout() not wired)
export interface ValidateCouponHook { ... }                     ✅
```

---

## Composable API (`src/runtime/composables/useCart.ts`)

```typescript
export function useCart(): {
  // State
  items: Ref<CartItem[]>                     ✅
  coupon: Ref<Coupon | null>                 ✅

  // Computed
  totalAmount: ComputedRef<number>           ✅
  itemCount: ComputedRef<number>             ✅
  discountedTotal: ComputedRef<number>       ✅
  isEmpty: ComputedRef<boolean>              ✅
  isHydrated: Ref<boolean>                   ✅

  // Mutations
  addItem(...)                               ✅
  removeItem(productId)                      ✅
  updateQuantity(productId, quantity)        ✅
  clear()                                    ✅
  applyCoupon(code): Promise<void>           ✅
  removeCoupon()                             ✅

  // Persistence
  persist()                                  ✅
  load()                                     ✅

  // Server sync (when `apiRoutes: true`)
  cartToken: Ref<string | null>              ✅ (Phase 4)
  isServerSynced: Ref<boolean>               ✅ (Phase 4)

  // Checkout
  onCheckout: (hook: CheckoutHook) => void   ✅ (Phase 5)
  checkout(): Promise<...>                   ✅ (Phase 5)
}
```

### Behavior

- `addItem`: If item exists by `productId`, increment quantity. Otherwise append. Clamped to `maxQuantity`. ✅
- `removeItem`: Splice item from array entirely. ✅
- `updateQuantity`: Set exact quantity. If 0, remove item. ✅
- `applyCoupon`: If `coupons` enabled, calls optional `validateCoupon` hook. Stores coupon. ✅
- `onCheckout`: Registers a handler. ✅
- `checkout`: Serializes cart, passes to all registered hooks. Returns `{ redirectUrl, error }` from the first hook that responds. ✅
- When `apiRoutes: true`, all mutations sync to the server API (optimistic local + fire-and-forget server). On hydration, background-fetches server cart state. ✅

### Hydration ✅

The plugin handles SSR safety:
- On mount, load from `localStorage` via `destr`
- Set `isHydrated.value = true` once loaded
- `watch(items + coupon, persist, { deep: true })` auto-saves on every change
- On server, `isHydrated` stays `false`, no localStorage access

---

## Components (Nuxt UI based) ✅ All implemented

### `NCartDrawer` ✅
- Slide-out drawer (uses `USlideover`)
- Shows item list, totals, coupon input, checkout button
- Props: `open: boolean`, emit: `close`, `checkout`

### `NCartItem` ✅
- Single line item: image, name, price, quantity selector, remove button
- Uses `NCartQuantity` for the quantity control

### `NCartSummary` ✅
- Total breakdown: subtotal, discount (if coupon), grand total
- Checkout CTA button

### `NCartQuantity` ✅
- `+` / `-` buttons with number display
- `v-model` with `update:modelValue`
- Respects `max` prop

---

## Server API Routes (when `apiRoutes: true`) ✅ Phase 4

| Method | Route | Description | Token required |
|--------|-------|-------------|:---:|
| `POST` | `/api/cart` | Create new cart, return `{ token }` | No |
| `GET` | `/api/cart` | Fetch cart by token (from cookie) | Yes |
| `DELETE` | `/api/cart` | Clear all items from cart | Yes |
| `POST` | `/api/cart/items` | Add item to cart | Yes |
| `PATCH` | `/api/cart/items/:itemId` | Update quantity | Yes |
| `DELETE` | `/api/cart/items/:itemId` | Remove item | Yes |
| `POST` | `/api/cart/coupon` | Apply coupon `{ code }` | Yes |
| `DELETE` | `/api/cart/coupon` | Remove coupon | Yes |
| `POST` | `/api/cart/checkout` | Freeze cart, return `{ orderReference }` | Yes |

Cart token is stored in an httpOnly cookie by the `cart-token` middleware. ✅

### Database ✅

Uses **`db0`** (UnJS database abstraction) with three configurable connectors:

| Connector | Package | Default |
|-----------|---------|---------|
| SQLite | `better-sqlite3` | ✅ (default, `./data/cart.sqlite3`) |
| MySQL | `mysql2` | opt-in |
| PostgreSQL | `pg` | opt-in |

### Auto-migration ✅

Server plugin `auto-migrate.ts` creates tables on first run via `runMigrations()` state machine tracking applied migrations.

---

## Nuxt Config Usage

```typescript
export default defineNuxtConfig({
  modules: ['@pinia/nuxt', 'nuxt-cart', '@nuxt/ui'],

  nuxtCart: {
    persist: true,        ✅
    storageKey: 'my-cart',✅
    apiRoutes: true,      ✅ (Phase 4)
    currency: 'HUF',      ✅
    coupons: true,        ✅
    maxQuantity: 50,      ✅
    connector: {          ✅ (Phase 4, optional, default is sqlite)
      name: 'sqlite',
      options: { path: './data/cart.sqlite3' }
    }
  }
})
```

---

## Usage Examples

### Basic (add to cart, display) ✅

```vue
<template>
  <button @click="buy(product)">Add to Cart</button>
  <NCartDrawer :open="showCart" @close="showCart = false" />
</template>
```

### With coupon ✅

```typescript
const cart = useCart()
await cart.applyCoupon('SUMMER20')
console.log(cart.discountedTotal.value)
```

### With custom coupon validation ✅

```typescript
const cart = useCart()
cart.onValidateCoupon(async (code) => {
  const { data } = await useFetch('/api/coupon/validate', { query: { code } })
  return data.value
})
```

### With payment (SimplePay) ✅ (Phase 5)

```typescript
cart.onCheckout(async (cartData) => {
  // Send cartData to payment gateway
  // Return { redirectUrl } or { error }
  return { redirectUrl: 'https://gateway.com/checkout' }
})

// Trigger checkout
const result = await cart.checkout()
if (result.redirectUrl) {
  window.location.href = result.redirectUrl
}
```

---

## Implementation Phases

| Phase | Scope | Status | Key files |
|-------|-------|--------|-----------|
| **1. MVP** | `useCart()` + Pinia store + localStorage + types + plugin | ✅ Done | `module.ts`, `types.ts`, `composables/useCart.ts`, `plugin.ts` |
| **2. Coupons** | `applyCoupon`, `removeCoupon`, `discountedTotal`, `onValidateCoupon`, `isValidCoupon` | ✅ Done | `useCart.ts`, `types.ts`, `useCart.spec.ts` |
| **3. Components** | `NCartDrawer`, `NCartItem`, `NCartSummary`, `NCartQuantity` | ✅ Done | `components/` folder |
| **4. Server routes** | REST API (9 endpoints) + db0 DB + token middleware + auto-migrate + client-server sync | ✅ Done | `server/api/`, `server/composables/useCartDb.ts` |
| **5. Polish** | `onCheckout`/`checkout` hooks, playground, CI, lint, publish | ✅ Done | `test/`, `README.md`, `playground/` |

---

## Conventions

- **Module name**: `nuxt-cart` ✅
- **Config key**: `nuxtCart` ✅
- **Component prefix**: `N` (e.g., `NCartDrawer`, `NCartItem`) ✅
- **API route naming**: `{resource}.{method}.ts` (e.g., `items.post.ts`) ✅
- **Build**: unbuild with `build.config.ts`, externals for `@nuxt/kit`, `nuxt`, `vue` ✅
- **Tests**: vitest (49 unit + server API tests) ✅
- **CI**: GitHub Actions (lint → typecheck → test → build) ✅

---

## Open Questions

1. ✅ ~~Package manager: yarn or pnpm?~~ → **pnpm**
2. ✅ ~~Database~~ → **`db0`** (UnJS abstraction, same as nuxt-users)
3. ✅ ~~Auto-migrate~~ → **Built-in**: Nitro plugin runs `runMigrations()` state machine on startup
4. ✅ ~~Component styling~~ → **Rely on Nuxt UI v4 semantic classes**
