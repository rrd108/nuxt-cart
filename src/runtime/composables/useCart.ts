import { ref, computed } from 'vue'
import { defineStore, storeToRefs } from 'pinia'
import { useRuntimeConfig } from '#app'
import { destr } from 'destr'
import type { ModuleOptions, CartItem, CartState, Coupon, CheckoutHook, ValidateCouponHook } from '../../types'

const useCartStore = defineStore('nuxt-cart', () => {
  const config = (useRuntimeConfig().public?.nuxtCart ?? {}) as ModuleOptions
  const maxQty = config.maxQuantity ?? 99
  const storageKey = config.storageKey || 'nuxt-cart'

  const items = ref<CartItem[]>([])
  const coupon = ref<Coupon | null>(null)
  const isHydrated = ref(false)
  const validateCouponHooks: ValidateCouponHook[] = []
  const checkoutHooks: CheckoutHook[] = []

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

  function onCheckout(hook: CheckoutHook): void {
    checkoutHooks.push(hook)
  }

  async function checkout(): Promise<{ redirectUrl?: string, error?: string }> {
    const state: CartState = {
      items: [...items.value],
      coupon: coupon.value ? { ...coupon.value } : null,
    }
    for (const hook of checkoutHooks) {
      const result = await hook(state)
      if (result.redirectUrl || result.error) {
        return result
      }
    }
    return {}
  }

  async function applyCoupon(code: string): Promise<void> {
    if (!config.coupons) return
    if (validateCouponHooks.length === 0) return
    const result = await validateCouponHooks[0]?.(code)
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
      // ignore
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
      // ignore
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
    onCheckout,
    checkout,
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

function loadToken(storageKey: string): string | null {
  try {
    const raw = localStorage.getItem(`${storageKey}-token`)
    return raw ? destr<string>(raw) : null
  }
  catch {
    return null
  }
}

function saveToken(storageKey: string, token: string): void {
  try {
    localStorage.setItem(`${storageKey}-token`, token)
  }
  catch {
    // ignore
  }
}

function removeToken(storageKey: string): void {
  try {
    localStorage.removeItem(`${storageKey}-token`)
  }
  catch {
    // ignore
  }
}

export function useCart() {
  const store = useCartStore()
  const config = (useRuntimeConfig().public?.nuxtCart ?? {}) as ModuleOptions
  const storageKey = config.storageKey || 'nuxt-cart'

  const {
    items,
    coupon,
    isHydrated,
    totalAmount,
    discountedTotal,
    itemCount,
    isEmpty,
  } = storeToRefs(store)

  const cartToken = ref<string | null>(loadToken(storageKey))
  const isServerSynced = ref(false)

  async function ensureServerCart(): Promise<string | null> {
    if (!config.apiRoutes) return null
    if (cartToken.value) return cartToken.value
    try {
      const { token } = await $fetch('/api/cart', { method: 'POST' })
      cartToken.value = token
      saveToken(storageKey, token)
      for (const item of items.value) {
        await $fetch('/api/cart/items', { method: 'POST', body: item }).catch(() => {})
      }
      return token
    }
    catch {
      return null
    }
  }

  async function syncFromServer(): Promise<void> {
    if (!config.apiRoutes || !cartToken.value) return
    try {
      const serverCart = await $fetch('/api/cart')
      if (serverCart?.items) {
        store.$patch({ items: serverCart.items, coupon: serverCart.coupon ?? null })
      }
      isServerSynced.value = true
    }
    catch {
      cartToken.value = null
      removeToken(storageKey)
    }
  }

  async function addItem(input: Omit<CartItem, 'quantity'> & { quantity?: number }): Promise<void> {
    store.addItem(input)
    if (!config.apiRoutes) return
    const token = await ensureServerCart()
    if (token) {
      await $fetch('/api/cart/items', { method: 'POST', body: input }).catch(() => {})
    }
  }

  async function removeItem(productId: string): Promise<void> {
    store.removeItem(productId)
    if (!config.apiRoutes || !cartToken.value) return
    await $fetch(`/api/cart/items/${encodeURIComponent(productId)}`, { method: 'DELETE' }).catch(() => {})
  }

  async function updateQuantity(productId: string, quantity: number): Promise<void> {
    store.updateQuantity(productId, quantity)
    if (!config.apiRoutes || !cartToken.value) return
    await $fetch(`/api/cart/items/${encodeURIComponent(productId)}`, {
      method: 'PATCH',
      body: { quantity },
    }).catch(() => {})
  }

  async function clear(): Promise<void> {
    store.clear()
    if (!config.apiRoutes || !cartToken.value) return
    await $fetch('/api/cart', { method: 'DELETE' }).catch(() => {})
  }

  async function applyCoupon(code: string): Promise<void> {
    await store.applyCoupon(code)
    if (!config.apiRoutes || !cartToken.value) return
    await $fetch('/api/cart/coupon', {
      method: 'POST',
      body: { code },
    }).catch(() => {})
  }

  async function removeCoupon(): Promise<void> {
    store.removeCoupon()
    if (!config.apiRoutes || !cartToken.value) return
    await $fetch('/api/cart/coupon', { method: 'DELETE' }).catch(() => {})
  }

  return {
    items,
    coupon,
    isHydrated,
    totalAmount,
    discountedTotal,
    itemCount,
    isEmpty,
    cartToken,
    isServerSynced,
    addItem,
    removeItem,
    updateQuantity,
    clear,
    persist: store.persist,
    load: store.load,
    applyCoupon,
    removeCoupon,
    onValidateCoupon: store.onValidateCoupon,
    onCheckout: store.onCheckout,
    checkout: store.checkout,
    syncFromServer,
  }
}
