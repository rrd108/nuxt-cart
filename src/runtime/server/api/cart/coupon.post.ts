import { createError, defineEventHandler, readBody } from 'h3'
import { useRuntimeConfig } from '#imports'
import type { ModuleOptions, Coupon } from '../../../../types'
import { applyCouponToCart } from '../../utils/cart'

export default defineEventHandler(async (event) => {
  const { nuxtCart } = useRuntimeConfig()
  const options = nuxtCart as ModuleOptions
  const token = event.context.cartToken as string
  const body = await readBody<{ code: string }>(event)

  if (!body?.code || typeof body.code !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'Coupon code is required' })
  }

  const coupon: Coupon = {
    code: body.code,
    discount: 0,
    type: 'fixed',
  }

  try {
    const cart = await applyCouponToCart(options, token, coupon)
    return { items: cart.items, coupon: cart.coupon }
  }
  catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: `Error applying coupon: ${error instanceof Error ? error.message : String(error)}`,
    })
  }
})
