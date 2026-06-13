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

The module registers a client-only Nuxt plugin named `nuxt-cart` when `persist: true` (default). It:
- Calls `load()` on client mount to hydrate from localStorage
- Registers deep watchers for auto-save on items and coupon changes
- Attaches `beforeunload` and `pagehide` event listeners

When `persist: false`, the plugin is registered but exits immediately — no automatic hydration or auto-save occurs.

## Module Dependencies

| Module | Required | Description |
|--------|----------|-------------|
| `@pinia/nuxt` | Yes | Auto-registered and ordered before nuxt-cart |
| `@nuxt/ui` | No | Required only for `NCart*` UI components |

## Components

Four ready-to-use Vue components built on `@nuxt/ui` v4. Auto-imported when `@nuxt/ui` is in your modules array. See the [Components guide](/user-guide/components) for full documentation.

| Component | Description |
|-----------|-------------|
| `NCartDrawer` | Slide-out drawer with item list, coupon input, totals, and checkout |
| `NCartItem` | Single line item display with quantity control and remove button |
| `NCartSummary` | Total breakdown (subtotal, discount, grand total) with checkout CTA |
| `NCartQuantity` | Quantity selector with `+` / `-` buttons |

## Module Options

These are set via the `nuxtCart` key in `nuxt.config.ts`. See the [Configuration guide](/user-guide/configuration) for details.

## Server API

When `apiRoutes: true` is configured, the module registers 9 REST endpoints backed by a `db0` database:

| Method | Route | Description | Token Required |
|--------|-------|-------------|:---:|
| `POST` | `/api/cart` | Create new cart, return `{ token }` | No |
| `GET` | `/api/cart` | Fetch cart by token (from cookie) | Yes |
| `DELETE` | `/api/cart` | Clear all items from cart | Yes |
| `POST` | `/api/cart/items` | Add item to cart | Yes |
| `PATCH` | `/api/cart/items/:itemId` | Update quantity | Yes |
| `DELETE` | `/api/cart/items/:itemId` | Remove item | Yes |
| `POST` | `/api/cart/coupon` | Apply coupon `{ code }` | Yes |
| `DELETE` | `/api/cart/coupon` | Remove coupon | Yes |
| `POST` | `/api/cart/checkout` | Freeze cart, return `{ orderReference }` | Yes |

Cart token is stored in an httpOnly cookie by the `cart-token` middleware.

### Database

Uses **db0** (UnJS database abstraction) with three configurable connectors:

| Connector | Package | Default |
|-----------|---------|---------|
| SQLite | `better-sqlite3` | ✅ (default, `./data/cart.sqlite3`) |
| MySQL | `mysql2` | opt-in |
| PostgreSQL | `pg` | opt-in |

Auto-migration creates tables on first run.

- [Public Types](./types) — Full type documentation including database types
- [Composables](/user-guide/composables) — `useCart()` API reference including server sync
- [Components](/user-guide/components) — Cart UI components
