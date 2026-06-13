import { createError, defineEventHandler } from 'h3'
import { useRuntimeConfig } from '#imports'
import type { ModuleOptions } from '../../../../types'
import { checkoutCart } from '../../utils/cart'

export default defineEventHandler(async (event) => {
  const { nuxtCart } = useRuntimeConfig()
  const options = nuxtCart as ModuleOptions
  const token = event.context.cartToken as string

  try {
    const result = await checkoutCart(options, token)
    return { orderReference: result.orderReference }
  }
  catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: `Error during checkout: ${error instanceof Error ? error.message : String(error)}`,
    })
  }
})
