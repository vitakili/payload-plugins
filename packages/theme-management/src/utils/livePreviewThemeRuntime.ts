import { getBorderRadiusConfig } from '../providers/Theme/themeConfig.js'
import { resolveThemeConfiguration } from './resolveThemeConfiguration.js'
import { generateThemeColorsCss } from './themeColors.js'
import { generateThemeCSS } from './themeUtils.js'

/**
 * Keys that strongly indicate a live-preview payload is (or contains) a theme
 * configuration object. Used to avoid applying default theme CSS when an
 * unrelated form (e.g. a page editor) emits live-preview data.
 */
export const THEME_LIKE_KEYS = [
  'theme',
  'colorMode',
  'allowColorModeToggle',
  'lightMode',
  'darkMode',
  'customCSS',
  'borderRadius',
  'fontScale',
  'spacing',
  'animationLevel',
] as const

export const isThemeLikeObject = (value: unknown): value is Record<string, unknown> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false
  }
  return THEME_LIKE_KEYS.some((key) => key in (value as Record<string, unknown>))
}

/**
 * Safely extract the theme configuration object from a live-preview payload.
 *
 * Returns `null` when the payload is unrelated (e.g. page form data) so callers
 * can skip re-applying theme CSS instead of falling back to defaults — which
 * would visibly reset the theme while editing other documents.
 */
export const extractThemeConfigurationFromLiveData = (
  liveData: Record<string, unknown> | undefined,
  themeConfigurationKey = 'themeConfiguration',
): Record<string, unknown> | null => {
  const candidate = liveData?.[themeConfigurationKey]
  if (candidate && typeof candidate === 'object' && !Array.isArray(candidate)) {
    return candidate as Record<string, unknown>
  }

  // Some forms emit the theme config object directly at the root.
  if (isThemeLikeObject(liveData)) {
    return liveData as Record<string, unknown>
  }

  // Ignore unrelated live-preview payloads to avoid fallback defaults.
  return null
}

const resolveColorMode = (mode: string): 'light' | 'dark' => {
  if (mode === 'dark') {
    return 'dark'
  }

  if (
    mode === 'auto' &&
    globalThis.window !== undefined &&
    typeof globalThis.window.matchMedia === 'function'
  ) {
    return globalThis.window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  return 'light'
}

export const buildLivePreviewThemeRuntime = (themeConfiguration: unknown) => {
  const resolved = resolveThemeConfiguration(themeConfiguration)

  const borderRadiusConfig = getBorderRadiusConfig(resolved.borderRadius ?? 'medium')
  const cssRecord =
    typeof borderRadiusConfig?.css === 'string'
      ? { '--radius-default': borderRadiusConfig.css }
      : (borderRadiusConfig?.css ?? {})

  const borderRadiusCSS = Object.entries(cssRecord)
    .map(([property, value]) => `  ${property}: ${value};`)
    .join('\n')

  const borderRadiusBlock = borderRadiusCSS ? `:root {\n${borderRadiusCSS}\n}` : ''

  const themeConfigurationCSS = generateThemeCSS(resolved)
  const colorModesCSS = generateThemeColorsCss({
    themeName: resolved.theme,
    lightMode: resolved.lightMode,
    darkMode: resolved.darkMode,
  })

  const customCSSBlock = typeof resolved.customCSS === 'string' ? resolved.customCSS.trim() : ''

  return {
    theme: resolved.theme,
    mode: resolveColorMode(resolved.colorMode),
    css: [borderRadiusBlock, themeConfigurationCSS, colorModesCSS, customCSSBlock]
      .filter((block) => Boolean(block?.trim?.().length))
      .join('\n\n'),
  }
}
