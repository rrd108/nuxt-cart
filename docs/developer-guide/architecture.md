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

The client-only `nuxt-cart` plugin runs when `persist: true` (default):

1. Calls `load()` to restore from localStorage
2. Sets up a deep watcher on `items` and `coupon` for auto-save
3. Registers `beforeunload` and `pagehide` event listeners for safety

When `persist: false`, the plugin exits immediately and does not touch localStorage.

## Module Registration

The `setup()` function in `module.ts`:

1. Merges user options with defaults via `defu`
2. Stores config in `runtimeConfig.public.nuxtCart`
3. Declares `@pinia/nuxt` as a required module dependency (auto-ordered by Nuxt)
4. Registers the client-only runtime plugin
5. Registers the composables directory for auto-imports
6. Registers `NCart*` components only when `@nuxt/ui` is in the modules list

## Component Architecture

Components are auto-imported (not global) when `@nuxt/ui` is present and use `useCart()` internally:

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
- Built on `@nuxt/ui` v4, auto-imported with `N` prefix when `@nuxt/ui` is in modules

### Phase 4 — Server API (Done)

9 REST endpoints backed by `db0` database with token-based cart identification:

```
Client                           Server
  │                                │
  ├── addItem() ──────────────> POST   /api/cart/items
  ├── removeItem() ───────────> DELETE /api/cart/items/:id
  ├── updateQuantity() ───────> PATCH  /api/cart/items/:id
  ├── applyCoupon() ──────────> POST   /api/cart/coupon
  ├── removeCoupon() ─────────> DELETE /api/cart/coupon
  ├── checkout() ─────────────> POST   /api/cart/checkout
  ├── clear() ────────────────> DELETE /api/cart
  │                                │
  │                          ┌─────┴─────┐
  │                          │   db0 DB  │
  │                          │ (SQLite / │
  │                          │  MySQL /  │
  │                          │PostgreSQL)│
  │                          └───────────┘
```

Key implementation details:
- **`cart-token` middleware** generates an httpOnly cookie on `POST /api/cart` and validates it on all subsequent requests
- **`useCartDb` server composable** wraps `db0` connections with typed query helpers for carts, items, and coupons
- **`auto-migrate` plugin** creates tables on first run using a state machine that tracks applied migrations
- **Client-server sync**: mutations are optimistic (local update first) + fire-and-forget to the server. On hydration, server cart is fetched as source of truth.

### Phase 5 — Polish (Done)

Checkout hooks, playground app, ESLint, CI pipeline, and publish tooling:

```
useCart()
  ├── onCheckout(hook)           # Register a checkout handler
  └── checkout()                 # Run all handlers sequentially
       └── returns { redirectUrl?, error? }
```

- **`onCheckout`/`checkout`** — hook-based system where multiple handlers can be registered. Each receives the full `CartState` and returns a redirect URL or error. The first response wins.
- **Playground** — full development app with product listing, cart drawer, and checkout page at `/checkout`
- **CI** — GitHub Actions runs lint → typecheck → test → build on push/PR to main
- **ESLint** — flat config using `@nuxt/eslint/config`
- **Renovate** — auto-merge minor/patch dependencies, weekly schedule
- **Release** — `pnpm release` runs preflight checks, tests, build, changelogen, and npm publish
