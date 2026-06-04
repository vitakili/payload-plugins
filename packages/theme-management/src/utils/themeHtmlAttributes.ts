import type { ResolvedThemeConfiguration } from './resolveThemeConfiguration.js'

/**
 * Stable base attributes that are always present on the <html> element.
 */
interface BaseThemeHtmlAttributes {
  'data-theme': string
  'data-theme-mode': string
  'data-border-radius': string
  'data-font-scale': string
  'data-spacing': string
  'data-animation-level': string
  'data-allow-color-mode-toggle': string
  suppressHydrationWarning: true
}

/**
 * Full attribute map: base attributes plus any visual-effect / component-style
 * attributes that were configured. Optional keys are only present when the
 * corresponding value is set, so callers can spread the whole object onto
 * `<html>` without emitting empty attributes.
 */
export type ThemeHtmlAttributes = BaseThemeHtmlAttributes & Record<string, string | true>

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0

/**
 * Generates HTML attributes for the <html> element based on theme configuration.
 *
 * This ensures the theme is applied before React hydration to prevent FOUC.
 * Crucially, it also emits the `data-effect-style`, `data-card-style`,
 * `data-button-variant`, `data-navbar-style`, `data-card-hover`,
 * `data-border-*`, `data-button-size`, `data-footer-style`, `data-image-style`
 * and `data-link-style` attributes that the CSS produced by `generateThemeCSS`
 * targets. Without them, the visual-effect and component-style rules only
 * activate after client hydration (the `ThemeProvider` syncs them from CSS
 * variables), causing a flash of unstyled content on server-rendered pages.
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
export function getThemeHtmlAttributes(config: ResolvedThemeConfiguration): ThemeHtmlAttributes {
  const attributes: ThemeHtmlAttributes = {
    'data-theme': config.theme,
    'data-theme-mode': config.colorMode,
    'data-border-radius': config.borderRadius,
    'data-font-scale': config.fontScale,
    'data-spacing': config.spacing,
    'data-animation-level': config.animationLevel,
    'data-allow-color-mode-toggle': config.allowColorModeToggle ? 'true' : 'false',
    suppressHydrationWarning: true,
  }

  const ve = config.visualEffects
  if (ve) {
    if (isNonEmptyString(ve.effectStyle)) attributes['data-effect-style'] = ve.effectStyle
    if (isNonEmptyString(ve.shadowIntensity))
      attributes['data-shadow-intensity'] = ve.shadowIntensity
    if (isNonEmptyString(ve.backdropBlur)) attributes['data-backdrop-blur'] = ve.backdropBlur
    if (isNonEmptyString(ve.borderStyle)) attributes['data-border-style'] = ve.borderStyle
    if (isNonEmptyString(ve.borderWidth)) attributes['data-border-width'] = ve.borderWidth
  }

  const cs = config.componentStyles
  if (cs) {
    if (isNonEmptyString(cs.buttonVariant)) attributes['data-button-variant'] = cs.buttonVariant
    if (isNonEmptyString(cs.buttonSize)) attributes['data-button-size'] = cs.buttonSize
    if (isNonEmptyString(cs.cardStyle)) attributes['data-card-style'] = cs.cardStyle
    if (isNonEmptyString(cs.cardHoverEffect)) attributes['data-card-hover'] = cs.cardHoverEffect
    if (isNonEmptyString(cs.imageStyle)) attributes['data-image-style'] = cs.imageStyle
    if (isNonEmptyString(cs.navbarStyle)) attributes['data-navbar-style'] = cs.navbarStyle
    if (isNonEmptyString(cs.footerStyle)) attributes['data-footer-style'] = cs.footerStyle
    if (isNonEmptyString(cs.linkStyle)) attributes['data-link-style'] = cs.linkStyle
    // Booleans: only emit the attribute when explicitly disabled (defaults are "on"),
    // keeping the DOM clean while still letting CSS / consumer JS react to opt-outs.
    if (cs.enableHoverAnimations === false) attributes['data-hover-animations'] = 'off'
    if (cs.enableScrollReveal === false) attributes['data-scroll-reveal'] = 'off'
  }

  return attributes
}
