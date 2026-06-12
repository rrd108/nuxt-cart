# API Reference

## Module Exports

Nuxt Cart exports the following from the package root:

```ts
import type { ModuleOptions, CartItem, CartState, Coupon, CheckoutHook, ValidateCouponHook } from 'nuxt-cart'
```

| Export | Description |
|--------|-------------|
| `ModuleOptions` | Configuration interface for `nuxt.config.ts` |
| `CartItem` | Cart item entity type |
| `CartState` | Full cart state snapshot |
| `Coupon` | Coupon entity type (Phase 2) |
| `CheckoutHook` | Checkout handler type (Phase 4) |
| `ValidateCouponHook` | Coupon validation handler type (Phase 2) |

## Runtime

The module provides one composable (`useCart()`) available through Nuxt auto-imports. See the [Composables guide](/user-guide/composables) for full documentation.

## Plugin

The module registers a Nuxt plugin (`nuxt-cart:plugin`) that:
- Calls `load()` on app mount to hydrate from localStorage
- Registers deep watchers for auto-save
- Attaches `beforeunload` and `pagehide` event listeners

## Module Options

These are set via `nuxtCart` key in `nuxt.config.ts`. See the [Configuration guide](/user-guide/configuration) for details.

## Server API (Coming in Phase 4)

When `apiRoutes: true` is configured, the module registers:

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/api/cart?token=` | Fetch cart by token |
| `POST` | `/api/cart` | Create new cart |
| `POST` | `/api/cart/items` | Add item to cart |
| `PATCH` | `/api/cart/items/:itemId` | Update quantity |
| `DELETE` | `/api/cart/items/:itemId` | Remove item |
| `POST` | `/api/cart/checkout` | Freeze cart, return order reference |

## Components (Coming in Phase 3)

| Component | Description |
|-----------|-------------|
| `NCartDrawer` | Slide-out drawer with item list and totals |
| `NCartItem` | Single line item display |
| `NCartSummary` | Total breakdown with checkout button |
| `NCartQuantity` | Quantity selector with +/- buttons |

- [Public Types](./types) — Full type documentation
- [Composables](/user-guide/composables) — `useCart()` API reference
