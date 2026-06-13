import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin({
  name: 'nuxt-cart',
  setup() {
    const config = useRuntimeConfig().public.nuxtCart
    if (!config?.persist) return

    const cart = useCart()
    cart.load()

    if (config.apiRoutes) {
      cart.syncFromServer()
    }

    const saveCart = () => {
      cart.persist()
    }

    window.addEventListener('beforeunload', saveCart)
    window.addEventListener('pagehide', saveCart)

    watch(
      [() => cart.items, () => cart.coupon],
      saveCart,
      { deep: true },
    )
  },
})
