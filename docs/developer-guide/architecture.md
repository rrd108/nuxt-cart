# Architecture

## Data Flow

```
┌──────────────┐      useCart()       ┌────────────────┐
│   Component   │ ──────────────────> │  useCartStore   │
│   (addItem)   │                     │  (Pinia store)  │
└──────────────┘                     └───────┬────────┘
                                            │
                                            ▼
                                     ┌────────────────┐
                                     │   localStorage  │
                                     │  (persist/load) │
                                     └────────────────┘
```

On app mount, the plugin runs `load()` to hydrate the store from localStorage. When mutations occur (`addItem`, `removeItem`, etc.), the deep watcher triggers `persist()` to save.

## SSR Handling

```
Server-side:
  useCart() → items: [] (empty)
              isHydrated: false
              persist/load: no-op (try-catch)

Client-side:
  useCart() → items: [...] (from localStorage on mount)
              isHydrated: true (after load)
              persist/load: writes/reads localStorage
```

## Pinia Store Design

The store follows the **setup store** pattern:

```ts
const useCartStore = defineStore('nuxt-cart', () => {
  // State
  const items = ref<CartItem[]>([])

  // Computed
  const totalAmount = computed(() => ...)

  // Actions
  function addItem(input) { ... }
  function removeItem(productId) { ... }
  // ...
})
```

The `useCart()` composable wraps the store with `storeToRefs` to provide a clean API while maintaining reactivity.

## Composable → Store Bridge

```ts
export function useCart() {
  const store = useCartStore()
  const { items, isHydrated, totalAmount, itemCount, isEmpty } = storeToRefs(store)
  const { addItem, removeItem, updateQuantity, clear, persist, load } = store
  return { items, isHydrated, totalAmount, itemCount, isEmpty, addItem, removeItem, updateQuantity, clear, persist, load }
}
```

## Plugin Integration

The plugin runs once on app initialization:

1. Calls `load()` to restore from localStorage
2. Sets up a deep watcher on `items` for auto-save
3. Registers `beforeunload` and `pagehide` event listeners for safety

## Module Registration

The `setup()` function in `module.ts`:

1. Merges user options with defaults via `defu`
2. Stores config in `runtimeConfig.public.nuxtCart`
3. Registers the runtime plugin
4. Registers the composables directory for auto-imports
5. Registers the components directory (for future NCart* components)

## Component Architecture (Phase 3)

Components are registered globally by the module and use `useCart()` internally:

```
NCartDrawer
  ├── NCartItem (v-for items)
  │     └── NCartQuantity
  ├── Coupon input (if coupons enabled)
  └── NCartSummary
        └── UButton (checkout)
```

Components rely on `@nuxt/ui` v4 and use its semantic CSS classes (`text-default`, `bg-muted`, `border-border`). They are optional — the headless `useCart()` API works without them.

## Phases

### Phase 1 — MVP (Done)
- `useCart()` composable with items CRUD
- Pinia store with localStorage persistence
- SSR-safe hydration

### Phase 2 — Coupons (Done)
```
useCart()
  ├── coupon: Ref<Coupon | null>
  ├── discountedTotal: ComputedRef<number>
  ├── applyCoupon(code): Promise<void>  → calls validateCoupon hook
  └── removeCoupon(): void
```

### Phase 3 — Components (Done)
- `NCartDrawer`, `NCartItem`, `NCartSummary`, `NCartQuantity`
- Built on `@nuxt/ui` v4, global `N` prefix

### Phase 4 — Server API
```
Client                           Server
  │                                │
  ├── addItem() ──────────────> POST /api/cart/items
  ├── removeItem() ───────────> DELETE /api/cart/items/:id
  ├── updateQuantity() ───────> PATCH /api/cart/items/:id
  ├── checkout() ─────────────> POST /api/cart/checkout
  │                                │
  │                          ┌─────┴─────┐
  │                          │  Database  │
  │                          │  (SQLite)  │
  │                          └───────────┘
```
