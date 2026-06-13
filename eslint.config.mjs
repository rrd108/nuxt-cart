import { createConfigForNuxt } from '@nuxt/eslint/config'

export default createConfigForNuxt({
  features: {
    tooling: true,
    stylistic: {
      semi: false,
      singleQuote: true,
      indent: 2,
    },
  },
  dirs: {
    src: ['./src'],
  },
})
