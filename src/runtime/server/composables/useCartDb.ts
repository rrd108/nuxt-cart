import { useRuntimeConfig } from '#imports'
import type { ModuleOptions } from '../../../types'
import { useDb } from '../utils/db'

export const useCartDb = async () => {
  const { nuxtCart } = useRuntimeConfig()
  const options = nuxtCart as ModuleOptions
  const database = await useDb(options)

  return {
    database,
    connector: options.connector,
  }
}
