<script setup lang="ts">
const cart = useCart()
const drawerOpen = ref(false)
const router = useRouter()
</script>

<template>
  <UApp>
    <div class="min-h-screen bg-background">
      <header class="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div class="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <NuxtLink to="/" class="text-lg font-bold hover:text-primary">
            Nuxt Cart
          </NuxtLink>
          <div class="flex items-center gap-2">
            <UButton
              variant="soft"
              size="sm"
              @click="router.push('/cart')"
            >
              Cart ({{ cart.itemCount.value }})
            </UButton>
            <UButton
              icon="i-lucide-shopping-cart"
              size="sm"
              @click="drawerOpen = true"
            />
          </div>
        </div>
      </header>

      <main class="mx-auto max-w-5xl px-4 py-8">
        <slot />
      </main>

      <footer class="border-t py-6 text-center text-sm text-muted">
        <p>Nuxt Cart Playground — Built with Nuxt 4 + Nuxt UI v4</p>
      </footer>
    </div>

    <NCartDrawer
      :open="drawerOpen"
      @close="drawerOpen = false"
      @checkout="router.push('/checkout')"
    />
  </UApp>
</template>
