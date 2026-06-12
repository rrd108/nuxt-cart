# Testing

Nuxt Cart uses **vitest** for unit testing. Tests are in the `test/` directory.

## Running Tests

```bash
# Run all tests
pnpm test

# Watch mode
pnpm test:watch
```

## Test Structure

```
test/
└── composables/
    └── useCart.spec.ts    # 49 unit tests
```

## Test Categories

### Initial State (1 test)
- Cart starts empty with 0 totals

### addItem (9 tests)
- New item with default quantity 1
- New item with custom quantity
- Increment quantity on duplicate productId
- Increment by given amount on duplicate
- Optional fields (image, metadata)
- MaxQuantity clamping on first add
- MaxQuantity clamping on increment
- Multiple distinct products

### removeItem (3 tests)
- Remove existing item
- Remove non-existent item (no-op)
- Remove all quantity of a product

### updateQuantity (5 tests)
- Set exact quantity
- Clamp to maxQuantity
- Remove when quantity is 0
- Remove when quantity is negative
- Non-existent productId (no-op)

### clear (2 tests)
- Remove all items
- Idempotent on empty cart

### Computed Values (7 tests)
- totalAmount is sum of price × quantity
- itemCount is sum of all quantities
- itemCount is 0 for empty cart
- Reactivity: computed updates after addItem
- Reactivity: computed updates after removeItem
- Reactivity: computed updates after updateQuantity
- Reactivity: computed updates after clear

### Persistence (7 tests)
- persist writes to localStorage
- load reads from localStorage
- Empty localStorage (no-op)
- Corrupt localStorage (graceful handling)
- Non-array items (graceful handling)
- Invalid item filtering on load
- Round-trip: persist → load → correct state

### Coupons (14 tests)
- No coupon initially
- applyCoupon with fixed discount
- applyCoupon with percentage discount
- Invalid coupon (hook returns null) is rejected
- Coupon not applied when `coupons: false`
- Coupon not applied when no hook registered
- removeCoupon clears the coupon
- discountedTotal equals totalAmount without coupon
- discountedTotal updates when items change
- discountedTotal clamped to zero
- clear removes coupon too
- Persist saves coupon
- Load restores coupon
- Invalid coupon shape ignored on load

### Multiple Store Instances (2 tests)
- Shared state (same Pinia instance)
- Isolated state (different Pinia instances)

Total: **49 tests**

## Mocking Approach

Nuxt-specific modules are mocked:

```ts
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
```

Pinia is set up fresh for each test:

```ts
beforeEach(() => {
  setActivePinia(createPinia())
})
```

localStorage is mocked only for persistence tests:

```ts
beforeEach(() => {
  storage = {}
  vi.stubGlobal('localStorage', {
    getItem: (key) => storage[key] ?? null,
    setItem: (key, value) => { storage[key] = value },
    removeItem: (key) => { delete storage[key] },
  })
})
```

## Writing New Tests

Follow the existing patterns:

```ts
describe('feature name', () => {
  it('does something specific', () => {
    const cart = useCart()
    // ... arrange
    // ... act
    // ... assert
  })
})
```

For future phases, add test files:
- `test/server/api.test.ts` (Phase 4)
