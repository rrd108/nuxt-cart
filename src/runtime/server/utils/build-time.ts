export const isBuildTime = (): boolean => {
  if (process.env.NITRO_PRESET === 'nitro-prerender' || process.env.NUXT_ENV === 'prerender') {
    return true
  }
  if (process.env.NODE_ENV === 'production' && process.argv.includes('--prerender')) {
    return true
  }
  const buildIndicators = ['prerender', 'build', 'generate']
  return buildIndicators.some(indicator =>
    process.argv.join(' ').toLowerCase().includes(indicator)
    || process.env.npm_lifecycle_event?.includes(indicator),
  )
}
