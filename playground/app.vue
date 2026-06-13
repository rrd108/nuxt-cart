<template>
  <UApp>
    <div class="mx-auto max-w-2xl space-y-6 p-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold">
          Nuxt Cart Playground
        </h1>
        <UButton
          icon="i-lucide-shopping-cart"
          :label="`Cart (${cart.itemCount.value})`"
          @click="drawerOpen = true"
        />
      </div>

      <div class="grid gap-3">
        <UCard
          v-for="product in products"
          :key="product.productId"
        >
          <div class="flex items-center justify-between gap-4">
            <div>
              <p class="font-medium">
                {{ product.name }}
              </p>
              <p class="text-sm text-muted">
                ${{ product.price }}
              </p>
            </div>
            <UButton
              label="Add to cart"
              size="sm"
              @click="cart.addItem(product)"
            />
          </div>
        </UCard>
      </div>

      <NCartDrawer
        :open="drawerOpen"
        @close="drawerOpen = false"
        @checkout="handleCheckout"
      />
    </div>
  </UApp>
</template>

<script setup lang="ts">
const cart = useCart()
const drawerOpen = ref(false)

const products = [
  { productId: 'p1', name: 'Widget', price: 9.99 },
  { productId: 'p2', name: 'Gadget', price: 19.99 },
  { productId: 'p3', name: 'Gizmo', price: 29.99 },
]

cart.onValidateCoupon(async (code) => {
  if (code.toUpperCase() === 'SAVE10') {
    return { code: 'SAVE10', discount: 10, type: 'percentage' as const }
  }
  return null
})

const handleCheckout = () => {
  drawerOpen.value = false
  alert(`Checkout ${cart.discountedTotal.value} USD (${cart.itemCount.value} items)`)
}
</script>
