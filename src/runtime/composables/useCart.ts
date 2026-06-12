import { ref, computed, watch } from 'vue'
import { defineStore, storeToRefs } from 'pinia'
import { useRuntimeConfig } from '#app'
import { destr } from 'destr'
import type { ModuleOptions, CartItem, CartState, Coupon, ValidateCouponHook } from '../../types'

const useCartStore = defineStore('nuxt-cart', () => {
  const config = (useRuntimeConfig().public?.nuxtCart ?? {}) as ModuleOptions
  const maxQty = config.maxQuantity ?? 99
  const storageKey = config.storageKey || 'nuxt-cart'

  const items = ref<CartItem[]>([])
  const coupon = ref<Coupon | null>(null)
  const isHydrated = ref(false)
  const validateCouponHooks: ValidateCouponHook[] = []

  const totalAmount = computed(() =>
    items.value.reduce((sum, item) => sum + item.price * item.quantity, 0),
  )
  const discountedTotal = computed(() => {
    const total = totalAmount.value
    if (!coupon.value) return total
    if (coupon.value.type === 'fixed') {
      return Math.max(0, total - coupon.value.discount)
    }
    return Math.max(0, Math.round(total * (100 - coupon.value.discount) / 100))
  })
  const itemCount = computed(() =>
    items.value.reduce((sum, item) => sum + item.quantity, 0),
  )
  const isEmpty = computed(() => items.value.length === 0)

  function addItem(input: Omit<CartItem, 'quantity'> & { quantity?: number }): void {
    const qty = input.quantity ?? 1
    const existing = items.value.find(i => i.productId === input.productId)

    if (existing) {
      existing.quantity = Math.min(existing.quantity + qty, maxQty)
    }
    else {
      items.value.push({
        productId: input.productId,
        name: input.name,
        price: input.price,
        quantity: Math.min(qty, maxQty),
        image: input.image,
        metadata: input.metadata,
      })
    }
  }

  function removeItem(productId: string): void {
    items.value = items.value.filter(i => i.productId !== productId)
  }

  function updateQuantity(productId: string, quantity: number): void {
    if (quantity <= 0) {
      removeItem(productId)
      return
    }
    const item = items.value.find(i => i.productId === productId)
    if (item) {
      item.quantity = Math.min(quantity, maxQty)
    }
  }

  function onValidateCoupon(hook: ValidateCouponHook): void {
    validateCouponHooks.push(hook)
  }

  async function applyCoupon(code: string): Promise<void> {
    if (!config.coupons) return
    if (validateCouponHooks.length === 0) return
    const result = await validateCouponHooks[0](code)
    if (result) {
      coupon.value = result
    }
  }

  function removeCoupon(): void {
    coupon.value = null
  }

  function clear(): void {
    items.value = []
    coupon.value = null
  }

  function persist(): void {
    try {
      const state: CartState = {
        items: items.value,
        coupon: coupon.value,
        updatedAt: new Date().toISOString(),
      }
      localStorage.setItem(storageKey, JSON.stringify(state))
    }
    catch {
      // localStorage not available (SSR, test, or privacy mode)
    }
  }

  function load(): void {
    try {
      const raw = localStorage.getItem(storageKey)
      if (!raw) return
      const parsed = destr<CartState>(raw)
      if (!parsed || typeof parsed !== 'object') return
      if (Array.isArray(parsed.items)) {
        items.value = parsed.items.filter(isValidCartItem)
      }
      if (parsed.coupon && isValidCoupon(parsed.coupon)) {
        coupon.value = parsed.coupon
      }
      isHydrated.value = true
    }
    catch {
      // localStorage not available
    }
  }

  return {
    items,
    coupon,
    isHydrated,
    totalAmount,
    discountedTotal,
    itemCount,
    isEmpty,
    addItem,
    removeItem,
    updateQuantity,
    clear,
    persist,
    load,
    applyCoupon,
    removeCoupon,
    onValidateCoupon,
  }
})

function isValidCoupon(value: unknown): value is Coupon {
  if (!value || typeof value !== 'object') return false
  const c = value as Record<string, unknown>
  return (
    typeof c.code === 'string'
    && typeof c.discount === 'number'
    && Number.isFinite(c.discount)
    && (c.type === 'fixed' || c.type === 'percentage')
  )
}

function isValidCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return (
    typeof item.productId === 'string'
    && typeof item.name === 'string'
    && typeof item.price === 'number'
    && Number.isFinite(item.price)
    && typeof item.quantity === 'number'
    && Number.isInteger(item.quantity)
    && item.quantity > 0
  )
}

export function useCart() {
  const store = useCartStore()
  const {
    items,
    coupon,
    isHydrated,
    totalAmount,
    discountedTotal,
    itemCount,
    isEmpty,
  } = storeToRefs(store)
  const {
    addItem,
    removeItem,
    updateQuantity,
    clear,
    persist,
    load,
    applyCoupon,
    removeCoupon,
    onValidateCoupon,
  } = store
  return {
    items,
    coupon,
    isHydrated,
    totalAmount,
    discountedTotal,
    itemCount,
    isEmpty,
    addItem,
    removeItem,
    updateQuantity,
    clear,
    persist,
    load,
    applyCoupon,
    removeCoupon,
    onValidateCoupon,
  }
}
