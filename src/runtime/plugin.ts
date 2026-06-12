import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin(() => {
  const cart = useCart()

  cart.load()

  const saveCart = () => {
    cart.persist()
  }

  const isClient = typeof window !== 'undefined'

  if (isClient) {
    window.addEventListener('beforeunload', saveCart)
    window.addEventListener('pagehide', saveCart)
  }

  watch(
    [() => cart.items, () => cart.coupon],
    saveCart,
    { deep: true },
  )
})
