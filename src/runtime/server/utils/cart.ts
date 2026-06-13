import { useDb } from './db'
import type { ModuleOptions, CartItem, Coupon } from '../../../types'

export interface CartRecord {
  id: string
  items: string
  coupon: string | null
  status: string
  order_reference: string | null
  created_at: string
  updated_at: string
}

function parseCart(row: CartRecord) {
  return {
    items: JSON.parse(row.items) as CartItem[],
    coupon: row.coupon ? JSON.parse(row.coupon) as Coupon : null,
    status: row.status,
    orderReference: row.order_reference,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function getCart(options: ModuleOptions, token: string) {
  const db = await useDb(options)
  const result = await db.sql`
    SELECT * FROM carts WHERE id = ${token}
  ` as { rows: CartRecord[] }

  if (result.rows.length === 0) return null
  return parseCart(result.rows[0])
}

export async function createCart(options: ModuleOptions, token: string) {
  const db = await useDb(options)
  const now = new Date().toISOString()
  await db.sql`
    INSERT INTO carts (id, items, coupon, status, created_at, updated_at)
    VALUES (${token}, ${'[]'}, ${null}, ${'active'}, ${now}, ${now})
  `
  return { items: [], coupon: null, status: 'active', createdAt: now, updatedAt: now }
}

export async function addItemToCart(options: ModuleOptions, token: string, item: CartItem) {
  const db = await useDb(options)
  const cart = await getCart(options, token)
  if (!cart) throw new Error('Cart not found')

  const items = cart.items
  const existing = items.find(i => i.productId === item.productId)
  if (existing) {
    existing.quantity = Math.min(existing.quantity + item.quantity, 99)
  }
  else {
    items.push(item)
  }

  const now = new Date().toISOString()
  await db.sql`
    UPDATE carts SET items = ${JSON.stringify(items)}, updated_at = ${now} WHERE id = ${token}
  `
  return { ...cart, items, updatedAt: now }
}

export async function updateItemQuantity(options: ModuleOptions, token: string, productId: string, quantity: number) {
  const db = await useDb(options)
  const cart = await getCart(options, token)
  if (!cart) throw new Error('Cart not found')

  let items = cart.items
  if (quantity <= 0) {
    items = items.filter(i => i.productId !== productId)
  }
  else {
    const item = items.find(i => i.productId === productId)
    if (item) {
      item.quantity = Math.min(quantity, 99)
    }
  }

  const now = new Date().toISOString()
  await db.sql`
    UPDATE carts SET items = ${JSON.stringify(items)}, updated_at = ${now} WHERE id = ${token}
  `
  return { ...cart, items, updatedAt: now }
}

export async function removeItemFromCart(options: ModuleOptions, token: string, productId: string) {
  const db = await useDb(options)
  const cart = await getCart(options, token)
  if (!cart) throw new Error('Cart not found')

  const items = cart.items.filter(i => i.productId !== productId)
  const now = new Date().toISOString()
  await db.sql`
    UPDATE carts SET items = ${JSON.stringify(items)}, updated_at = ${now} WHERE id = ${token}
  `
  return { ...cart, items, updatedAt: now }
}

export async function applyCouponToCart(options: ModuleOptions, token: string, coupon: Coupon) {
  const db = await useDb(options)
  const cart = await getCart(options, token)
  if (!cart) throw new Error('Cart not found')

  const now = new Date().toISOString()
  await db.sql`
    UPDATE carts SET coupon = ${JSON.stringify(coupon)}, updated_at = ${now} WHERE id = ${token}
  `
  return { ...cart, coupon, updatedAt: now }
}

export async function removeCouponFromCart(options: ModuleOptions, token: string) {
  const db = await useDb(options)
  const cart = await getCart(options, token)
  if (!cart) throw new Error('Cart not found')

  const now = new Date().toISOString()
  await db.sql`
    UPDATE carts SET coupon = ${null}, updated_at = ${now} WHERE id = ${token}
  `
  return { ...cart, coupon: null, updatedAt: now }
}

export async function clearCart(options: ModuleOptions, token: string) {
  const db = await useDb(options)
  const cart = await getCart(options, token)
  if (!cart) throw new Error('Cart not found')

  const now = new Date().toISOString()
  await db.sql`
    UPDATE carts SET items = ${'[]'}, coupon = ${null}, updated_at = ${now} WHERE id = ${token}
  `
  return { ...cart, items: [], coupon: null, updatedAt: now }
}

export async function checkoutCart(options: ModuleOptions, token: string) {
  const db = await useDb(options)
  const cart = await getCart(options, token)
  if (!cart) throw new Error('Cart not found')

  const orderReference = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
  const now = new Date().toISOString()
  await db.sql`
    UPDATE carts SET status = ${'checked-out'}, order_reference = ${orderReference}, updated_at = ${now} WHERE id = ${token}
  `
  return { orderReference, cart: { ...cart, status: 'checked-out', orderReference, updatedAt: now } }
}
