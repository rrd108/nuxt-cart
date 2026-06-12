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

The module will still load, but calling `useCart()` will throw an error if Pinia is not registered. Make sure `@pinia/nuxt` is in your modules array before `nuxt-cart`.

## Add to Nuxt Config

Add the module to your `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  modules: ['@pinia/nuxt', 'nuxt-cart'],

  // Optional configuration
  nuxtCart: {
    persist: true,
    storageKey: 'my-cart',
    maxQuantity: 50,
    currency: 'EUR',
  },
})
```

> **Important:** `@pinia/nuxt` must be listed **before** `nuxt-cart` in the modules array to ensure Pinia is initialized first.

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
