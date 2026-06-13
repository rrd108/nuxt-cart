import type { ModuleOptions } from './types'

export const defaultOptions: ModuleOptions = {
  persist: true,
  storageKey: 'nuxt-cart',
  apiRoutes: false,
  currency: 'USD',
  coupons: false,
  maxQuantity: 99,
  connector: {
    name: 'sqlite',
    options: {
      path: './data/cart.sqlite3',
    },
  },
}
