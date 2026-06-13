export default defineNuxtConfig({
  modules: [
    '../src/module',
    '@nuxt/ui',
  ],

  devtools: { enabled: true },

  nuxtCart: {
    persist: true,
    apiRoutes: true,
    coupons: true,
    currency: 'USD',
    connector: {
      name: 'sqlite',
      options: { path: './.data/cart.sqlite3' },
    },
  },
})
