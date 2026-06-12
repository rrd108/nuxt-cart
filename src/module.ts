import {
  defineNuxtModule,
  createResolver,
  addPlugin,
  addImportsDir,
  addComponentsDir,
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
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    nuxt.options.runtimeConfig.public.nuxtCart = defu(
      nuxt.options.runtimeConfig.public.nuxtCart,
      options,
    )

    addPlugin(resolver.resolve('./runtime/plugin'))

    addImportsDir(resolver.resolve('./runtime/composables'))

    addComponentsDir({
      path: resolver.resolve('./runtime/components'),
      pathPrefix: false,
      prefix: 'N',
      global: true,
    })
  },
})

export type { ModuleOptions, CartItem, CartState, Coupon, CheckoutHook, ValidateCouponHook } from './types'
