# Public Types

The Nuxt Cart module exports TypeScript types for type safety and better development experience.

## Import Types

```ts
import type { ModuleOptions, CartItem, CartState, Coupon, CheckoutHook, ValidateCouponHook } from 'nuxt-cart'
```

## Core Types

### CartItem

Represents a single item in the cart:

```ts
interface CartItem {
  productId: string
  name: string
  price: number
  quantity: number
  image?: string
  metadata?: Record<string, unknown>
}
```

| Field | Type | Description |
|-------|------|-------------|
| `productId` | `string` | Unique product identifier. Used for merging when adding duplicates. |
| `name` | `string` | Display name for the item. |
| `price` | `number` | Unit price of the item. |
| `quantity` | `number` | Quantity of this item in the cart. Must be a positive integer. |
| `image` | `string?` | Optional image URL for display. |
| `metadata` | `Record<string, unknown>?` | Optional custom data (e.g., group, color, size). |

### CartState

Represents a snapshot of the entire cart:

```ts
interface CartState {
  items: CartItem[]
  coupon: Coupon | null
  createdAt?: string
  updatedAt?: string
}
```

| Field | Type | Description |
|-------|------|-------------|
| `items` | `CartItem[]` | All items in the cart. |
| `coupon` | `Coupon | null` | Currently applied coupon. |
| `createdAt` | `string?` | ISO datetime when the cart was created. |
| `updatedAt` | `string?` | ISO datetime when the cart was last modified. |

### Coupon

Represents a discount coupon (Phase 2):

```ts
interface Coupon {
  code: string
  discount: number
  type: 'fixed' | 'percentage'
}
```

| Field | Type | Description |
|-------|------|-------------|
| `code` | `string` | Coupon code (e.g., "SUMMER20"). |
| `discount` | `number` | Discount amount (in currency units or percentage points). |
| `type` | `'fixed' | 'percentage'` | Whether the discount is a fixed amount or percentage. |

## Configuration Types

### DatabaseConfig

Database connector configuration for db0:

```ts
interface DatabaseConfig {
  name: DatabaseType
  options?: {
    path?: string       // SQLite only
    host?: string       // MySQL / PostgreSQL
    port?: number       // MySQL / PostgreSQL
    user?: string       // MySQL / PostgreSQL
    password?: string   // MySQL / PostgreSQL
    database?: string   // MySQL / PostgreSQL
  }
}
```

### DatabaseType

```ts
type DatabaseType = 'sqlite' | 'mysql' | 'postgresql'
```

### ModuleOptions

Configuration interface for `nuxt.config.ts`:

```ts
interface ModuleOptions {
  persist?: boolean
  storageKey?: string
  apiRoutes?: boolean
  currency?: string
  coupons?: boolean
  maxQuantity?: number
  connector?: DatabaseConfig
}
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `persist` | `boolean` | `true` | Enable localStorage persistence. |
| `storageKey` | `string` | `'nuxt-cart'` | localStorage key for persistence. |
| `apiRoutes` | `boolean` | `false` | Enable server API routes + DB persistence. |
| `currency` | `string` | `'USD'` | Currency identifier. |
| `coupons` | `boolean` | `false` | Enable coupon support. |
| `maxQuantity` | `number` | `99` | Maximum quantity per item. |
| `connector` | `DatabaseConfig` | `{ name: 'sqlite', options: { path: './data/cart.sqlite3' } }` | Database connector config for db0. |

## Hook Types

### CheckoutHook

Handler type for checkout:

```ts
interface CheckoutHook {
  (cart: CartState): Promise<{ redirectUrl?: string; error?: string }>
}
```

Accepts the full cart state and returns either a redirect URL (on success) or an error message.

### ValidateCouponHook

Handler type for coupon validation (Phase 2):

```ts
interface ValidateCouponHook {
  (code: string): Promise<Coupon | null>
}
```

Accepts a coupon code string. Returns the coupon data if valid, or `null` if invalid.

## Usage Example

```ts
import type { CartItem, ModuleOptions } from 'nuxt-cart'

// Type-safe module configuration
const config: ModuleOptions = {
  maxQuantity: 50,
  storageKey: 'my-shop-cart',
}

export default defineNuxtConfig({
  modules: ['nuxt-cart'],
  nuxtCart: config,
})

// Type-safe item creation
function createItem(product: { id: string; name: string; price: number }): CartItem {
  return {
    productId: product.id,
    name: product.name,
    price: product.price,
    quantity: 1,
  }
}
```
