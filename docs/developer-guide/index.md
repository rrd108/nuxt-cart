# Developer Guide

This guide covers contributing to the development of the `nuxt-cart` module itself.

## Module Structure

```
nuxt-cart/
├── src/
│   ├── module.ts                  # Module entry — registers plugin, composables, runtimeConfig
│   ├── types.ts                   # Public TypeScript interfaces
│   ├── default-options.ts         # Default configuration values
│   └── runtime/
│       ├── plugin.ts              # Nuxt plugin — hydration, auto-save, event listeners
│       ├── composables/
│       │   └── useCart.ts         # Pinia store + useCart() wrapper (items + coupons)
│       └── components/
│           ├── NCartDrawer.vue    # Slide-out drawer
│           ├── NCartItem.vue      # Single line item
│           ├── NCartSummary.vue   # Total breakdown + checkout
│           └── NCartQuantity.vue  # Quantity selector
├── test/
│   └── composables/
│       └── useCart.spec.ts        # 49 unit tests
├── docs/                          # VitePress documentation
├── package.json
├── build.config.ts
├── vitest.config.ts
```

## Key Files

### `src/module.ts`

The module entry point. Sets up runtime config, registers the plugin, auto-imports for composables, and registers the components directory.

### `src/runtime/composables/useCart.ts`

Contains both the Pinia store definition (`useCartStore`) and the public composable (`useCart()`). The store handles all state and logic including items, coupons, and checkout hooks; the composable wraps it with `storeToRefs` for clean reactivity.

### `src/runtime/components/`

Four Vue components built on `@nuxt/ui` v4: `NCartDrawer`, `NCartItem`, `NCartSummary`, `NCartQuantity`. They use `useCart()` internally and auto-imported Nuxt composables.

### `src/runtime/plugin.ts`

Nuxt plugin that:
- Calls `load()` on app mount for localStorage hydration
- Deep-watches `items` and `coupon` for auto-save
- Registers `beforeunload` / `pagehide` fallback saves

## Development Setup

```bash
# Clone and install
cd nuxt-cart
pnpm install

# Run tests
pnpm test

# Build the module
pnpm prepack
```

## Testing

Tests use vitest with Pinia. Nuxt-specific imports (`#app`) are mocked. See the [Testing guide](./testing) for details.
