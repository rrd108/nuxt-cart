<template>
  <div class="flex items-center gap-4 py-3">
    <div
      v-if="item.image"
      class="size-16 shrink-0 overflow-hidden rounded-lg bg-muted"
    >
      <img
        :src="item.image"
        :alt="item.name"
        class="size-full object-cover"
      />
    </div>
    <div class="flex-1 min-w-0">
      <p class="text-sm font-medium text-default truncate">
        {{ item.name }}
      </p>
      <p class="mt-0.5 text-sm text-muted">
        {{ formatPrice(item.price) }}
      </p>
    </div>
    <div class="flex items-center gap-3">
      <NCartQuantity
        :model-value="item.quantity"
        :max="maxQuantity"
        @update:model-value="$emit('update:quantity', $event)"
      />
      <p class="w-16 text-right text-sm font-medium tabular-nums text-default">
        {{ formatPrice(item.price * item.quantity) }}
      </p>
      <UButton
        icon="i-lucide-x"
        size="xs"
        color="error"
        variant="ghost"
        @click="$emit('remove')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CartItem } from '../../types'

const props = defineProps<{
  item: CartItem
}>()

defineEmits<{
  remove: []
  'update:quantity': [value: number]
}>()

const config = useRuntimeConfig().public?.nuxtCart ?? {}
const maxQuantity = (config as { maxQuantity?: number }).maxQuantity ?? 99

function formatPrice(amount: number): string {
  const currency = (config as { currency?: string }).currency ?? 'USD'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}
</script>
