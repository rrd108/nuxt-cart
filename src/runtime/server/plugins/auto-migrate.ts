import type { NitroAppPlugin } from 'nitropack'
import { useRuntimeConfig } from '#imports'
import type { ModuleOptions } from '../../../types'
import { runMigrations } from '../utils/migrate'

const plugin: NitroAppPlugin = async () => {
  const config = useRuntimeConfig()

  if (!config.nuxtCart) {
    return
  }

  try {
    await runMigrations(config.nuxtCart as ModuleOptions)
  }
  catch (error) {
    console.error('[Nuxt Cart] Auto-migration failed:', error)
  }
}

export default plugin
