# Basic Setup Examples

This guide provides practical, copy-paste ready examples for common Nuxt Cart setups.

## Minimal Setup

The fastest way to get a cart working in your Nuxt app.

```bash
# Install the module and peer dependency
npm install nuxt-cart @pinia/nuxt
```

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['nuxt-cart'],
  // That's it! No configuration needed
})
```

```vue
<!-- components/AddToCart.vue -->
<script setup lang="ts">
const props = defineProps<{
  productId: string
  name: string
  price: number
  image?: string
}>()

const cart = useCart()
const toast = useToast()

function add() {
  cart.addItem({
    productId: props.productId,
    name: props.name,
    price: props.price,
    image: props.image,
  })

  toast.add({
    title: `${props.name} added to cart`,
    color: 'success',
  })
}
</script>

<template>
  <UButton @click="add">
    Add to Cart
  </UButton>
</template>
```

## Cart Page

A full shopping cart page with item listing, totals, and controls.

```vue
<!-- pages/cart.vue -->
<script setup lang="ts">
const cart = useCart()

useSeoMeta({
  title: 'Shopping Cart',
})
</script>

<template>
  <div class="cart-page">
    <h1>Shopping Cart</h1>

    <div v-if="cart.isEmpty.value" class="empty-cart">
      <p>Your cart is empty.</p>
      <NuxtLink to="/products">Browse Products</NuxtLink>
    </div>

    <div v-else class="cart-content">
      <div class="cart-items">
        <div
          v-for="item in cart.items.value"
          :key="item.productId"
          class="cart-item"
        >
          <img v-if="item.image" :src="item.image" :alt="item.name">
          <div class="item-details">
            <h3>{{ item.name }}</h3>
            <p>{{ item.price }}€ each</p>
          </div>
          <div class="item-quantity">
            <button @click="cart.updateQuantity(item.productId, item.quantity - 1)">−</button>
            <span>{{ item.quantity }}</span>
            <button @click="cart.updateQuantity(item.productId, item.quantity + 1)">+</button>
          </div>
          <div class="item-total">
            <p>{{ item.price * item.quantity }}€</p>
          </div>
          <button
            class="remove-btn"
            @click="cart.removeItem(item.productId)"
          >
            ✕
          </button>
        </div>
      </div>

      <div class="cart-summary">
        <div class="summary-row">
          <span>Items</span>
          <span>{{ cart.itemCount.value }}</span>
        </div>
        <div class="summary-row total">
          <span>Total</span>
          <span>{{ cart.totalAmount.value }}€</span>
        </div>

        <UButton
          color="primary"
          size="lg"
          class="checkout-btn"
        >
          Proceed to Checkout
        </UButton>

        <UButton
          color="neutral"
          variant="ghost"
          @click="cart.clear()"
        >
          Clear Cart
        </UButton>
      </div>
    </div>
  </div>
</template>
```

## Header Cart Badge

Show item count in the navigation header.

```vue
<!-- components/AppHeader.vue -->
<script setup lang="ts">
const cart = useCart()
</script>

<template>
  <header>
    <nav>
      <NuxtLink to="/">Home</NuxtLink>
      <NuxtLink to="/cart" class="cart-link">
        Cart
        <span
          v-if="cart.itemCount.value > 0"
          class="cart-badge"
        >
          {{ cart.itemCount.value }}
        </span>
      </NuxtLink>
    </nav>
  </header>
</template>

<style scoped>
.cart-link {
  position: relative;
}
.cart-badge {
  position: absolute;
  top: -8px;
  right: -12px;
  background: #e53e3e;
  color: white;
  border-radius: 50%;
  padding: 2px 6px;
  font-size: 12px;
  min-width: 20px;
  text-align: center;
}
</style>
```

## Working with Donation Items

Adapting the cart for donation-based use cases (like seva offerings):

```vue
<script setup lang="ts">
interface DonationItem {
  id: string
  label: string
  price: number
  group: string
  to?: string
}

const cart = useCart()

function addDonation(item: DonationItem) {
  cart.addItem({
    productId: item.id,
    name: item.label,
    price: item.price,
    metadata: {
      group: item.group,
      to: item.to,
    },
  })
}
</script>
```

## Custom Quantity Behavior

Configure quantity increments and limits:

```vue
<script setup lang="ts">
const cart = useCart()
const maxQty = 10

function increment(productId: string, currentQty: number) {
  if (currentQty >= maxQty) return
  cart.addItem({ productId, name: 'Product', price: 100 })
}

function decrement(productId: string, currentQty: number) {
  if (currentQty <= 1) {
    cart.removeItem(productId)
  } else {
    cart.updateQuantity(productId, currentQty - 1)
  }
}
</script>
```

## Using Cart Components

The module provides ready-to-use components when `@nuxt/ui` v4 is installed **and listed in modules**:

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

function addToCart(product: { id: string; name: string; price: number }) {
  cart.addItem({
    productId: product.id,
    name: product.name,
    price: product.price,
  })
  isCartOpen.value = true
}
</script>

<template>
  <div>
    <UButton @click="isCartOpen = true">
      Cart ({{ cart.itemCount.value }})
    </UButton>

    <NCartDrawer
      :open="isCartOpen"
      @close="isCartOpen = false"
      @checkout="handleCheckout"
    />
  </div>
</template>
```

## Using Coupons

Enable coupon support in your config:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['nuxt-cart'],
  nuxtCart: {
    coupons: true,
  },
})
```

Then in your app:

```vue
<script setup lang="ts">
const cart = useCart()

// Register a validation hook
cart.onValidateCoupon(async (code) => {
  const { data } = await useFetch('/api/coupon/validate', { query: { code } })
  return data.value // { code, discount, type } or null
})

async function applyCoupon() {
  await cart.applyCoupon('SUMMER20')
  if (cart.coupon.value) {
    // Coupon applied — discountedTotal reflects the discount
  }
}

function removeCoupon() {
  cart.removeCoupon()
}
</script>

<template>
  <div>
    <p>Total: {{ cart.totalAmount.value }}</p>
    <p v-if="cart.coupon.value">Discounted: {{ cart.discountedTotal.value }}</p>
    <button @click="applyCoupon">Apply Coupon</button>
    <button @click="removeCoupon">Remove Coupon</button>
  </div>
</template>
```

## Using Checkout Hooks

Register a payment handler and trigger checkout:

```vue
<script setup lang="ts">
const cart = useCart()

cart.onCheckout(async (cartData) => {
  // Send cart data to your payment gateway
  const { data } = await useFetch('/api/checkout', {
    method: 'POST',
    body: cartData,
  })
  if (data.value?.url) return { redirectUrl: data.value.url }
  return { error: 'Checkout failed' }
})

async function handleCheckout() {
  const result = await cart.checkout()
  if (result.redirectUrl) {
    window.location.href = result.redirectUrl
  } else if (result.error) {
    alert(result.error)
  } else {
    // No handlers registered — proceed with default flow
    cart.clear()
  }
}
</script>
```

## Testing Your Setup

```bash
npm run dev
```

1. Add items to the cart from your product pages
2. Navigate to the cart page — items should appear with correct totals
3. Modify quantities — totals should update reactively
4. Refresh the page — items should persist from localStorage
5. Clear the cart — all items should be removed

## Next Steps

- [Components](/user-guide/components) — Ready-to-use cart UI components
- [Configuration](/user-guide/configuration) — Customize module options
- [Composables](/user-guide/composables) — Full `useCart()` API reference
- [Persistence](/user-guide/persistence) — How hydration and auto-save work
