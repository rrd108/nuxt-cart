import { createDatabase } from 'db0'
import type { Database } from 'db0'
import type { ModuleOptions } from '../../../types'
import { isBuildTime } from './build-time'

const dbCache = new Map<string, Database>()

interface DisconnectableDatabase extends Database {
  disconnect(): Promise<void>
}

export const closeAllDbConnections = async () => {
  for (const db of dbCache.values()) {
    if (db && typeof (db as DisconnectableDatabase).disconnect === 'function') {
      await (db as DisconnectableDatabase).disconnect()
    }
  }
  dbCache.clear()
}

export const getConnector = async (name: string) => {
  try {
    switch (name) {
      case 'mysql':
        return (await import('db0/connectors/mysql2')).default
      case 'postgresql':
        return (await import('db0/connectors/postgresql')).default
      case 'sqlite':
        return (await import('db0/connectors/better-sqlite3')).default
      default:
        throw new Error(`Unsupported database connector: ${name}`)
    }
  }
  catch (error) {
    if (error instanceof Error && error.message.includes('Cannot resolve')) {
      throw new Error(
        `Database connector "${name}" not found. Please install the required peer dependency:\n`
        + '- For sqlite: pnpm add better-sqlite3\n'
        + '- For mysql: pnpm add mysql2\n'
        + '- For postgresql: pnpm add pg',
      )
    }
    throw error
  }
}

export const useDb = async (options: ModuleOptions): Promise<Database> => {
  if (isBuildTime()) {
    throw new Error('[Nuxt Cart] Database connections are not available during build/prerendering phase.')
  }

  const cacheKey = JSON.stringify(options.connector)
  if (dbCache.has(cacheKey)) {
    return dbCache.get(cacheKey)!
  }

  const connectorName = options.connector!.name
  const connector = await getConnector(connectorName)
  const connectorOptions = { ...options.connector!.options }
  if (connectorName !== 'sqlite') {
    delete connectorOptions.path
  }

  try {
    const db = createDatabase(connector(connectorOptions))
    dbCache.set(cacheKey, db)
    return db
  }
  catch (error) {
    console.warn('[Nuxt Cart] Failed to connect to database:', error instanceof Error ? error.message : 'Unknown error')
    throw error
  }
}

export const checkTableExists = async (options: ModuleOptions, tableName: string) => {
  try {
    const db = await useDb(options)
    await db.sql`SELECT 1 FROM {${tableName}} LIMIT 1`
    return true
  }
  catch {
    return false
  }
}
