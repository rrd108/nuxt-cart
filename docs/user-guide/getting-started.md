# Getting Started

Welcome to Nuxt Cart! This guide will get you up and running with a shopping cart in your Nuxt application in just a few minutes.

## Zero-Config Quick Start

The fastest way to get started is with our zero-config approach. Just install the module and you're ready to go!

### 1. Install the Module

```bash
npm install nuxt-cart
# or
yarn add nuxt-cart
# or
pnpm add nuxt-cart
```

### 2. Install the Required Peer Dependency

Nuxt Cart uses Pinia for state management. You need `@pinia/nuxt` in your project:

```bash
npm install @pinia/nuxt
# or
yarn add @pinia/nuxt
# or
pnpm add @pinia/nuxt
```

### 3. Add to Your Nuxt Config

Add the modules to your `nuxt.config.ts`. `@pinia/nuxt` must be listed before `nuxt-cart`:

```ts
export default defineNuxtConfig({
  modules: ['@pinia/nuxt', 'nuxt-cart']
})
```

That's it! The module automatically sets up:
- A Pinia store for cart state
- localStorage persistence with auto-save
- The `useCart()` composable available throughout your app

### 4. Use the Cart in Your App

```vue
<script setup lang="ts">
const cart = useCart()

function addToCart(product: { id: string; name: string; price: number }) {
  cart.addItem({
    productId: product.id,
    name: product.name,
    price: product.price,
  })
}
</script>

<template>
  <div>
    <button @click="addToCart({ id: 'p1', name: 'Product', price: 100 })">
      Add to Cart
    </button>

    <div v-if="!cart.isEmpty.value">
      <p>{{ cart.itemCount.value }} items in cart</p>
      <p>Total: {{ cart.totalAmount.value }}€</p>
    </div>
  </div>
</template>
```

### 5. Display Cart Items

```vue
<script setup lang="ts">
const cart = useCart()
</script>

<template>
  <div>
    <h2>Shopping Cart</h2>

    <div v-if="cart.isEmpty.value">
      <p>Your cart is empty.</p>
    </div>

    <div v-else>
      <div v-for="item in cart.items.value" :key="item.productId" class="cart-item">
        <p>{{ item.name }} × {{ item.quantity }}</p>
        <p>{{ item.price * item.quantity }}€</p>
        <button @click="cart.removeItem(item.productId)">Remove</button>
      </div>

      <hr>
      <p><strong>Total: {{ cart.totalAmount.value }}€</strong></p>
      <button @click="cart.clear()">Clear Cart</button>
    </div>
  </div>
</template>
```

That's it! You now have a fully functional shopping cart. 🎉

## Test Your Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Add a few items to the cart from different pages
3. Refresh the page — items are persisted in localStorage
4. Remove items or clear the cart

## Next Steps

Now that you have a working cart, you might want to:

- **[Configure the Module](./configuration.md)** — Customize storage key, max quantity, currency
- **[Explore the Composables API](./composables.md)** — Full `useCart()` reference
- **[Understand Persistence](./persistence.md)** — How hydration and type-guard validation work
- **[Try the Examples](/examples/basic-setup)** — Complete implementation patterns

## Need Help?

- Check the [Configuration Guide](./configuration.md) for all available options
- Browse [Practical Examples](/examples/basic-setup) for more use cases
- Review the [API Reference](/api/) for detailed documentation
