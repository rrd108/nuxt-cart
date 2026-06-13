# Configuration

The Nuxt Cart module is designed to work with zero configuration, but provides customization options when needed.

## Zero-Config Approach (Recommended)

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['nuxt-cart'],
  // That's it! The module works out of the box
})
```

Default settings:
| Option | Default | Description |
|--------|---------|-------------|
| `persist` | `true` | Enable localStorage persistence |
| `storageKey` | `'nuxt-cart'` | localStorage key |
| `maxQuantity` | `99` | Maximum quantity per item |
| `currency` | `'USD'` | Currency for display |
| `coupons` | `false` | Enable coupon support |
| `apiRoutes` | `false` | Enable server API routes (Phase 4) |

## Complete Configuration Options

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['nuxt-cart'],

  nuxtCart: {
    // Persistence
    persist: true,
    storageKey: 'my-cart',

    // Limits
    maxQuantity: 50,

    // Display
    currency: 'HUF',

    // Coupons
    // coupons: true,

    // Coming in Phase 4
    // apiRoutes: true,
  },
})
```

## Option Reference

### `persist`

- **Type:** `boolean`
- **Default:** `true`
- **Description:** Enable automatic localStorage persistence. When `true`, the client-only plugin hydrates on mount, auto-saves on every change, and saves on `beforeunload` / `pagehide`. When `false`, the plugin skips all automatic persistence — use `cart.persist()` and `cart.load()` manually if needed.

### `storageKey`

- **Type:** `string`
- **Default:** `'nuxt-cart'`
- **Description:** The localStorage key used to store cart data. Change this if you need multiple independent carts or want to avoid conflicts with other libraries.

### `maxQuantity`

- **Type:** `number`
- **Default:** `99`
- **Description:** Maximum quantity allowed per product. Both `addItem` and `updateQuantity` clamp to this value. Set to a reasonable limit for your use case.

### `currency`

- **Type:** `string`
- **Default:** `'USD'`
- **Description:** Currency identifier. Currently used for display purposes in computed properties. Future phases will use this for server-side pricing.

### `coupons`

- **Type:** `boolean`
- **Default:** `false`
- **Description:** Enable coupon functionality. When enabled, the composable exposes `applyCoupon()`, `removeCoupon()`, `coupon`, and `discountedTotal`. Requires a validation hook registered via `onValidateCoupon`.

### `apiRoutes`

- **Type:** `boolean`
- **Default:** `false`
- **Description:** Enable server API routes for cart operations. When enabled, creates REST endpoints for cart CRUD, token-based authentication, and checkout. Requires a database. (Planned for Phase 4.)

## Environment Variables

Currently, all configuration is set via `nuxt.config.ts`. Future releases may support runtime config via environment variables.

## Next Steps

- [Composables](./composables) — Full `useCart()` API reference
- [Persistence](./persistence) — How hydration and auto-save work
- [Examples](/examples/basic-setup) — Complete implementation patterns
