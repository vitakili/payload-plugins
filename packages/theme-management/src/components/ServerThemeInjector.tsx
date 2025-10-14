import type { ThemeTypographyPreset } from '../presets.js'
import { getBorderRadiusConfig } from '../providers/Theme/themeConfig.js'
import type { BorderRadiusPreset, ThemeDefaults } from '../providers/Theme/types.js'
import { resolveThemeConfiguration } from '../utils/resolveThemeConfiguration.js'
import type { ResolvedThemeConfiguration } from '../utils/resolveThemeConfiguration.js'
import { createFallbackCriticalCSS, getThemeCriticalCSS } from '../utils/themeAssets.js'
import { generateThemeColorsCss } from '../utils/themeColors.js'
import { generateThemeCSS } from '../utils/themeUtils.js'
import { InitTheme } from './InitTheme.js'

interface ServerThemeInjectorProps {
  /**
   * Theme configuration object from your site settings.
   * Pass the themeConfiguration field directly, not the entire site settings object.
   *
   * @example
   * ```tsx
   * const siteSettings = await payload.findGlobal({ slug: 'site-settings' })
   * <ServerThemeInjector themeConfiguration={siteSettings.themeConfiguration} />
   * ```
   */
  themeConfiguration?: unknown
}

type RuntimeThemeConfiguration = Omit<ResolvedThemeConfiguration, 'typography'> & {
  typography?: ThemeTypographyPreset | null
}

/**
 * Server-side theme CSS injector to prevent FOUC
 * This component injects critical theme CSS directly into the HTML head during SSR
 */
export async function ServerThemeInjector({
  themeConfiguration,
}: Readonly<ServerThemeInjectorProps>) {
  // Accept unknown type to avoid type conflicts between app's payload-types and plugin's payload-types
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const resolvedConfiguration = resolveThemeConfiguration(themeConfiguration as any)
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

  // Use resolved configuration directly
  const normalizedThemeConfiguration: RuntimeThemeConfiguration = {
    theme,
    colorMode,
    allowColorModeToggle,
    borderRadius,
    fontScale,
    spacing,
    animationLevel,
    customCSS: customCSS ?? null,
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
  const cssRecord =
    typeof borderRadiusConfig?.css === 'string'
      ? { '--radius-default': borderRadiusConfig.css }
      : (borderRadiusConfig?.css ?? {})

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

  return (
    <>
      <InitTheme />
      <style
        id="theme-critical-css"
        dangerouslySetInnerHTML={{
          __html: combinedCSS,
        }}
      />
    </>
  )
}
