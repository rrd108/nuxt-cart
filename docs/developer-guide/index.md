# Developer Guide

This guide covers contributing to the development of the `nuxt-cart` module itself.

## Module Structure

```
nuxt-cart/
├── src/
│   ├── module.ts                  # Module entry — plugin, composables, moduleDependencies
│   ├── types.ts                   # Public TypeScript interfaces
│   ├── default-options.ts         # Default configuration values
│   └── runtime/
│       ├── plugin.ts              # Client-only plugin — hydration, auto-save
│       ├── composables/
│       │   └── useCart.ts         # Pinia store + useCart() wrapper (items + coupons + server sync)
│       ├── components/            # Registered only when @nuxt/ui is present
│       │   ├── NCartDrawer.vue
│       │   ├── NCartItem.vue
│       │   ├── NCartSummary.vue
│       │   └── NCartQuantity.vue
│       └── server/                # REST API + DB (when apiRoutes: true)
│           ├── api/cart/          # 9 endpoints
│           ├── composables/useCartDb.ts
│           ├── middleware/cart-token.ts
│           ├── plugins/auto-migrate.ts
│           └── utils/
├── playground/                    # Development app + live demo
│   ├── nuxt.config.ts
│   ├── app.vue
│   ├── layouts/default.vue        # Sticky header, cart drawer, footer
│   ├── pages/
│   │   ├── index.vue              # Product listing (3 categories, 8 products)
│   │   ├── cart.vue               # Full cart management page
│   │   ├── checkout.vue           # Order review + place order
│   │   └── order-success.vue      # Confirmation page
│   └── server/
│       └── db/
│           └── migrations/
│               └── 001-create-cart.sql
├── test/
│   ├── composables/
│   │   └── useCart.spec.ts        # 49 unit tests
│   └── server/
│       └── api.spec.ts            # Server API tests
├── docs/                          # VitePress documentation
├── package.json
├── build.config.ts
├── vitest.config.ts
```

## Key Files

### `src/module.ts`

The module entry point. Declares `@pinia/nuxt` as a module dependency, sets up runtime config, registers the client-only plugin, auto-imports composables, and conditionally registers UI components when `@nuxt/ui` is present.

### `src/runtime/composables/useCart.ts`

Contains both the Pinia store definition (`useCartStore`) and the public composable (`useCart()`). The store handles all state and logic including items, coupons, and checkout hooks; the composable wraps it with `storeToRefs` for clean reactivity.

### `src/runtime/components/`

Four Vue components built on `@nuxt/ui` v4: `NCartDrawer`, `NCartItem`, `NCartSummary`, `NCartQuantity`. Registered via `addComponentsDir` only when `@nuxt/ui` is in the consumer's modules array.

### `src/runtime/plugin.ts`

Client-only Nuxt plugin (`name: 'nuxt-cart'`) that runs when `persist: true`:
- Calls `load()` on mount for localStorage hydration
- Deep-watches `items` and `coupon` for auto-save
- Registers `beforeunload` / `pagehide` fallback saves

When `persist: false`, the plugin returns immediately without touching localStorage.

## Development Setup

```bash
# Clone and install
cd nuxt-cart
pnpm install

# Prepare stubs and playground types
pnpm dev:prepare

# Run the playground dev server
pnpm dev

# Run tests
pnpm test

# Build the module
pnpm prepack

# Build the playground for production
pnpm dev:build
```

## Testing

Tests use vitest with Pinia. Nuxt-specific imports (`#app`) are mocked. See the [Testing guide](./testing) for details.
