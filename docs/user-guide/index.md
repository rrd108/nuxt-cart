# User Guide

Welcome to Nuxt Cart — the generic shopping cart module for your Nuxt application. This guide will help you add cart functionality to your project with minimal setup.

## What is Nuxt Cart?

Nuxt Cart is a standalone, backend-agnostic shopping cart module that provides:

- **Cart Management** — Add, remove, and update items with quantity support
- **Automatic Persistence** — SSR-safe localStorage with hydration and auto-save
- **Pinia-Powered** — Reactive state management with devtools support
- **Coupon Support** — Built-in coupon logic with validation hooks
- **Nuxt UI Components** — Optional auto-imported drawer, item, summary, and quantity components (requires `@nuxt/ui` in modules)
- **Payment Gateways** — Hook-based checkout system for any payment provider (coming in Phase 4)

## Why Choose Nuxt Cart?

✅ **Zero Dependencies on Commerce Platforms** — Not tied to Shopify, Snipcart, or any backend
✅ **Works Everywhere** — Same API whether you use a CMS, static data, or a headless API
✅ **Production Ready** — Type-guard validation, max-quantity clamping, SSR safety
✅ **Extensible** — Coupon hooks, checkout hooks, server API routes — only what you need
✅ **TypeScript First** — Full type safety throughout

## Get Started in 3 Steps

1. **[Install the module](./installation.md)** — Add Nuxt Cart to your project
2. **[Quick start guide](./getting-started.md)** — Set up your first cart in minutes
3. **[Configure to your needs](./configuration.md)** — Customize persistence, limits, and more

## Core Features

### 🛒 Cart Management
- [Composables](./composables.md) — Full `useCart()` API reference

### 🧩 Components
- [Components](./components.md) — NCartDrawer, NCartItem, NCartSummary, NCartQuantity

### 💾 Persistence
- [Persistence Guide](./persistence.md) — How localStorage hydration and auto-save work

### ⚙️ Configuration
- [Configuration Guide](./configuration.md) — All module options explained

### 📋 Examples
- [Basic Setup](/examples/basic-setup) — Complete copy-paste examples

## Need Help?

- [API Reference](/api/) — Complete API documentation
- [Developer Guide](/developer-guide/) — For contributing to the module

Ready to add a cart to your Nuxt app? **[Start with the getting started guide →](./getting-started.md)**
