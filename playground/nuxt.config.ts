export default defineNuxtConfig({
  modules: [
    '../src/module',
    '@nuxt/ui',
  ],

  nuxtCart: {
    persist: true,
    coupons: true,
    currency: 'USD',
  },

  devtools: { enabled: true },
})
