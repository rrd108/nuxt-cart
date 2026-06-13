import { createError, defineEventHandler, readBody } from 'h3'
import { useRuntimeConfig } from '#imports'
import type { ModuleOptions, CartItem } from '../../../../types'
import { addItemToCart } from '../../utils/cart'

export default defineEventHandler(async (event) => {
  const { nuxtCart } = useRuntimeConfig()
  const options = nuxtCart as ModuleOptions
  const token = event.context.cartToken as string
  const body = await readBody<CartItem>(event)

  if (!body || !body.productId || !body.name || typeof body.price !== 'number') {
    throw createError({ statusCode: 400, statusMessage: 'Invalid item: productId, name, and price are required' })
  }

  try {
    const cart = await addItemToCart(options, token, {
      productId: body.productId,
      name: body.name,
      price: body.price,
      quantity: body.quantity ?? 1,
      image: body.image,
      metadata: body.metadata,
    })
    return { items: cart.items, coupon: cart.coupon }
  }
  catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: `Error adding item: ${error instanceof Error ? error.message : String(error)}`,
    })
  }
})
