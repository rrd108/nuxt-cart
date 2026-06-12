<template>
  <div class="space-y-3">
    <div class="space-y-1.5 text-sm">
      <div class="flex justify-between text-muted">
        <span>Subtotal</span>
        <span class="tabular-nums">{{ formatPrice(cart.totalAmount.value) }}</span>
      </div>
      <div
        v-if="cart.coupon.value"
        class="flex justify-between text-success"
      >
        <span>Discount ({{ cart.coupon.value.code }})</span>
        <span class="tabular-nums">-{{ formatPrice(discountAmount) }}</span>
      </div>
    </div>
    <hr class="border-border" />
    <div class="flex justify-between text-base font-semibold text-default">
      <span>Total</span>
      <span class="tabular-nums">{{ formatPrice(cart.discountedTotal.value) }}</span>
    </div>
    <UButton
      label="Checkout"
      color="primary"
      size="lg"
      class="w-full"
      :disabled="cart.isEmpty.value"
      @click="$emit('checkout')"
    />
  </div>
</template>

<script setup lang="ts">
defineEmits<{
  checkout: []
}>()

const cart = useCart()

const discountAmount = computed(() => cart.totalAmount.value - cart.discountedTotal.value)

const config = useRuntimeConfig().public?.nuxtCart ?? {}
function formatPrice(amount: number): string {
  const currency = (config as { currency?: string }).currency ?? 'USD'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}
</script>
