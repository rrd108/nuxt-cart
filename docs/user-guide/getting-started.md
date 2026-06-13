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

Add the module to your `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  modules: ['nuxt-cart'],
})
```

That's it! The module automatically sets up:
- `@pinia/nuxt` via module dependencies (no manual ordering required)
- A Pinia store for cart state
- Client-side localStorage persistence with auto-save (when `persist: true`)
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

## Using Components

With `@nuxt/ui` v4 installed and listed in your modules, the `NCart*` components are auto-imported:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['nuxt-cart', '@nuxt/ui'],
})
```

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

## Using Coupons

Enable coupons in config and register a validation hook:

```vue
<script setup lang="ts">
const cart = useCart()

cart.onValidateCoupon(async (code) => {
  const { data } = await useFetch('/api/coupon/validate', { query: { code } })
  return data.value
})

await cart.applyCoupon('SUMMER20')
console.log(cart.discountedTotal.value)
</script>
```

## Next Steps

Now that you have a working cart, you might want to:

- **[Use the Components](./components.md)** — Ready-to-use cart UI
- **[Configure the Module](./configuration.md)** — Customize storage key, max quantity, currency, coupons
- **[Explore the Composables API](./composables.md)** — Full `useCart()` reference
- **[Understand Persistence](./persistence.md)** — How hydration and type-guard validation work
- **[Try the Examples](/examples/basic-setup)** — Complete implementation patterns

## Need Help?

- Check the [Configuration Guide](./configuration.md) for all available options
- Browse [Practical Examples](/examples/basic-setup) for more use cases
- Review the [API Reference](/api/) for detailed documentation
