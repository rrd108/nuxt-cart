# Installation

## Nuxt Version Support

This module is compatible with **Nuxt 4** (and later). For Nuxt 3 compatibility, check version history.

## Install the Module

```bash
npm install nuxt-cart
# or
yarn add nuxt-cart
# or
pnpm add nuxt-cart
```

## Peer Dependencies

This module uses peer dependencies to avoid bundling packages that you may already have in your project:

### Required Peer Dependencies

```bash
# Pinia state management (required)
npm install @pinia/nuxt pinia
```

### Why Peer Dependencies?

- **No duplication** — You already have Pinia in most Nuxt projects
- **Version control** — You control the exact version of Pinia
- **Bundle size** — Avoids bundling unused dependencies

### What Happens if Dependencies Are Missing?

The module will still load, but calling `useCart()` will throw an error if Pinia is not registered. Install `@pinia/nuxt` and ensure it is available in your project.

## Add to Nuxt Config

Add the module to your `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  modules: ['nuxt-cart'],

  // Optional configuration
  nuxtCart: {
    persist: true,
    storageKey: 'my-cart',
    maxQuantity: 50,
    currency: 'EUR',
  },
})
```

Nuxt Cart declares `@pinia/nuxt` as a [module dependency](https://nuxt.com/docs/guide/modules/module-anatomy#module-dependencies). Nuxt automatically registers and runs Pinia before this module, so you do not need to list `@pinia/nuxt` manually unless you want to pass Pinia-specific options.

### Optional: Nuxt UI Components

To use the built-in `NCart*` components, install `@nuxt/ui` and add it to your modules:

```bash
npm install @nuxt/ui
```

```ts
export default defineNuxtConfig({
  modules: ['nuxt-cart', '@nuxt/ui'],
})
```

Components are only registered when `@nuxt/ui` is present in your modules array. The composable-only setup works without it.

## Verify Installation

Create a simple page to verify the cart works:

```vue
<script setup lang="ts">
const cart = useCart()
cart.addItem({ productId: 'test', name: 'Test Item', price: 100 })

console.log(cart.itemCount.value) // 1
console.log(cart.totalAmount.value) // 100
</script>
```

If you see the expected output in your browser console, the module is working correctly.

## Next Steps

- [Getting Started](./getting-started) — Build your first cart UI
- [Configuration](./configuration) — Learn about all available options
- [Composables](./composables) — Full `useCart()` API reference
