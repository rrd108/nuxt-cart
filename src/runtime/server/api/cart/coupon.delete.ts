import { createError, defineEventHandler } from 'h3'
import { useRuntimeConfig } from '#imports'
import type { ModuleOptions } from '../../../../types'
import { removeCouponFromCart } from '../../utils/cart'

export default defineEventHandler(async (event) => {
  const { nuxtCart } = useRuntimeConfig()
  const options = nuxtCart as ModuleOptions
  const token = event.context.cartToken as string

  try {
    const cart = await removeCouponFromCart(options, token)
    return { items: cart.items, coupon: cart.coupon }
  }
  catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: `Error removing coupon: ${error instanceof Error ? error.message : String(error)}`,
    })
  }
})
