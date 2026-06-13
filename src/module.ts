import {
  defineNuxtModule,
  createResolver,
  addPlugin,
  addImportsDir,
  addComponentsDir,
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

    nuxt.options.runtimeConfig.public.nuxtCart = defu(
      nuxt.options.runtimeConfig.public.nuxtCart,
      options,
    )

    addPlugin({
      src: resolver.resolve('./runtime/plugin'),
      mode: 'client',
    })

    addImportsDir(resolver.resolve('./runtime/composables'))

    if (!hasNuxtModule('@nuxt/ui')) return

    addComponentsDir({
      path: resolver.resolve('./runtime/components'),
      pathPrefix: false,
      prefix: 'N',
    })
  },
})

export type { ModuleOptions, CartItem, CartState, Coupon, CheckoutHook, ValidateCouponHook } from './types'
