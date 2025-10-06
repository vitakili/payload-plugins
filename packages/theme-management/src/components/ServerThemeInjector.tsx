import type { SiteSetting } from '../payload-types.js'
import { getBorderRadiusConfig } from '../providers/Theme/themeConfig.js'
import type { BorderRadiusPreset, ThemeDefaults } from '../providers/Theme/types.js'
import type { ThemeTypographyPreset } from '../presets.js'
import { resolveThemeConfiguration } from '../utils/resolveThemeConfiguration.js'
import {
  createFallbackCriticalCSS,
  getThemeCriticalCSS,
  getThemeCSSPath,
} from '../utils/themeAssets.js'
import { generateThemeColorsCss } from '../utils/themeColors.js'
import { generateThemeCSS } from '../utils/themeUtils.js'

interface ServerThemeInjectorProps {
  siteSettings: SiteSetting | null
}

type RuntimeThemeConfiguration = Omit<NonNullable<SiteSetting['themeConfiguration']>, 'typography'> & {
  typography?: ThemeTypographyPreset | null
}

/**
 * Server-side theme CSS injector to prevent FOUC
 * This component injects critical theme CSS directly into the HTML head during SSR
 */
export async function ServerThemeInjector({ siteSettings }: Readonly<ServerThemeInjectorProps>) {
  const resolvedConfiguration = resolveThemeConfiguration(siteSettings?.themeConfiguration)
  const {
    theme,
    borderRadius,
    customCSS,
    lightMode,
    darkMode,
    fontScale,
    spacing,
    animationLevel,
    allowColorModeToggle,
    colorMode,
    typography,
  } = resolvedConfiguration

  const baseThemeConfiguration = { ...(siteSettings?.themeConfiguration ?? {}) }
  if ('typography' in baseThemeConfiguration) {
    delete (baseThemeConfiguration as Record<string, unknown>).typography
  }

  const normalizedThemeConfiguration: RuntimeThemeConfiguration = {
    ...baseThemeConfiguration,
    theme,
    colorMode,
    allowColorModeToggle,
    borderRadius,
    fontScale,
    spacing,
    animationLevel,
    customCSS: customCSS ?? undefined,
    lightMode,
    darkMode,
    typography: typography ?? undefined,
  }

  let criticalCSS = await getThemeCriticalCSS(theme as ThemeDefaults)
  criticalCSS ??= createFallbackCriticalCSS(theme as ThemeDefaults)

  const borderRadiusMap: Record<string, BorderRadiusPreset> = {
    none: 'none',
    small: 'small',
    medium: 'medium',
    large: 'large',
    xl: 'xl',
    full: 'xl',
  }
  const mappedBorderRadius = borderRadiusMap[borderRadius ?? 'medium'] ?? 'medium'
  const borderRadiusConfig = getBorderRadiusConfig(mappedBorderRadius)
  const cssRecord = typeof borderRadiusConfig?.css === 'string'
    ? { '--radius-default': borderRadiusConfig.css }
    : borderRadiusConfig?.css ?? {}

  const borderRadiusCSS = Object.entries(cssRecord)
    .map(([property, value]) => `  ${property}: ${value};`)
    .join('\n')

  const borderRadiusBlock = borderRadiusCSS
    ? `:root {
${borderRadiusCSS}
}`
    : ''

  const themeConfigurationCSS = generateThemeCSS(normalizedThemeConfiguration)
  const colorModesCSS = generateThemeColorsCss({ themeName: theme, lightMode, darkMode })
  const customCSSBlock = typeof customCSS === 'string' ? customCSS.trim() : ''

  const combinedCSS = [
    criticalCSS,
    borderRadiusBlock,
    themeConfigurationCSS,
    colorModesCSS,
    customCSSBlock,
  ]
    .filter((block) => Boolean(block?.trim?.().length))
    .join('\n\n')

  const themeCSSPath = getThemeCSSPath(theme as ThemeDefaults)
  return (
    <>
      <style
        id="theme-critical-css"
        dangerouslySetInnerHTML={{
          __html: combinedCSS,
        }}
      />
      <link rel="preload" href={themeCSSPath} as="style" />
      <link rel="stylesheet" href={themeCSSPath} />
    </>
  )
}
