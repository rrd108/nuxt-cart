import { defineEventHandler, getCookie, createError } from 'h3'

export default defineEventHandler(async (event) => {
  if (!event.path.startsWith('/api/cart')) return

  const token = getCookie(event, 'cart-token')
  if (token) {
    event.context.cartToken = token
  }

  if (event.path === '/api/cart' && event.method === 'POST') return

  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Cart token required' })
  }
})
