import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  externals: [
    '@nuxt/kit',
    '@pinia/nuxt',
    'defu',
    'destr',
    'nuxt',
    'pinia',
    'vue',
  ],
})
