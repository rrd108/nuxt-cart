# Persistence

Nuxt Cart provides automatic localStorage persistence out of the box. No database setup needed.

## How It Works

The persistence system has three layers:

### 1. Hydration on Mount

When the app mounts (client-side only), the plugin calls `load()` to read cart data from localStorage:

1. Reads `localStorage.getItem(storageKey)`
2. Parses the JSON string using `destr` (safe parsing)
3. Validates the data structure
4. Filters items through a type guard (`isValidCartItem`)
5. Sets `isHydrated = true` once complete

### 2. Auto-Save on Change

A deep watcher monitors the `items` array and calls `persist()` on every change:

```ts
watch(
  () => cart.items,
  () => cart.persist(),
  { deep: true },
)
```

This ensures the cart is always up to date in localStorage.

### 3. Fallback Saves

As a safety net, the cart also saves on:
- `beforeunload` — when the user navigates away or closes the tab
- `pagehide` — when the page is being unloaded (covers mobile browsers)

## Type-Guard Validation

When loading data from localStorage, each item is validated:

```ts
function isValidCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return (
    typeof item.productId === 'string'
    && typeof item.name === 'string'
    && typeof item.price === 'number'
    && Number.isFinite(item.price)
    && typeof item.quantity === 'number'
    && Number.isInteger(item.quantity)
    && item.quantity > 0
  )
}
```

Invalid items are silently filtered out. If the entire data is corrupt, it is discarded.

## SSR Safety

On the server:
- No localStorage access occurs
- `isHydrated` stays `false`
- The cart starts empty on every SSR render

After client hydration:
- Data is loaded from localStorage
- `isHydrated` becomes `true`
- The UI updates to show the restored cart

## Error Handling

All localStorage operations are wrapped in try-catch:

```ts
function persist(): void {
  try {
    localStorage.setItem(storageKey, JSON.stringify(state))
  } catch {
    // localStorage not available (SSR, test, or privacy mode)
  }
}
```

This makes the module resilient to:
- Private browsing modes that block localStorage
- Tests running in Node.js without a DOM
- Storage quota exceeded errors

## Manual Control

You can call `persist()` and `load()` directly for manual control:

```ts
const cart = useCart()

// Save current state
cart.persist()

// Restore from localStorage
cart.load()
```

## Storage Format

```json
{
  "items": [
    {
      "productId": "p1",
      "name": "Widget",
      "price": 29.99,
      "quantity": 2
    }
  ],
  "coupon": null,
  "updatedAt": "2025-01-15T10:30:00.000Z"
}
```

The `coupon` field stores the active coupon (when applicable). The `updatedAt` timestamp tracks when the cart was last saved.

## Next Steps

- [Configuration](./configuration) — Change the storage key or disable persistence
- [Composables](./composables) — Full `useCart()` API reference
- [Examples](/examples/basic-setup) — Complete implementation patterns
