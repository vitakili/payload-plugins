import type { Mode, ThemeOption, ThemeDefaults } from './types.js'

export const themeLocalStorageKey = 'payload-theme'
export const modeLocalStorageKey = 'payload-theme-mode'

export const defaultTheme = 'cool' as ThemeDefaults
export const defaultMode = 'auto' as Mode

export const themeOptions = [
  { label: 'Cool & Professional', value: 'cool' },
  { label: 'Modern Brutalism', value: 'brutal' },
  { label: 'Neon Cyberpunk', value: 'neon' },
  { label: 'Dealership', value: 'dealership' },
  { label: 'Solar', value: 'solar' },
  { label: 'Real Estate Blue', value: 'real-estate' },
  { label: 'Real Estate Gold', value: 'real-estate-gold' },
  { label: 'Real Estate Neutral', value: 'real-estate-neutral' },
] as ThemeOption[]

export const getImplicitModePreference = (): Mode | null => {
  const mediaQuery = '(prefers-color-scheme: dark)'
  const mql = window.matchMedia(mediaQuery)
  const hasImplicitPreference = typeof mql.matches === 'boolean'

  if (hasImplicitPreference) {
    return mql.matches ? 'dark' : 'light'
  }

  return null
}
