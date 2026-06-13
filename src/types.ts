export type DatabaseType = 'sqlite' | 'mysql' | 'postgresql'

export type DatabaseConfig = {
  path?: string
  host?: string
  port?: number
  user?: string
  password?: string
  database?: string
}

export interface ModuleOptions {
  persist?: boolean
  storageKey?: string
  apiRoutes?: boolean
  currency?: string
  coupons?: boolean
  maxQuantity?: number
  connector?: {
    name: DatabaseType
    options: DatabaseConfig
  }
}

export interface CartItem {
  productId: string
  name: string
  price: number
  quantity: number
  image?: string
  metadata?: Record<string, unknown>
}

export interface Coupon {
  code: string
  discount: number
  type: 'fixed' | 'percentage'
}

export interface CartState {
  items: CartItem[]
  coupon: Coupon | null
  createdAt?: string
  updatedAt?: string
}

export interface CheckoutHook {
  (cart: CartState): Promise<{ redirectUrl?: string, error?: string }>
}

export interface ValidateCouponHook {
  (code: string): Promise<Coupon | null>
}
