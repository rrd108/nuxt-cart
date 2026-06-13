import { createError, defineEventHandler, readBody, getRouterParam } from 'h3'
import { useRuntimeConfig } from '#imports'
import type { ModuleOptions } from '../../../../../types'
import { updateItemQuantity } from '../../../utils/cart'

export default defineEventHandler(async (event) => {
  const { nuxtCart } = useRuntimeConfig()
  const options = nuxtCart as ModuleOptions
  const token = event.context.cartToken as string
  const productId = getRouterParam(event, 'itemId')

  if (!productId) {
    throw createError({ statusCode: 400, statusMessage: 'itemId is required' })
  }

  const body = await readBody<{ quantity: number }>(event)
  if (typeof body?.quantity !== 'number' || !Number.isInteger(body.quantity)) {
    throw createError({ statusCode: 400, statusMessage: 'quantity must be an integer' })
  }

  try {
    const cart = await updateItemQuantity(options, token, productId, body.quantity)
    return { items: cart.items, coupon: cart.coupon }
  }
  catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: `Error updating quantity: ${error instanceof Error ? error.message : String(error)}`,
    })
  }
})
