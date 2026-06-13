<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const orderId = route.query.orderId || 'N/A'
</script>

<template>
  <div class="flex flex-col items-center gap-6 py-16 text-center">
    <span class="i-lucide-check-circle text-6xl text-green-500" />
    <h1 class="text-3xl font-bold">
      Order Placed!
    </h1>
    <p class="text-lg text-muted">
      Thank you for your purchase. Your order reference is <strong>{{ orderId }}</strong>.
    </p>
    <UButton @click="router.push('/')">
      Continue Shopping
    </UButton>
  </div>
</template>
