import type { ThemeTypographyPreset } from '../presets.js'
import { getBorderRadiusConfig } from '../providers/Theme/themeConfig.js'
import type { ThemeDefaults } from '../providers/Theme/types.js'
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
  // resolveThemeConfiguration accepts `unknown` — no cast needed
  const resolvedConfiguration = resolveThemeConfiguration(themeConfiguration)
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
    visualEffects,
    componentStyles,
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
    visualEffects: visualEffects ?? null,
    componentStyles: componentStyles ?? null,
  }

  let criticalCSS = await getThemeCriticalCSS(theme as ThemeDefaults)
  criticalCSS ??= createFallbackCriticalCSS(theme as ThemeDefaults)

  const borderRadiusConfig = getBorderRadiusConfig(borderRadius ?? 'medium')
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

  // `color-scheme` makes native UI (form controls, scrollbars) match the theme and
  // avoids a white flash on dark sites. Fixed mode → single scheme; toggle/auto → both.
  const colorScheme =
    allowColorModeToggle === false
      ? colorMode === 'dark'
        ? 'dark'
        : 'light'
      : 'light dark'
  const colorSchemeBlock = `:root {\n  color-scheme: ${colorScheme};\n}`

  const combinedCSS = [
    criticalCSS,
    colorSchemeBlock,
    borderRadiusBlock,
    themeConfigurationCSS,
    colorModesCSS,
    customCSSBlock,
  ]
    .filter((block) => Boolean(block?.trim?.().length))
    .join('\n\n')

  // <meta name="theme-color"> colours the mobile browser chrome to match the page
  // background. Emit per-scheme variants when the mode can change, otherwise a
  // single tag matching the fixed mode.
  const pick = (mode: typeof lightMode, key: 'background'): string | undefined => {
    const value = (mode as Record<string, unknown> | null | undefined)?.[key]
    return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined
  }
  const lightBg = pick(lightMode, 'background')
  const darkBg = pick(darkMode, 'background')
  const emitBothSchemes = allowColorModeToggle !== false || colorMode === 'auto'

  return (
    <>
      <InitTheme />
      {emitBothSchemes ? (
        <>
          {lightBg ? (
            <meta name="theme-color" media="(prefers-color-scheme: light)" content={lightBg} />
          ) : null}
          {darkBg ? (
            <meta name="theme-color" media="(prefers-color-scheme: dark)" content={darkBg} />
          ) : null}
        </>
      ) : (
        (() => {
          const fixed = colorMode === 'dark' ? darkBg : lightBg
          return fixed ? <meta name="theme-color" content={fixed} /> : null
        })()
      )}
      <style
        id="theme-critical-css"
        dangerouslySetInnerHTML={{
          __html: combinedCSS,
        }}
      />
    </>
  )
}
