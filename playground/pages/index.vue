<script setup lang="ts">
const cart = useCart()
const toast = useToast()

const categories = [
  {
    name: 'Electronics',
    icon: 'i-lucide-smartphone',
    products: [
      { productId: 'p1', name: 'Wireless Headphones', price: 79.99, image: 'https://picsum.photos/seed/headphones/400/300', description: 'Premium noise-cancelling wireless headphones with 30hr battery.' },
      { productId: 'p2', name: 'USB-C Hub', price: 34.99, image: 'https://picsum.photos/seed/usbhub/400/300', description: '7-in-1 USB-C hub with HDMI, SD card, and 100W PD charging.' },
      { productId: 'p3', name: 'Mechanical Keyboard', price: 129.99, image: 'https://picsum.photos/seed/keyboard/400/300', description: 'Hot-swappable mechanical keyboard with RGB backlighting.' },
    ],
  },
  {
    name: 'Apparel',
    icon: 'i-lucide-shirt',
    products: [
      { productId: 'p4', name: 'Cotton T-Shirt', price: 24.99, image: 'https://picsum.photos/seed/tshirt/400/300', description: 'Organic cotton crew-neck t-shirt. Available in 5 colors.' },
      { productId: 'p5', name: 'Denim Jacket', price: 89.99, image: 'https://picsum.photos/seed/jacket/400/300', description: 'Classic denim jacket with a modern slim fit.' },
    ],
  },
  {
    name: 'Home',
    icon: 'i-lucide-home',
    products: [
      { productId: 'p6', name: 'Ceramic Mug', price: 14.99, image: 'https://picsum.photos/seed/mug/400/300', description: 'Handcrafted ceramic mug, 350ml, dishwasher safe.' },
      { productId: 'p7', name: 'Desk Lamp', price: 49.99, image: 'https://picsum.photos/seed/lamp/400/300', description: 'LED desk lamp with adjustable color temperature.' },
      { productId: 'p8', name: 'Plant Pot Set', price: 39.99, image: 'https://picsum.photos/seed/plantpot/400/300', description: 'Set of 3 minimalist ceramic plant pots with bamboo trays.' },
    ],
  },
]

cart.onValidateCoupon(async (code) => {
  const coupons: Record<string, { discount: number; type: 'percentage' | 'fixed' }> = {
    SAVE10: { discount: 10, type: 'percentage' },
    FLAT5: { discount: 5, type: 'fixed' },
    WELCOME20: { discount: 20, type: 'percentage' },
  }
  const c = coupons[code.toUpperCase()]
  return c ? { code: code.toUpperCase(), ...c } : null
})

function addToCart(product: { productId: string; name: string; price: number; image?: string }) {
  cart.addItem(product)
  toast.add({
    title: 'Added to cart',
    description: product.name,
    color: 'success',
    icon: 'i-lucide-check-circle',
  })
}
</script>

<template>
  <div class="space-y-12">
    <section class="text-center">
      <h1 class="text-4xl font-bold tracking-tight">
        Nuxt Cart Playground
      </h1>
      <p class="mt-2 text-lg text-muted">
        A demo of the nuxt-cart module — add items, apply coupons, and check out.
      </p>
    </section>

    <section v-for="cat in categories" :key="cat.name" class="space-y-4">
      <div class="flex items-center gap-2">
        <span :class="[cat.icon, 'h-5 w-5 text-primary']" />
        <h2 class="text-xl font-semibold">
          {{ cat.name }}
        </h2>
      </div>

      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <UCard
          v-for="product in cat.products"
          :key="product.productId"
          :ui="{ body: 'p-0' }"
        >
          <img
            :src="product.image"
            :alt="product.name"
            class="h-48 w-full object-cover"
            loading="lazy"
          />
          <div class="space-y-2 p-4">
            <h3 class="font-semibold">
              {{ product.name }}
            </h3>
            <p class="text-sm text-muted">
              {{ product.description }}
            </p>
            <div class="flex items-center justify-between pt-2">
              <span class="text-lg font-bold">${{ product.price }}</span>
              <UButton
                size="sm"
                @click="addToCart(product)"
              >
                Add to Cart
              </UButton>
            </div>
          </div>
        </UCard>
      </div>
    </section>
  </div>
</template>
