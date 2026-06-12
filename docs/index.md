---
layout: home

hero:
  name: "Nuxt Cart Module"
  text: "A generic, reusable shopping cart module for Nuxt 4 with localStorage persistence, coupon support, and hook-based payment gateways"
  tagline: Zero-config cart out of the box. Opt-in server API routes. Built on Pinia.
  actions:
    - theme: brand
      text: Get Started
      link: /user-guide/getting-started
    - theme: alt
      text: Open on GitHub →
      link: https://github.com/rrd108/nuxt-cart

features:
  - title: 🛒 Cart Management
    details: Add, remove, and update items with quantity support. Items grouped by productId with automatic quantity merging and configurable max quantity.
  - title: 💾 Automatic Persistence
    details: SSR-safe localStorage persistence with type-guard validation, auto-save on change, and beforeunload fallback. No database setup needed.
  - title: 🧩 Built on Pinia
    details: Pinia setup store under the hood with devtools support. Shared state across components. Familiar API for any Nuxt + Pinia project.
  - title: 🔌 Pluggable Architecture
    details: Hook-based checkout system, coupon validation hooks, and opt-in server API routes with database support for production use.
  - title: 🎨 Nuxt UI Components
    details: Ready-to-use drawer, item, summary, and quantity components built on @nuxt/ui v4. Global N-prefixed components.
  - title: 🔷 TypeScript First
    details: Full TypeScript support throughout. Exported interfaces for CartItem, CartState, ModuleOptions, and more.
---
