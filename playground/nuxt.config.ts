export default defineNuxtConfig({
  modules: [
    '../src/module',
    '@nuxt/ui',
  ],

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

  devtools: { enabled: true },
})
