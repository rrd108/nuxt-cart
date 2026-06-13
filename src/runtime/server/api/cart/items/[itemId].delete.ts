import { createError, defineEventHandler, getRouterParam } from 'h3'
import { useRuntimeConfig } from '#imports'
import type { ModuleOptions } from '../../../../../types'
import { removeItemFromCart } from '../../../utils/cart'

export default defineEventHandler(async (event) => {
  const { nuxtCart } = useRuntimeConfig()
  const options = nuxtCart as ModuleOptions
  const token = event.context.cartToken as string
  const productId = getRouterParam(event, 'itemId')

  if (!productId) {
    throw createError({ statusCode: 400, statusMessage: 'itemId is required' })
  }

  try {
    const cart = await removeItemFromCart(options, token, productId)
    return { items: cart.items, coupon: cart.coupon }
  }
  catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: `Error removing item: ${error instanceof Error ? error.message : String(error)}`,
    })
  }
})
