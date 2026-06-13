import {
  defineNuxtModule,
  createResolver,
  addPlugin,
  addImportsDir,
  addComponentsDir,
  addServerHandler,
  addServerPlugin,
  hasNuxtModule,
} from '@nuxt/kit'
import { defu } from 'defu'
import type { ModuleOptions } from './types'
import { defaultOptions } from './default-options'

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-cart',
    configKey: 'nuxtCart',
    compatibility: { nuxt: '>=4.0.0' },
  },
  defaults: defaultOptions,
  moduleDependencies: {
    '@pinia/nuxt': {
      version: '>=0.11.0',
    },
    '@nuxt/ui': {
      version: '>=4.0.0',
      optional: true,
    },
  },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    const { connector: _defaultConnector, ...defaultsWithoutConnector } = defaultOptions
    const runtimeConfigOptions = defu(nuxt.options.runtimeConfig.nuxtCart || {}, options, defaultsWithoutConnector) as ModuleOptions
    const configuredConnector = (nuxt.options.runtimeConfig.nuxtCart as unknown as ModuleOptions)?.connector || options.connector
    runtimeConfigOptions.connector = configuredConnector || defaultOptions.connector

    nuxt.options.runtimeConfig.public.nuxtCart = {
      persist: runtimeConfigOptions.persist ?? true,
      storageKey: runtimeConfigOptions.storageKey ?? 'nuxt-cart',
      apiRoutes: runtimeConfigOptions.apiRoutes ?? false,
      currency: runtimeConfigOptions.currency ?? 'USD',
      coupons: runtimeConfigOptions.coupons ?? false,
      maxQuantity: runtimeConfigOptions.maxQuantity ?? 99,
    }

    nuxt.options.runtimeConfig.nuxtCart = {
      ...runtimeConfigOptions,
    } as unknown as typeof nuxt.options.runtimeConfig.nuxtCart

    addPlugin({
      src: resolver.resolve('./runtime/plugin'),
      mode: 'client',
    })

    addImportsDir(resolver.resolve('./runtime/composables'))

    if (hasNuxtModule('@nuxt/ui')) {
      addComponentsDir({
        path: resolver.resolve('./runtime/components'),
        pathPrefix: false,
        prefix: 'N',
      })
    }

    if (runtimeConfigOptions.apiRoutes) {
      const serverDir = resolver.resolve('./runtime/server')

      addServerHandler({ route: '/api/cart', method: 'get', handler: `${serverDir}/api/cart/index.get` })
      addServerHandler({ route: '/api/cart', method: 'post', handler: `${serverDir}/api/cart/index.post` })
      addServerHandler({ route: '/api/cart', method: 'delete', handler: `${serverDir}/api/cart/index.delete` })
      addServerHandler({ route: '/api/cart/items', method: 'post', handler: `${serverDir}/api/cart/items.post` })
      addServerHandler({ route: '/api/cart/items/:itemId', method: 'patch', handler: `${serverDir}/api/cart/items/[itemId].patch` })
      addServerHandler({ route: '/api/cart/items/:itemId', method: 'delete', handler: `${serverDir}/api/cart/items/[itemId].delete` })
      addServerHandler({ route: '/api/cart/coupon', method: 'post', handler: `${serverDir}/api/cart/coupon.post` })
      addServerHandler({ route: '/api/cart/coupon', method: 'delete', handler: `${serverDir}/api/cart/coupon.delete` })
      addServerHandler({ route: '/api/cart/checkout', method: 'post', handler: `${serverDir}/api/cart/checkout.post` })
      addServerHandler({ middleware: true, handler: `${serverDir}/middleware/cart-token` })
      addServerPlugin(resolver.resolve('./runtime/server/plugins/auto-migrate'))

      nuxt.hook('nitro:config', (nitroConfig) => {
        nitroConfig.experimental = nitroConfig.experimental || {}
        nitroConfig.experimental.database = true

        nitroConfig.prerender = nitroConfig.prerender || {}
        nitroConfig.prerender.ignore = nitroConfig.prerender.ignore || []
        if (!nitroConfig.prerender.ignore.includes('/api/cart/**')) {
          nitroConfig.prerender.ignore.push('/api/cart/**')
        }
      })
    }
  },
})

export type { ModuleOptions, CartItem, CartState, Coupon, CheckoutHook, ValidateCouponHook } from './types'
export type { DatabaseType, DatabaseConfig } from './types'
