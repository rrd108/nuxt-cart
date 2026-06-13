import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  externals: [
    '@nuxt/kit',
    '@pinia/nuxt',
    'db0',
    'db0/connectors/better-sqlite3',
    'db0/connectors/mysql2',
    'db0/connectors/postgresql',
    'defu',
    'destr',
    'better-sqlite3',
    'mysql2',
    'nuxt',
    'pg',
    'pinia',
    'vue',
  ],
})
