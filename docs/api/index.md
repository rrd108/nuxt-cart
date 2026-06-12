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
| `Coupon` | Coupon entity type |
| `CheckoutHook` | Checkout handler type |
| `ValidateCouponHook` | Coupon validation handler type |

## Runtime

The module provides one composable (`useCart()`) available through Nuxt auto-imports. See the [Composables guide](/user-guide/composables) for full documentation.

## Plugin

The module registers a Nuxt plugin (`nuxt-cart:plugin`) that:
- Calls `load()` on app mount to hydrate from localStorage
- Registers deep watchers for auto-save on items and coupon changes
- Attaches `beforeunload` and `pagehide` event listeners

## Module Options

These are set via `nuxtCart` key in `nuxt.config.ts`. See the [Configuration guide](/user-guide/configuration) for details.

## Components

Four ready-to-use Vue components built on `@nuxt/ui` v4. See the [Components guide](/user-guide/components) for full documentation.

| Component | Description |
|-----------|-------------|
| `NCartDrawer` | Slide-out drawer with item list, coupon input, totals, and checkout |
| `NCartItem` | Single line item display with quantity control and remove button |
| `NCartSummary` | Total breakdown (subtotal, discount, grand total) with checkout CTA |
| `NCartQuantity` | Quantity selector with `+` / `-` buttons |

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

- [Public Types](./types) — Full type documentation
- [Composables](/user-guide/composables) — `useCart()` API reference
- [Components](/user-guide/components) — Cart UI components
