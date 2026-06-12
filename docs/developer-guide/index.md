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
│       └── composables/
│           └── useCart.ts         # Pinia store + useCart() wrapper
├── test/
│   └── composables/
│       └── useCart.spec.ts        # 35 unit tests
├── docs/                          # VitePress documentation
├── package.json
├── build.config.ts
├── vitest.config.ts
```

## Key Files

### `src/module.ts`

The module entry point. Sets up runtime config, registers the plugin, auto-imports for composables, and registers the components directory.

### `src/runtime/composables/useCart.ts`

Contains both the Pinia store definition (`useCartStore`) and the public composable (`useCart()`). The store handles all state and logic; the composable wraps it with `storeToRefs` for clean reactivity.

### `src/runtime/plugin.ts`

Nuxt plugin that:
- Calls `load()` on app mount for localStorage hydration
- Deep-watches `items` and auto-saves
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

Tests use vitest with Pinia. Nuxt-specific imports (`#app`) are mocked:

```ts
vi.mock('#app', () => ({
  useRuntimeConfig: () => ({
    public: {
      nuxtCart: {
        persist: false,
        storageKey: 'nuxt-cart-test',
        maxQuantity: 10,
        coupons: false,
        apiRoutes: false,
        currency: 'USD',
      },
    },
  }),
}))
```

Write new tests following the existing patterns in `test/composables/useCart.spec.ts`. Future phases will add server API tests using `@nuxt/test-utils`.
