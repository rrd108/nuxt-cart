import { useDb } from './db'
import type { ModuleOptions } from '../../../types'
import { createMigrationsTable } from './create-migrations-table'
import { createCartsTable } from './create-carts-table'

interface Migration {
  name: string
  run: (options: ModuleOptions) => Promise<void>
}

export const migrations: Migration[] = [
  {
    name: 'create_migrations_table',
    run: createMigrationsTable,
  },
  {
    name: 'create_carts_table',
    run: createCartsTable,
  },
]

export const getAppliedMigrations = async (options: ModuleOptions): Promise<string[]> => {
  const db = await useDb(options)

  try {
    const result = await db.sql`SELECT name FROM migrations ORDER BY id` as { rows: Array<{ name: string }> }
    return result.rows.map(row => row.name)
  }
  catch {
    return []
  }
}

export const markMigrationAsApplied = async (options: ModuleOptions, migrationName: string): Promise<void> => {
  const db = await useDb(options)
  await db.sql`INSERT INTO migrations (name) VALUES (${migrationName})`
}

export const runMigrations = async (options: ModuleOptions): Promise<void> => {
  console.log('[Nuxt Cart] Starting migration system...')

  await createMigrationsTable(options)

  const appliedMigrations = await getAppliedMigrations(options)
  console.log(`[Nuxt Cart] Applied migrations: ${appliedMigrations.join(', ')}`)

  const pendingMigrations = migrations.filter(migration => !appliedMigrations.includes(migration.name))

  if (pendingMigrations.length === 0) {
    console.log('[Nuxt Cart] No pending migrations to run.')
    return
  }

  console.log(`[Nuxt Cart] Found ${pendingMigrations.length} pending migrations:`)
  pendingMigrations.forEach((migration) => {
    console.log(`[Nuxt Cart]   - ${migration.name}`)
  })

  for (const migration of pendingMigrations) {
    console.log(`[Nuxt Cart] Running migration: ${migration.name}`)

    try {
      await migration.run(options)
      await markMigrationAsApplied(options, migration.name)
      console.log(`[Nuxt Cart] Migration ${migration.name} successfull`)
    }
    catch (error) {
      console.error(`[Nuxt Cart] Migration ${migration.name} failed:`, error)
      throw error
    }
  }

  console.log('[Nuxt Cart] All migrations successfull')
}
