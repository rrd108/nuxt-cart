import { useDb } from './db'
import type { ModuleOptions } from '../../../types'

export const createCartsTable = async (options: ModuleOptions) => {
  const connectorName = options.connector!.name
  const db = await useDb(options)
  const tableName = 'carts'

  if (connectorName === 'sqlite') {
    await db.sql`
      CREATE TABLE IF NOT EXISTS {${tableName}} (
        id TEXT PRIMARY KEY,
        items TEXT NOT NULL DEFAULT '[]',
        coupon TEXT,
        status TEXT NOT NULL DEFAULT 'active',
        order_reference TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `
  }
  if (connectorName === 'mysql') {
    await db.sql`
      CREATE TABLE IF NOT EXISTS {${tableName}} (
        id VARCHAR(36) PRIMARY KEY,
        items JSON NOT NULL,
        coupon JSON,
        status VARCHAR(20) NOT NULL DEFAULT 'active',
        order_reference VARCHAR(255),
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL
      )
    `
  }
  if (connectorName === 'postgresql') {
    await db.sql`
      CREATE TABLE IF NOT EXISTS {${tableName}} (
        id UUID PRIMARY KEY,
        items JSONB NOT NULL DEFAULT '[]',
        coupon JSONB,
        status VARCHAR(20) NOT NULL DEFAULT 'active',
        order_reference VARCHAR(255),
        created_at TIMESTAMP NOT NULL,
        updated_at TIMESTAMP NOT NULL
      )
    `
  }
}
