import { defineEventHandler, setCookie } from 'h3'
import { useRuntimeConfig } from '#imports'
import type { ModuleOptions } from '../../../../types'
import { createCart } from '../../utils/cart'

export default defineEventHandler(async (event) => {
  const { nuxtCart } = useRuntimeConfig()
  const options = nuxtCart as ModuleOptions

  const token = crypto.randomUUID()
  await createCart(options, token)

  setCookie(event, 'cart-token', token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  })

  return { token }
})
