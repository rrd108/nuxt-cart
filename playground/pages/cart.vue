<script setup lang="ts">
defineOptions({ name: 'PlaygroundCart' })
definePageMeta({
  title: 'Shopping Cart',
})

const cart = useCart()
const toast = useToast()
const router = useRouter()
const couponCode = ref('')

async function applyCoupon() {
  await cart.applyCoupon(couponCode.value)
  if (cart.coupon.value) {
    toast.add({ title: 'Coupon applied!', color: 'success', icon: 'i-lucide-check-circle' })
    couponCode.value = ''
  }
  else {
    toast.add({ title: 'Invalid coupon code', color: 'error', icon: 'i-lucide-x-circle' })
  }
}

function removeCoupon() {
  cart.removeCoupon()
  toast.add({ title: 'Coupon removed', color: 'info' })
}

function updateQty(productId: string, qty: number) {
  cart.updateQuantity(productId, qty)
}

function removeItem(productId: string) {
  cart.removeItem(productId)
  toast.add({ title: 'Item removed', color: 'info' })
}
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-3xl font-bold">
      Shopping Cart
    </h1>

    <div
      v-if="cart.isEmpty.value"
      class="flex flex-col items-center gap-4 py-16 text-center"
    >
      <span class="i-lucide-shopping-cart text-6xl text-muted" />
      <p class="text-lg text-muted">
        Your cart is empty
      </p>
      <UButton @click="router.push('/')">
        Browse Products
      </UButton>
    </div>

    <div
      v-else
      class="grid gap-8 lg:grid-cols-3"
    >
      <div class="space-y-3 lg:col-span-2">
        <UCard
          v-for="item in cart.items.value"
          :key="item.productId"
          :ui="{ body: 'p-4' }"
        >
          <div class="flex items-center gap-4">
            <img
              v-if="item.image"
              :src="item.image"
              :alt="item.name"
              class="h-20 w-20 flex-shrink-0 rounded-lg object-cover"
            >
            <div class="min-w-0 flex-1">
              <p class="font-medium truncate">
                {{ item.name }}
              </p>
              <p class="text-sm text-muted">
                ${{ item.price }} each
              </p>
            </div>
            <div class="flex items-center gap-2">
              <UButton
                icon="i-lucide-minus"
                size="xs"
                variant="soft"
                :disabled="item.quantity <= 1"
                @click="updateQty(item.productId, item.quantity - 1)"
              />
              <span class="w-8 text-center font-medium">{{ item.quantity }}</span>
              <UButton
                icon="i-lucide-plus"
                size="xs"
                variant="soft"
                @click="updateQty(item.productId, item.quantity + 1)"
              />
            </div>
            <div class="w-20 text-right">
              <p class="font-semibold">
                ${{ (item.price * item.quantity).toFixed(2) }}
              </p>
            </div>
            <UButton
              icon="i-lucide-trash-2"
              size="xs"
              color="error"
              variant="ghost"
              @click="removeItem(item.productId)"
            />
          </div>
        </UCard>

        <UButton
          variant="soft"
          color="error"
          size="sm"
          @click="cart.clear()"
        >
          Clear Cart
        </UButton>
      </div>

      <div class="space-y-4">
        <UCard>
          <template #header>
            <h2 class="font-semibold">
              Order Summary
            </h2>
          </template>

          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-muted">Subtotal</span>
              <span>${{ cart.totalAmount.value.toFixed(2) }}</span>
            </div>

            <div
              v-if="cart.coupon.value"
              class="flex items-center justify-between text-green-600"
            >
              <div class="flex items-center gap-1">
                <span>Discount ({{ cart.coupon.value.code }})</span>
                <UButton
                  icon="i-lucide-x"
                  size="xs"
                  color="error"
                  variant="ghost"
                  @click="removeCoupon"
                />
              </div>
              <span>- ${{ (cart.totalAmount.value - cart.discountedTotal.value).toFixed(2) }}</span>
            </div>

            <div
              v-if="!cart.coupon.value"
              class="flex gap-2"
            >
              <UInput
                v-model="couponCode"
                placeholder="Coupon code"
                size="sm"
                class="flex-1"
                @keydown.enter="applyCoupon"
              />
              <UButton
                size="sm"
                variant="soft"
                @click="applyCoupon"
              >
                Apply
              </UButton>
            </div>

            <hr>

            <div class="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>${{ cart.discountedTotal.value.toFixed(2) }}</span>
            </div>
          </div>

          <template #footer>
            <UButton
              class="w-full"
              size="lg"
              @click="router.push('/checkout')"
            >
              Proceed to Checkout
            </UButton>
          </template>
        </UCard>
      </div>
    </div>
  </div>
</template>
