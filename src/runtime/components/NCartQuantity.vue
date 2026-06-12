<template>
  <div class="flex items-center gap-1">
    <UButton
      icon="i-lucide-minus"
      size="xs"
      color="neutral"
      variant="ghost"
      :disabled="modelValue <= 1"
      @click="decrement"
    />
    <span class="w-8 text-center text-sm font-medium tabular-nums">{{ modelValue }}</span>
    <UButton
      icon="i-lucide-plus"
      size="xs"
      color="neutral"
      variant="ghost"
      :disabled="modelValue >= max"
      @click="increment"
    />
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: number
  max?: number
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

function decrement() {
  if (props.modelValue > 1) {
    emit('update:modelValue', props.modelValue - 1)
  }
}

function increment() {
  if (!props.max || props.modelValue < props.max) {
    emit('update:modelValue', props.modelValue + 1)
  }
}
</script>
