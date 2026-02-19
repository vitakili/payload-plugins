import { getBorderRadiusConfig } from '../providers/Theme/themeConfig.js'
import { resolveThemeConfiguration } from './resolveThemeConfiguration.js'
import { generateThemeColorsCss } from './themeColors.js'
import { generateThemeCSS } from './themeUtils.js'

export const extractThemeConfigurationFromLiveData = (
  liveData: Record<string, unknown>,
  themeConfigurationKey = 'themeConfiguration',
): unknown => {
  const candidate = liveData?.[themeConfigurationKey]
  if (candidate && typeof candidate === 'object') {
    return candidate
  }

  return liveData
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const resolved = resolveThemeConfiguration(themeConfiguration as any)

  const borderRadiusMap: Record<string, 'none' | 'small' | 'medium' | 'large' | 'xl'> = {
    none: 'none',
    small: 'small',
    medium: 'medium',
    large: 'large',
    xl: 'xl',
    full: 'xl',
  }

  const mappedBorderRadius = borderRadiusMap[resolved.borderRadius ?? 'medium'] ?? 'medium'
  const borderRadiusConfig = getBorderRadiusConfig(mappedBorderRadius)
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
