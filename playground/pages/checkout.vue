<script setup lang="ts">
definePageMeta({
  title: 'Checkout',
})

const cart = useCart()
const router = useRouter()
const toast = useToast()
const loading = ref(false)

const orderId = ref(`ORD-${Date.now().toString(36).toUpperCase()}`)

async function placeOrder() {
  loading.value = true
  await new Promise(r => setTimeout(r, 1000))

  const result = await cart.checkout()
  loading.value = false

  if (result.redirectUrl) {
    window.location.href = result.redirectUrl
    return
  }

  if (result.error) {
    toast.add({ title: result.error, color: 'error', icon: 'i-lucide-x-circle' })
    return
  }

  cart.clear()
  router.push(`/order-success?orderId=${orderId.value}`)
}
</script>

<template>
  <div class="mx-auto max-w-2xl space-y-6">
    <h1 class="text-3xl font-bold">
      Checkout
    </h1>

    <UCard>
      <div class="space-y-4">
        <div
          v-for="item in cart.items.value"
          :key="item.productId"
          class="flex items-center justify-between"
        >
          <div class="flex items-center gap-3">
            <img
              v-if="item.image"
              :src="item.image"
              :alt="item.name"
              class="h-12 w-12 rounded-lg object-cover"
            />
            <div>
              <p class="font-medium">{{ item.name }}</p>
              <p class="text-sm text-muted">Qty: {{ item.quantity }}</p>
            </div>
          </div>
          <p class="font-medium">${{ (item.price * item.quantity).toFixed(2) }}</p>
        </div>
      </div>

      <hr class="my-4">

      <div class="space-y-2">
        <div class="flex justify-between text-muted">
          <span>Subtotal</span>
          <span>${{ cart.totalAmount.value.toFixed(2) }}</span>
        </div>
        <div v-if="cart.coupon.value" class="flex justify-between text-green-600">
          <span>Discount ({{ cart.coupon.value.code }})</span>
          <span>- ${{ (cart.totalAmount.value - cart.discountedTotal.value).toFixed(2) }}</span>
        </div>
        <div class="flex justify-between text-lg font-bold">
          <span>Total</span>
          <span>${{ cart.discountedTotal.value.toFixed(2) }}</span>
        </div>
      </div>
    </UCard>

    <div class="flex gap-3">
      <UButton variant="soft" @click="router.back()">
        Back
      </UButton>
      <UButton
        :loading="loading"
        :disabled="loading || cart.isEmpty.value"
        @click="placeOrder"
      >
        Place Order — ${{ cart.discountedTotal.value.toFixed(2) }}
      </UButton>
    </div>
  </div>
</template>
