const isDemo = process.env.NUXT_CART_DEMO === 'true'

export default defineNuxtConfig({
  modules: [
    '../src/module',
    '@nuxt/ui',
  ],

  nuxtCart: {
    persist: true,
    apiRoutes: !isDemo,
    coupons: true,
    currency: 'USD',
    ...(isDemo
      ? {}
      : {
          connector: {
            name: 'sqlite',
            options: { path: './.data/cart.sqlite3' },
          },
        }),
  },

  devtools: { enabled: !isDemo },

  $production: {
    app: {
      baseURL: '/',
    },
  },
})
