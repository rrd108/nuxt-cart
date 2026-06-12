export interface ModuleOptions {
  persist?: boolean
  storageKey?: string
  apiRoutes?: boolean
  currency?: string
  coupons?: boolean
  maxQuantity?: number
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
  (cart: CartState): Promise<{ redirectUrl?: string; error?: string }>
}

export interface ValidateCouponHook {
  (code: string): Promise<Coupon | null>
}
