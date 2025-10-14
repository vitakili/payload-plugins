export const THEME_DEFAULTS = [
  'cool',
  'brutal',
  'neon',
  'solar',
  'dealership',
  'real-estate',
  'real-estate-gold',
  'real-estate-neutral',
  'cyberpunk',
  'minimal',
  'retro',
  'pastel',
  'ocean',
  'forest',
  'sunset',
  'lavender',
  'neutral',
  'blue',
  'green',
  'red',
  'orange',
  'rose',
  'violet',
  'zinc',
  'slate',
  'stone',
  'gray',
] as const

export type ThemeDefaults = (typeof THEME_DEFAULTS)[number]

export type Mode = 'dark' | 'light' | 'auto'

export type BorderRadiusPreset = 'none' | 'small' | 'medium' | 'large' | 'xl'

export type FontScalePreset = 'small' | 'medium' | 'large' | 'xl'

export type SpacingPreset = 'compact' | 'medium' | 'spacious'

export type AnimationLevelPreset = 'none' | 'reduced' | 'medium' | 'high'

export type ColorModePreset = 'auto' | 'light' | 'dark'

export interface ThemeConfig {
  name: string
  label: string
  borderRadius: BorderRadiusPreset
  cssFile?: string // Optional - if not provided, CSS is generated dynamically
  dynamicCSS?: boolean // If true, CSS is generated from theme preset
  preview?: {
    colors: {
      primary: string
      background: string
      accent: string
    }
  }
}

export interface ThemeContextType {
  // Theme management
  theme?: ThemeDefaults | null
  setTheme?: (theme: ThemeDefaults) => void // Add setTheme for enhanced functionality
  refreshTheme: () => void // Refresh theme (now handled server-side)

  // Color mode
  mode?: Mode | null
  setMode: (mode: Mode | null) => void
  isColorModeToggleAllowed?: boolean // Whether admin allows color mode changes

  // Design controls
  borderRadius?: BorderRadiusPreset
  setBorderRadius?: (radius: BorderRadiusPreset) => void
  fontScale?: FontScalePreset
  setFontScale?: (scale: FontScalePreset) => void
  spacing?: SpacingPreset
  setSpacing?: (spacing: SpacingPreset) => void
  animationLevel?: AnimationLevelPreset
  setAnimationLevel?: (level: AnimationLevelPreset) => void

  // Theme loading
  preloadTheme?: (theme: ThemeDefaults) => Promise<boolean>
  isThemeLoaded?: (theme: ThemeDefaults) => boolean

  // Enhanced configuration
  themeConfig?: unknown // Enhanced theme configuration from plugin
}

export interface ThemeOption {
  label: string
  value: ThemeDefaults
  config?: ThemeConfig
}

export function themeIsValid(string: null | string): string is ThemeDefaults {
  return typeof string === 'string' && (THEME_DEFAULTS as readonly string[]).includes(string)
}

export function modeIsValid(string: null | string): string is Mode {
  return typeof string === 'string' && ['dark', 'light', 'auto'].includes(string)
}
