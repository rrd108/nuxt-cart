<template>
  <USlideover
    :open="open"
    title="Shopping Cart"
    side="right"
    @update:open="$emit('close')"
  >
    <template #body>
      <div class="flex h-full flex-col">
        <div
          v-if="cart.isEmpty.value"
          class="flex flex-1 flex-col items-center justify-center text-center"
        >
          <div class="mb-4 rounded-full bg-muted p-4">
            <UIcon
              name="i-lucide-shopping-cart"
              class="size-8 text-muted"
            />
          </div>
          <p class="text-sm font-medium text-default">
            Your cart is empty
          </p>
          <p class="mt-1 text-sm text-muted">
            Add items to get started
          </p>
        </div>
        <div
          v-else
          class="flex-1 overflow-auto divide-y divide-border"
        >
          <NCartItem
            v-for="item in cart.items.value"
            :key="item.productId"
            :item="item"
            @update:quantity="q => cart.updateQuantity(item.productId, q)"
            @remove="cart.removeItem(item.productId)"
          />
        </div>
        <div class="border-t border-border pt-4">
          <div
            v-if="showCouponInput"
            class="mb-4"
          >
            <UInput
              v-model="couponCode"
              placeholder="Coupon code"
              size="sm"
            >
              <template #trailing>
                <UButton
                  size="xs"
                  color="neutral"
                  variant="ghost"
                  :disabled="!couponCode.trim()"
                  @click="handleApplyCoupon"
                >
                  Apply
                </UButton>
              </template>
            </UInput>
            <p
              v-if="couponError"
              class="mt-1 text-xs text-error"
            >
              {{ couponError }}
            </p>
          </div>
          <NCartSummary @checkout="$emit('checkout')" />
        </div>
      </div>
    </template>
  </USlideover>
</template>

<script setup lang="ts">
defineProps<{
  open: boolean
}>()

defineEmits<{
  close: []
  checkout: []
}>()

const cart = useCart()
const couponCode = ref('')
const couponError = ref('')

const config = useRuntimeConfig().public?.nuxtCart ?? {}
const showCouponInput = (config as { coupons?: boolean }).coupons ?? false

async function handleApplyCoupon() {
  couponError.value = ''
  try {
    const prevCoupon = cart.coupon.value
    await cart.applyCoupon(couponCode.value.trim())
    if (cart.coupon.value === prevCoupon) {
      couponError.value = 'Invalid coupon code'
    }
    else {
      couponCode.value = ''
    }
  }
  catch {
    couponError.value = 'Failed to validate coupon'
  }
}
</script>
