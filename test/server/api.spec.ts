import { describe, it, expect, beforeEach } from 'vitest'
import Database from 'better-sqlite3'

interface QueryResult {
  rows: any[]
  columns: string[]
}

function createTestDb() {
  const sqlite = new Database(':memory:')
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS carts (
      id TEXT PRIMARY KEY,
      items TEXT NOT NULL DEFAULT '[]',
      coupon TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      order_reference TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `)
  return sqlite
}

function uniqueToken(): string {
  return `token-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

async function query(db: Database.Database, sql: string, ...params: any[]): Promise<QueryResult> {
  const stmt = db.prepare(sql)
  if (sql.trim().toUpperCase().startsWith('SELECT')) {
    const rows = params.length > 0 ? stmt.all(...params) : stmt.all()
    return { rows, columns: Object.keys(rows[0] || {}) }
  }
  else {
    params.length > 0 ? stmt.run(...params) : stmt.run()
    return { rows: [], columns: [] }
  }
}

async function getCart(db: Database.Database, token: string) {
  const result = await query(db, 'SELECT * FROM carts WHERE id = ?', token)
  if (result.rows.length === 0) return null
  const row = result.rows[0]
  return {
    items: JSON.parse(row.items as string),
    coupon: row.coupon ? JSON.parse(row.coupon as string) : null,
    status: row.status,
    orderReference: row.order_reference,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

async function createCart(db: Database.Database, token: string) {
  const now = new Date().toISOString()
  await query(db, 'INSERT INTO carts (id, items, coupon, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
    token, '[]', null, 'active', now, now)
}

async function addItem(db: Database.Database, token: string, item: any) {
  const cart = await getCart(db, token)
  if (!cart) throw new Error('Cart not found')

  const items = cart.items
  const existing = items.find((i: any) => i.productId === item.productId)
  if (existing) {
    existing.quantity = Math.min(existing.quantity + (item.quantity || 1), 99)
  }
  else {
    items.push({ ...item, quantity: item.quantity ?? 1 })
  }

  const now = new Date().toISOString()
  await query(db, 'UPDATE carts SET items = ?, updated_at = ? WHERE id = ?',
    JSON.stringify(items), now, token)
  return { ...cart, items, updatedAt: now }
}

async function updateQty(db: Database.Database, token: string, productId: string, quantity: number) {
  const cart = await getCart(db, token)
  if (!cart) throw new Error('Cart not found')

  let items = cart.items
  if (quantity <= 0) {
    items = items.filter((i: any) => i.productId !== productId)
  }
  else {
    const item = items.find((i: any) => i.productId === productId)
    if (item) item.quantity = Math.min(quantity, 99)
  }

  const now = new Date().toISOString()
  await query(db, 'UPDATE carts SET items = ?, updated_at = ? WHERE id = ?',
    JSON.stringify(items), now, token)
  return { ...cart, items, updatedAt: now }
}

async function removeItem(db: Database.Database, token: string, productId: string) {
  const cart = await getCart(db, token)
  if (!cart) throw new Error('Cart not found')

  const items = cart.items.filter((i: any) => i.productId !== productId)
  const now = new Date().toISOString()
  await query(db, 'UPDATE carts SET items = ?, updated_at = ? WHERE id = ?',
    JSON.stringify(items), now, token)
  return { ...cart, items, updatedAt: now }
}

async function applyCoupon(db: Database.Database, token: string, coupon: any) {
  const cart = await getCart(db, token)
  if (!cart) throw new Error('Cart not found')

  const now = new Date().toISOString()
  await query(db, 'UPDATE carts SET coupon = ?, updated_at = ? WHERE id = ?',
    JSON.stringify(coupon), now, token)
  return { ...cart, coupon, updatedAt: now }
}

async function removeCoupon(db: Database.Database, token: string) {
  const cart = await getCart(db, token)
  if (!cart) throw new Error('Cart not found')

  const now = new Date().toISOString()
  await query(db, "UPDATE carts SET coupon = NULL, updated_at = ? WHERE id = ?", now, token)
  return { ...cart, coupon: null, updatedAt: now }
}

async function clearCart(db: Database.Database, token: string) {
  const cart = await getCart(db, token)
  if (!cart) throw new Error('Cart not found')

  const now = new Date().toISOString()
  await query(db, "UPDATE carts SET items = '[]', coupon = NULL, updated_at = ? WHERE id = ?", now, token)
  return { ...cart, items: [], coupon: null, updatedAt: now }
}

async function checkoutCart(db: Database.Database, token: string) {
  const cart = await getCart(db, token)
  if (!cart) throw new Error('Cart not found')

  const orderReference = `ORD-${Date.now()}-TEST`
  const now = new Date().toISOString()
  await query(db,
    'UPDATE carts SET status = ?, order_reference = ?, updated_at = ? WHERE id = ?',
    'checked-out', orderReference, now, token)
  return { orderReference }
}

describe('server cart utilities', () => {
  let db: Database.Database

  beforeEach(() => {
    db = createTestDb()
  })

  describe('createCart and getCart', () => {
    it('creates a new cart with empty items', async () => {
      const token = uniqueToken()
      await createCart(db, token)
      const cart = await getCart(db, token)
      expect(cart).not.toBeNull()
      expect(cart.items).toEqual([])
      expect(cart.coupon).toBeNull()
      expect(cart.status).toBe('active')
    })

    it('returns null for non-existent cart', async () => {
      const cart = await getCart(db, 'nonexistent')
      expect(cart).toBeNull()
    })

    it('stores creation and update timestamps', async () => {
      const token = uniqueToken()
      await createCart(db, token)
      const cart = await getCart(db, token)
      expect(cart.createdAt).toBeTruthy()
      expect(cart.updatedAt).toBeTruthy()
    })
  })

  describe('addItem', () => {
    it('adds an item to an existing cart', async () => {
      const token = uniqueToken()
      await createCart(db, token)
      const result = await addItem(db, token, { productId: 'p1', name: 'Product 1', price: 100, quantity: 2 })

      expect(result.items).toHaveLength(1)
      expect(result.items[0]).toMatchObject({
        productId: 'p1',
        name: 'Product 1',
        price: 100,
        quantity: 2,
      })
    })

    it('increments quantity when adding same productId', async () => {
      const token = uniqueToken()
      await createCart(db, token)
      await addItem(db, token, { productId: 'p1', name: 'P1', price: 100, quantity: 2 })
      await addItem(db, token, { productId: 'p1', name: 'P1', price: 100, quantity: 3 })

      const cart = await getCart(db, token)
      expect(cart.items).toHaveLength(1)
      expect(cart.items[0].quantity).toBe(5)
    })

    it('supports multiple distinct items', async () => {
      const token = uniqueToken()
      await createCart(db, token)
      await addItem(db, token, { productId: 'p1', name: 'P1', price: 100, quantity: 2 })
      await addItem(db, token, { productId: 'p2', name: 'P2', price: 50, quantity: 1 })

      const cart = await getCart(db, token)
      expect(cart.items).toHaveLength(2)
    })

    it('stores optional fields (image, metadata)', async () => {
      const token = uniqueToken()
      await createCart(db, token)
      await addItem(db, token, {
        productId: 'p1', name: 'P1', price: 100, quantity: 1,
        image: '/img.jpg', metadata: { color: 'red' },
      })

      const cart = await getCart(db, token)
      expect(cart.items[0].image).toBe('/img.jpg')
      expect(cart.items[0].metadata).toEqual({ color: 'red' })
    })
  })

  describe('updateItemQuantity', () => {
    it('sets exact quantity', async () => {
      const token = uniqueToken()
      await createCart(db, token)
      await addItem(db, token, { productId: 'p1', name: 'P1', price: 100, quantity: 2 })
      await updateQty(db, token, 'p1', 5)

      const cart = await getCart(db, token)
      expect(cart.items[0].quantity).toBe(5)
    })

    it('removes item when quantity is 0', async () => {
      const token = uniqueToken()
      await createCart(db, token)
      await addItem(db, token, { productId: 'p1', name: 'P1', price: 100, quantity: 2 })
      await updateQty(db, token, 'p1', 0)

      const cart = await getCart(db, token)
      expect(cart.items).toHaveLength(0)
    })

    it('removes item when quantity is negative', async () => {
      const token = uniqueToken()
      await createCart(db, token)
      await addItem(db, token, { productId: 'p1', name: 'P1', price: 100, quantity: 2 })
      await updateQty(db, token, 'p1', -1)

      const cart = await getCart(db, token)
      expect(cart.items).toHaveLength(0)
    })
  })

  describe('removeItem', () => {
    it('removes an item by productId', async () => {
      const token = uniqueToken()
      await createCart(db, token)
      await addItem(db, token, { productId: 'p1', name: 'P1', price: 100, quantity: 1 })
      await addItem(db, token, { productId: 'p2', name: 'P2', price: 50, quantity: 1 })
      await removeItem(db, token, 'p1')

      const cart = await getCart(db, token)
      expect(cart.items).toHaveLength(1)
      expect(cart.items[0].productId).toBe('p2')
    })
  })

  describe('coupon', () => {
    it('applies a coupon to the cart', async () => {
      const token = uniqueToken()
      await createCart(db, token)
      await addItem(db, token, { productId: 'p1', name: 'P1', price: 100, quantity: 1 })
      await applyCoupon(db, token, { code: 'SAVE10', discount: 10, type: 'fixed' })

      const cart = await getCart(db, token)
      expect(cart.coupon).toEqual({ code: 'SAVE10', discount: 10, type: 'fixed' })
    })

    it('removes coupon from the cart', async () => {
      const token = uniqueToken()
      await createCart(db, token)
      await applyCoupon(db, token, { code: 'SAVE10', discount: 10, type: 'fixed' })
      await removeCoupon(db, token)

      const cart = await getCart(db, token)
      expect(cart.coupon).toBeNull()
    })
  })

  describe('clearCart', () => {
    it('clears all items and coupon', async () => {
      const token = uniqueToken()
      await createCart(db, token)
      await addItem(db, token, { productId: 'p1', name: 'P1', price: 100, quantity: 1 })
      await addItem(db, token, { productId: 'p2', name: 'P2', price: 50, quantity: 1 })
      await applyCoupon(db, token, { code: 'SAVE10', discount: 10, type: 'fixed' })
      await clearCart(db, token)

      const cart = await getCart(db, token)
      expect(cart.items).toHaveLength(0)
      expect(cart.coupon).toBeNull()
    })
  })

  describe('checkout', () => {
    it('returns an order reference', async () => {
      const token = uniqueToken()
      await createCart(db, token)
      await addItem(db, token, { productId: 'p1', name: 'P1', price: 100, quantity: 1 })
      const result = await checkoutCart(db, token)

      expect(result.orderReference).toBeTruthy()
      expect(result.orderReference).toContain('ORD-')
    })

    it('marks cart as checked-out', async () => {
      const token = uniqueToken()
      await createCart(db, token)
      await addItem(db, token, { productId: 'p1', name: 'P1', price: 100, quantity: 1 })
      await checkoutCart(db, token)

      const cart = await getCart(db, token)
      expect(cart.status).toBe('checked-out')
    })
  })

  describe('migrations', () => {
    it('tracks applied migrations', async () => {
      const m1 = `mig_${Date.now()}_1`
      const m2 = `mig_${Date.now()}_2`
      await query(db, 'INSERT INTO migrations (name) VALUES (?)', m1)
      await query(db, 'INSERT INTO migrations (name) VALUES (?)', m2)

      const result = await query(db, 'SELECT name FROM migrations ORDER BY id')
      expect(result.rows).toHaveLength(2)
      expect(result.rows[0].name).toBe(m1)
      expect(result.rows[1].name).toBe(m2)
    })
  })
})
