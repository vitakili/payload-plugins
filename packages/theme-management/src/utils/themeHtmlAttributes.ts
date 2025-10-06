import type { ResolvedThemeConfiguration } from './resolveThemeConfiguration.js'

/**
 * Generates HTML attributes for the <html> element based on theme configuration
 * This ensures the theme is applied before React hydration to prevent FOUC
 * 
 * @example
 * ```tsx
 * const siteSettings = await payload.findGlobal({ slug: 'site-settings' })
 * const themeConfig = resolveThemeConfiguration(siteSettings?.themeConfiguration)
 * const htmlAttrs = getThemeHtmlAttributes(themeConfig)
 * 
 * <html {...htmlAttrs} className={yourClassName}>
 * ```
 */
export function getThemeHtmlAttributes(config: ResolvedThemeConfiguration): {
  'data-theme': string
  'data-theme-mode': string
  'data-border-radius': string
  'data-font-scale': string
  'data-spacing': string
  'data-animation-level': string
  'data-allow-color-mode-toggle': string
  suppressHydrationWarning: true
} {
  return {
    'data-theme': config.theme,
    'data-theme-mode': config.colorMode,
    'data-border-radius': config.borderRadius,
    'data-font-scale': config.fontScale,
    'data-spacing': config.spacing,
    'data-animation-level': config.animationLevel,
    'data-allow-color-mode-toggle': config.allowColorModeToggle ? 'true' : 'false',
    suppressHydrationWarning: true,
  }
}
