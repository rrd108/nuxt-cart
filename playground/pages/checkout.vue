<script setup lang="ts">
const cart = useCart()
const router = useRouter()

async function placeOrder() {
  const result = await cart.checkout()
  if (result.redirectUrl) {
    window.location.href = result.redirectUrl
  }
  else if (result.error) {
    alert(result.error)
  }
  else {
    cart.clear()
    alert('Order placed!')
  }
}
</script>

<template>
  <div class="mx-auto max-w-2xl space-y-6 p-6">
    <h1 class="text-2xl font-bold">
      Checkout
    </h1>

    <div v-for="item in cart.items.value" :key="item.productId" class="flex items-center justify-between rounded-lg border p-4">
      <div>
        <p class="font-medium">{{ item.name }}</p>
        <p class="text-sm text-muted">{{ item.quantity }} × ${{ item.price }}</p>
      </div>
      <p class="font-medium">${{ item.price * item.quantity }}</p>
    </div>

    <div class="space-y-2 border-t pt-4">
      <div class="flex justify-between">
        <span>Subtotal</span>
        <span>${{ cart.totalAmount.value }}</span>
      </div>
      <div v-if="cart.coupon.value" class="flex justify-between text-green-600">
        <span>Discount ({{ cart.coupon.value.code }})</span>
        <span>-${{ cart.totalAmount.value - cart.discountedTotal.value }}</span>
      </div>
      <div class="flex justify-between text-lg font-bold">
        <span>Total</span>
        <span>${{ cart.discountedTotal.value }}</span>
      </div>
    </div>

    <div class="flex gap-3">
      <UButton variant="soft" @click="router.back()">
        Back
      </UButton>
      <UButton @click="placeOrder">
        Place Order
      </UButton>
    </div>
  </div>
</template>
