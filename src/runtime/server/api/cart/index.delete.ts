import { createError, defineEventHandler } from 'h3'
import { useRuntimeConfig } from '#imports'
import type { ModuleOptions } from '../../../../types'
import { clearCart } from '../../utils/cart'

export default defineEventHandler(async (event) => {
  const { nuxtCart } = useRuntimeConfig()
  const options = nuxtCart as ModuleOptions
  const token = event.context.cartToken as string

  try {
    await clearCart(options, token)
    return { success: true }
  }
  catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: `Error clearing cart: ${error instanceof Error ? error.message : String(error)}`,
    })
  }
})
