import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Nuxt Cart',
  description: 'A generic, reusable shopping cart module for Nuxt 4 applications with localStorage persistence, coupon support, and hook-based payment gateways',
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
  ],
  themeConfig: {
    search: {
      provider: 'local',
    },
    logo: '/logo.png',
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Get Started', link: '/user-guide/getting-started' },
    ],
    sidebar: [
      {
        items: [
          { text: 'Get Started', link: '/get-started' },
          {
            text: 'User Guide',
            items: [
              { text: 'Overview', link: '/user-guide/index' },
              { text: 'Getting Started', link: '/user-guide/getting-started' },
              { text: 'Installation', link: '/user-guide/installation' },
              { text: 'Configuration', link: '/user-guide/configuration' },
              { text: 'Composables', link: '/user-guide/composables' },
              { text: 'Persistence', link: '/user-guide/persistence' },
            ],
          },
          {
            text: 'API Reference',
            items: [
              { text: 'Overview', link: '/api/index' },
              { text: 'Public Types', link: '/api/types' },
            ],
          },
          {
            text: 'Examples',
            items: [
              { text: 'Basic Setup', link: '/examples/basic-setup' },
            ],
          },
          {
            text: 'Developer Guide',
            items: [
              { text: 'Overview', link: '/developer-guide/index' },
              { text: 'Architecture', link: '/developer-guide/architecture' },
              { text: 'Testing', link: '/developer-guide/testing' },
            ],
          },
        ],
      },
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/rrd108/nuxt-cart' },
    ],
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024-present',
    },
  },
  markdown: {
    theme: {
      light: 'vitesse-light',
      dark: 'vitesse-dark',
    },
    lineNumbers: true,
  },
})
