import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useRuntimeConfig } from '#app'

import { useCart } from '../../src/runtime/composables/useCart'

vi.mock('#app', () => ({
  useRuntimeConfig: vi.fn(() => ({
    public: {
      nuxtCart: {
        persist: false,
        storageKey: 'nuxt-cart-test',
        maxQuantity: 10,
        coupons: false,
        apiRoutes: false,
        currency: 'USD',
      },
    },
  })),
}))

describe('useCart', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('initial state', () => {
    it('starts with an empty cart', () => {
      const cart = useCart()
      expect(cart.items.value).toEqual([])
      expect(cart.totalAmount.value).toBe(0)
      expect(cart.itemCount.value).toBe(0)
      expect(cart.isEmpty.value).toBe(true)
      expect(cart.isHydrated.value).toBe(false)
    })
  })

  describe('addItem', () => {
    it('adds a new item with default quantity 1', () => {
      const cart = useCart()
      cart.addItem({ productId: 'p1', name: 'Product 1', price: 100 })

      expect(cart.items.value).toHaveLength(1)
      expect(cart.items.value[0]).toMatchObject({
        productId: 'p1',
        name: 'Product 1',
        price: 100,
        quantity: 1,
      })
      expect(cart.isEmpty.value).toBe(false)
    })

    it('adds a new item with custom quantity', () => {
      const cart = useCart()
      cart.addItem({ productId: 'p1', name: 'Product 1', price: 100, quantity: 3 })

      expect(cart.items.value[0].quantity).toBe(3)
    })

    it('increments quantity when adding existing productId', () => {
      const cart = useCart()
      cart.addItem({ productId: 'p1', name: 'Product 1', price: 100 })
      cart.addItem({ productId: 'p1', name: 'Product 1', price: 100 })

      expect(cart.items.value).toHaveLength(1)
      expect(cart.items.value[0].quantity).toBe(2)
    })

    it('adds the given amount when adding existing productId with quantity', () => {
      const cart = useCart()
      cart.addItem({ productId: 'p1', name: 'Product 1', price: 100 })
      cart.addItem({ productId: 'p1', name: 'Product 1', price: 100, quantity: 3 })

      expect(cart.items.value[0].quantity).toBe(4)
    })

    it('stores optional image and metadata', () => {
      const cart = useCart()
      cart.addItem({
        productId: 'p1',
        name: 'Product 1',
        price: 100,
        image: '/img.jpg',
        metadata: { color: 'red' },
      })

      expect(cart.items.value[0].image).toBe('/img.jpg')
      expect(cart.items.value[0].metadata).toEqual({ color: 'red' })
    })

    it('clamps quantity to maxQuantity on first add', () => {
      const cart = useCart()
      cart.addItem({ productId: 'p1', name: 'Product 1', price: 100, quantity: 20 })

      expect(cart.items.value[0].quantity).toBe(10)
    })

    it('clamps quantity to maxQuantity on increment', () => {
      const cart = useCart()
      cart.addItem({ productId: 'p1', name: 'Product 1', price: 100, quantity: 8 })
      cart.addItem({ productId: 'p1', name: 'Product 1', price: 100, quantity: 8 })

      expect(cart.items.value[0].quantity).toBe(10)
    })

    it('supports multiple distinct products', () => {
      const cart = useCart()
      cart.addItem({ productId: 'p1', name: 'Product 1', price: 100 })
      cart.addItem({ productId: 'p2', name: 'Product 2', price: 50 })
      cart.addItem({ productId: 'p3', name: 'Product 3', price: 25, quantity: 2 })

      expect(cart.items.value).toHaveLength(3)
    })
  })

  describe('removeItem', () => {
    it('removes an item by productId', () => {
      const cart = useCart()
      cart.addItem({ productId: 'p1', name: 'Product 1', price: 100 })
      cart.addItem({ productId: 'p2', name: 'Product 2', price: 50 })
      cart.removeItem('p1')

      expect(cart.items.value).toHaveLength(1)
      expect(cart.items.value[0].productId).toBe('p2')
    })

    it('does nothing when removing non-existent productId', () => {
      const cart = useCart()
      cart.addItem({ productId: 'p1', name: 'Product 1', price: 100 })
      cart.removeItem('nonexistent')

      expect(cart.items.value).toHaveLength(1)
    })

    it('removes all quantity of a product', () => {
      const cart = useCart()
      cart.addItem({ productId: 'p1', name: 'Product 1', price: 100, quantity: 5 })
      cart.removeItem('p1')

      expect(cart.items.value).toHaveLength(0)
    })
  })

  describe('updateQuantity', () => {
    it('sets exact quantity', () => {
      const cart = useCart()
      cart.addItem({ productId: 'p1', name: 'Product 1', price: 100 })
      cart.updateQuantity('p1', 5)

      expect(cart.items.value[0].quantity).toBe(5)
    })

    it('clamps to maxQuantity', () => {
      const cart = useCart()
      cart.addItem({ productId: 'p1', name: 'Product 1', price: 100 })
      cart.updateQuantity('p1', 50)

      expect(cart.items.value[0].quantity).toBe(10)
    })

    it('removes item when quantity is 0', () => {
      const cart = useCart()
      cart.addItem({ productId: 'p1', name: 'Product 1', price: 100 })
      cart.updateQuantity('p1', 0)

      expect(cart.items.value).toHaveLength(0)
    })

    it('removes item when quantity is negative', () => {
      const cart = useCart()
      cart.addItem({ productId: 'p1', name: 'Product 1', price: 100 })
      cart.updateQuantity('p1', -1)

      expect(cart.items.value).toHaveLength(0)
    })

    it('does nothing for non-existent productId', () => {
      const cart = useCart()
      cart.addItem({ productId: 'p1', name: 'Product 1', price: 100 })
      cart.updateQuantity('nonexistent', 5)

      expect(cart.items.value[0].quantity).toBe(1)
    })
  })

  describe('clear', () => {
    it('removes all items', () => {
      const cart = useCart()
      cart.addItem({ productId: 'p1', name: 'Product 1', price: 100 })
      cart.addItem({ productId: 'p2', name: 'Product 2', price: 50 })
      cart.addItem({ productId: 'p3', name: 'Product 3', price: 25 }, 2)
      cart.clear()

      expect(cart.items.value).toHaveLength(0)
      expect(cart.isEmpty.value).toBe(true)
      expect(cart.totalAmount.value).toBe(0)
      expect(cart.itemCount.value).toBe(0)
    })

    it('is idempotent on empty cart', () => {
      const cart = useCart()
      cart.clear()
      expect(cart.items.value).toHaveLength(0)
    })
  })

  describe('computed values', () => {
    it('totalAmount is sum of price * quantity', () => {
      const cart = useCart()
      cart.addItem({ productId: 'p1', name: 'P1', price: 100, quantity: 2 })
      cart.addItem({ productId: 'p2', name: 'P2', price: 50, quantity: 3 })

      expect(cart.totalAmount.value).toBe(350)
    })

    it('itemCount is sum of all quantities', () => {
      const cart = useCart()
      cart.addItem({ productId: 'p1', name: 'P1', price: 100, quantity: 2 })
      cart.addItem({ productId: 'p2', name: 'P2', price: 50, quantity: 3 })
      cart.addItem({ productId: 'p3', name: 'P3', price: 25 })

      expect(cart.itemCount.value).toBe(6)
    })

    it('itemCount is 0 when cart is empty', () => {
      const cart = useCart()
      expect(cart.itemCount.value).toBe(0)
    })

    it('computed values react to addItem', () => {
      const cart = useCart()
      cart.addItem({ productId: 'p1', name: 'P1', price: 100, quantity: 2 })

      expect(cart.totalAmount.value).toBe(200)
      expect(cart.itemCount.value).toBe(2)
      expect(cart.isEmpty.value).toBe(false)

      cart.addItem({ productId: 'p2', name: 'P2', price: 50 })

      expect(cart.totalAmount.value).toBe(250)
      expect(cart.itemCount.value).toBe(3)
    })

    it('computed values react to removeItem', () => {
      const cart = useCart()
      cart.addItem({ productId: 'p1', name: 'P1', price: 100, quantity: 2 })
      cart.addItem({ productId: 'p2', name: 'P2', price: 50, quantity: 3 })
      cart.removeItem('p1')

      expect(cart.totalAmount.value).toBe(150)
      expect(cart.itemCount.value).toBe(3)
    })

    it('computed values react to updateQuantity', () => {
      const cart = useCart()
      cart.addItem({ productId: 'p1', name: 'P1', price: 100, quantity: 2 })
      cart.updateQuantity('p1', 5)

      expect(cart.totalAmount.value).toBe(500)
    })

    it('computed values react to clear', () => {
      const cart = useCart()
      cart.addItem({ productId: 'p1', name: 'P1', price: 100, quantity: 2 })
      cart.clear()

      expect(cart.totalAmount.value).toBe(0)
      expect(cart.itemCount.value).toBe(0)
      expect(cart.isEmpty.value).toBe(true)
    })
  })

  describe('persistence (persist / load)', () => {
    let storage: Record<string, string>

    beforeEach(() => {
      storage = {}
      vi.stubGlobal('localStorage', {
        getItem: (key: string) => storage[key] ?? null,
        setItem: (key: string, value: string) => { storage[key] = value },
        removeItem: (key: string) => { Reflect.deleteProperty(storage, key) },
      })
    })

    afterEach(() => {
      vi.unstubAllGlobals()
    })

    it('persists items to localStorage', () => {
      const cart = useCart()
      cart.addItem({ productId: 'p1', name: 'P1', price: 100, quantity: 2 })
      cart.persist()

      const saved = JSON.parse(storage['nuxt-cart-test'])
      expect(saved.items).toHaveLength(1)
      expect(saved.items[0].productId).toBe('p1')
      expect(saved.items[0].quantity).toBe(2)
    })

    it('loads items from localStorage', () => {
      storage['nuxt-cart-test'] = JSON.stringify({
        items: [
          { productId: 'p1', name: 'P1', price: 100, quantity: 2 },
          { productId: 'p2', name: 'P2', price: 50, quantity: 1 },
        ],
      })

      const cart = useCart()
      cart.load()

      expect(cart.items.value).toHaveLength(2)
      expect(cart.totalAmount.value).toBe(250)
      expect(cart.itemCount.value).toBe(3)
      expect(cart.isHydrated.value).toBe(true)
    })

    it('handles empty localStorage gracefully', () => {
      const cart = useCart()
      cart.load()
      expect(cart.items.value).toHaveLength(0)
      expect(cart.isHydrated.value).toBe(false)
    })

    it('handles corrupt localStorage gracefully', () => {
      storage['nuxt-cart-test'] = 'not-valid-json{{{'

      const cart = useCart()
      cart.load()
      expect(cart.items.value).toHaveLength(0)
    })

    it('handles non-array items in saved data', () => {
      storage['nuxt-cart-test'] = JSON.stringify({ items: 'not-an-array' })

      const cart = useCart()
      cart.load()
      expect(cart.items.value).toHaveLength(0)
    })

    it('filters out invalid items on load', () => {
      storage['nuxt-cart-test'] = JSON.stringify({
        items: [
          { productId: 'p1', name: 'P1', price: 100, quantity: 2 },
          { productId: 'p2', name: 'P2', price: 'not-a-number', quantity: 1 },
          { productId: 'p3', name: 'P3', price: 50, quantity: 0 },
          { productId: 'p4', name: 'P4', price: 50, quantity: -1 },
        ],
      })

      const cart = useCart()
      cart.load()

      expect(cart.items.value).toHaveLength(1)
      expect(cart.items.value[0].productId).toBe('p1')
    })

    it('persists and loads back correctly (round trip)', () => {
      const cart = useCart()
      cart.addItem({ productId: 'p1', name: 'P1', price: 100, quantity: 2 })
      cart.addItem({ productId: 'p2', name: 'P2', price: 50, quantity: 3 })
      cart.persist()

      const cart2 = useCart()
      cart2.load()

      expect(cart2.items.value).toHaveLength(2)
      expect(cart2.totalAmount.value).toBe(350)
      expect(cart2.itemCount.value).toBe(5)
    })
  })

  describe('coupons', () => {
    beforeEach(() => {
      vi.mocked(useRuntimeConfig).mockReturnValue({
        public: {
          nuxtCart: {
            persist: false,
            storageKey: 'nuxt-cart-test',
            maxQuantity: 10,
            coupons: true,
            apiRoutes: false,
            currency: 'USD',
          },
        },
      })
    })

    afterEach(() => {
      vi.mocked(useRuntimeConfig).mockReturnValue({
        public: {
          nuxtCart: {
            persist: false,
            storageKey: 'nuxt-cart-test',
            maxQuantity: 10,
            coupons: false,
            apiRoutes: false,
            currency: 'USD',
          },
        },
      })
    })

    it('starts with no coupon', () => {
      const cart = useCart()
      expect(cart.coupon.value).toBeNull()
      expect(cart.discountedTotal.value).toBe(cart.totalAmount.value)
    })

    it('applyCoupon stores coupon with fixed discount', async () => {
      const cart = useCart()
      cart.onValidateCoupon(async () => ({
        code: 'SAVE10',
        discount: 10,
        type: 'fixed' as const,
      }))
      cart.addItem({ productId: 'p1', name: 'P1', price: 100 })

      await cart.applyCoupon('SAVE10')

      expect(cart.coupon.value).toEqual({
        code: 'SAVE10',
        discount: 10,
        type: 'fixed',
      })
      expect(cart.discountedTotal.value).toBe(90)
    })

    it('applyCoupon stores coupon with percentage discount', async () => {
      const cart = useCart()
      cart.onValidateCoupon(async () => ({
        code: 'PCT20',
        discount: 20,
        type: 'percentage' as const,
      }))
      cart.addItem({ productId: 'p1', name: 'P1', price: 200 })

      await cart.applyCoupon('PCT20')

      expect(cart.coupon.value).toEqual({
        code: 'PCT20',
        discount: 20,
        type: 'percentage',
      })
      expect(cart.discountedTotal.value).toBe(160)
    })

    it('rejects coupon when validateCoupon hook returns null', async () => {
      const cart = useCart()
      cart.onValidateCoupon(async () => null)
      cart.addItem({ productId: 'p1', name: 'P1', price: 100 })

      await cart.applyCoupon('INVALID')

      expect(cart.coupon.value).toBeNull()
    })

    it('does nothing when coupons config is disabled', async () => {
      vi.mocked(useRuntimeConfig).mockReturnValue({
        public: {
          nuxtCart: {
            persist: false,
            storageKey: 'nuxt-cart-test',
            maxQuantity: 10,
            coupons: false,
            apiRoutes: false,
            currency: 'USD',
          },
        },
      })
      const cart = useCart()
      cart.onValidateCoupon(async () => ({
        code: 'SAVE10',
        discount: 10,
        type: 'fixed' as const,
      }))

      await cart.applyCoupon('SAVE10')

      expect(cart.coupon.value).toBeNull()
    })

    it('does nothing when no validateCoupon hook is registered', async () => {
      const cart = useCart()

      await cart.applyCoupon('SAVE10')

      expect(cart.coupon.value).toBeNull()
    })

    it('removeCoupon clears the coupon', async () => {
      const cart = useCart()
      cart.onValidateCoupon(async () => ({
        code: 'SAVE10',
        discount: 10,
        type: 'fixed' as const,
      }))
      cart.addItem({ productId: 'p1', name: 'P1', price: 100 })
      await cart.applyCoupon('SAVE10')
      expect(cart.coupon.value).not.toBeNull()

      cart.removeCoupon()

      expect(cart.coupon.value).toBeNull()
      expect(cart.discountedTotal.value).toBe(100)
    })

    it('discountedTotal equals totalAmount when no coupon', () => {
      const cart = useCart()
      cart.addItem({ productId: 'p1', name: 'P1', price: 100, quantity: 3 })
      expect(cart.discountedTotal.value).toBe(cart.totalAmount.value)
    })

    it('discountedTotal updates when items change', async () => {
      const cart = useCart()
      cart.onValidateCoupon(async () => ({
        code: 'PCT10',
        discount: 10,
        type: 'percentage' as const,
      }))
      cart.addItem({ productId: 'p1', name: 'P1', price: 100 })
      await cart.applyCoupon('PCT10')
      expect(cart.discountedTotal.value).toBe(90)

      cart.addItem({ productId: 'p2', name: 'P2', price: 100 })
      expect(cart.discountedTotal.value).toBe(180)
    })

    it('discountedTotal does not go below zero', async () => {
      const cart = useCart()
      cart.onValidateCoupon(async () => ({
        code: 'BIG',
        discount: 500,
        type: 'fixed' as const,
      }))
      cart.addItem({ productId: 'p1', name: 'P1', price: 100 })
      await cart.applyCoupon('BIG')

      expect(cart.discountedTotal.value).toBe(0)
    })

    it('clear removes coupon too', async () => {
      const cart = useCart()
      cart.onValidateCoupon(async () => ({
        code: 'SAVE10',
        discount: 10,
        type: 'fixed' as const,
      }))
      cart.addItem({ productId: 'p1', name: 'P1', price: 100 })
      await cart.applyCoupon('SAVE10')

      cart.clear()

      expect(cart.coupon.value).toBeNull()
      expect(cart.items.value).toHaveLength(0)
    })

    it('persists coupon to localStorage', async () => {
      const storage: Record<string, string> = {}
      vi.stubGlobal('localStorage', {
        getItem: (key: string) => storage[key] ?? null,
        setItem: (key: string, value: string) => { storage[key] = value },
        removeItem: (key: string) => { Reflect.deleteProperty(storage, key) },
      })

      const cart = useCart()
      cart.onValidateCoupon(async () => ({
        code: 'SAVE10',
        discount: 10,
        type: 'fixed' as const,
      }))
      cart.addItem({ productId: 'p1', name: 'P1', price: 100 })
      await cart.applyCoupon('SAVE10')
      cart.persist()

      const saved = JSON.parse(storage['nuxt-cart-test'])
      expect(saved.coupon).toEqual({
        code: 'SAVE10',
        discount: 10,
        type: 'fixed',
      })

      vi.unstubAllGlobals()
    })

    it('loads coupon from localStorage', () => {
      const storage: Record<string, string> = {}
      vi.stubGlobal('localStorage', {
        getItem: (key: string) => storage[key] ?? null,
        setItem: (key: string, value: string) => { storage[key] = value },
        removeItem: (key: string) => { Reflect.deleteProperty(storage, key) },
      })

      storage['nuxt-cart-test'] = JSON.stringify({
        items: [{ productId: 'p1', name: 'P1', price: 100, quantity: 1 }],
        coupon: { code: 'SAVE10', discount: 10, type: 'fixed' },
      })

      const cart = useCart()
      cart.load()

      expect(cart.coupon.value).toEqual({
        code: 'SAVE10',
        discount: 10,
        type: 'fixed',
      })
      expect(cart.discountedTotal.value).toBe(90)

      vi.unstubAllGlobals()
    })

    it('ignores invalid coupon shape on load', () => {
      const storage: Record<string, string> = {}
      vi.stubGlobal('localStorage', {
        getItem: (key: string) => storage[key] ?? null,
        setItem: (key: string, value: string) => { storage[key] = value },
        removeItem: (key: string) => { Reflect.deleteProperty(storage, key) },
      })

      storage['nuxt-cart-test'] = JSON.stringify({
        items: [{ productId: 'p1', name: 'P1', price: 100, quantity: 1 }],
        coupon: { code: 123, discount: 'bad', type: 'invalid' },
      })

      const cart = useCart()
      cart.load()

      expect(cart.coupon.value).toBeNull()

      vi.unstubAllGlobals()
    })
  })

  describe('multiple store instances', () => {
    it('shares state between useCart calls (same Pinia instance)', () => {
      const cart1 = useCart()
      const cart2 = useCart()

      cart1.addItem({ productId: 'p1', name: 'P1', price: 100 })
      expect(cart2.items.value).toHaveLength(1)

      cart2.addItem({ productId: 'p2', name: 'P2', price: 50 })
      expect(cart1.items.value).toHaveLength(2)
    })

    it('isolates state across different Pinia instances', () => {
      const pinia1 = createPinia()
      const pinia2 = createPinia()

      setActivePinia(pinia1)
      const cart1 = useCart()

      setActivePinia(pinia2)
      const cart2 = useCart()

      cart1.addItem({ productId: 'p1', name: 'P1', price: 100 })
      expect(cart1.items.value).toHaveLength(1)
      expect(cart2.items.value).toHaveLength(0)
    })
  })
})
