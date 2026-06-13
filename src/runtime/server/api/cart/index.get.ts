import { createError, defineEventHandler } from 'h3'
import { useRuntimeConfig } from '#imports'
import type { ModuleOptions } from '../../../../types'
import { getCart } from '../../utils/cart'

export default defineEventHandler(async (event) => {
  const { nuxtCart } = useRuntimeConfig()
  const options = nuxtCart as ModuleOptions
  const token = event.context.cartToken as string

  try {
    const cart = await getCart(options, token)
    if (!cart) {
      throw createError({ statusCode: 404, statusMessage: 'Cart not found' })
    }
    return {
      items: cart.items,
      coupon: cart.coupon,
    }
  }
  catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: `Error fetching cart: ${error instanceof Error ? error.message : String(error)}`,
    })
  }
})
