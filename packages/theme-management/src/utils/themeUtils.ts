import type { SiteSetting } from '@/payload-types'
import { borderRadiusPresets } from '@/providers/Theme/themeConfig'
import type { ThemeTypographyPreset } from '../presets'

type ThemeTypographyConfiguration = {
  typography?: ThemeTypographyPreset | null
}

type ThemeConfiguration = Omit<NonNullable<SiteSetting['themeConfiguration']>, 'typography'> &
  ThemeTypographyConfiguration

interface ThemeCustomization {
  primaryColor?: string | null
  accentColor?: string | null
  backgroundColor?: string | null
  textColor?: string | null
  customCSS?: string | null
}

type ThemeConfigurationWithCustomization = ThemeConfiguration & {
  customization?: ThemeCustomization | null
}
/**
 * Generates CSS custom properties from theme configuration
 */
export function generateThemeCSS(config: ThemeConfiguration): string {
  const cssRules: string[] = []
  const customization = (config as ThemeConfigurationWithCustomization).customization
  const themeSelector = config.theme ? `:root[data-theme='${config.theme}']` : ':root'

  // Start root CSS rules
  cssRules.push(`${themeSelector} {`)
  applyCustomizationRootRules(cssRules, customization)
  applyBorderRadiusRule(cssRules, config)
  applyFontScaleRules(cssRules, config)
  applySpacingRule(cssRules, config)
  applyAnimationRule(cssRules, config)
  applyTypographyRules(cssRules, config)

  cssRules.push('}')

  // Color mode specific overrides
  applyDarkModeOverrides(cssRules, config, customization, themeSelector)

  // Animation level: none - respect prefers-reduced-motion
  applyReducedMotionOverride(cssRules, config)

  // Custom CSS
  appendCustomCSS(cssRules, customization)

  return cssRules.join('\n')
}

/**
 * Determines if a color is light or dark
 */
function isLightBackground(color: string): boolean {
  // Simple heuristic: if it contains 'white', '#fff', or high RGB values, it's light
  const lightPatterns = [
    /white/i,
    /#f{3,6}/i,
    /rgb\s*\(\s*([2-9]\d{2}|1[5-9]\d|1\d{2}),/,
    /hsl\s*\([^)]*,\s*[^,)]*,\s*([7-9]\d|100)%\)/,
  ]

  return lightPatterns.some((pattern) => pattern.test(color))
}

/**
 * Generate theme styles for use in components
 */
export function getThemeStyles(config: ThemeConfiguration) {
  const styles: Record<string, string> = {}
  const customization = (config as ThemeConfigurationWithCustomization).customization

  applyCustomizationStyleOverrides(styles, customization)
  applyTypographyStyleOverrides(styles, config.typography)

  return styles
}

function applyCustomizationRootRules(
  rules: string[],
  customization: ThemeCustomization | null | undefined,
): void {
  if (!customization) return

  if (customization.primaryColor) {
    rules.push(`  --primary-custom: ${customization.primaryColor};`)
  }

  if (customization.accentColor) {
    rules.push(`  --accent-custom: ${customization.accentColor};`)
  }

  if (customization.backgroundColor) {
    rules.push(`  --background: ${customization.backgroundColor};`)
    rules.push(`  --card: ${customization.backgroundColor};`)
    rules.push(`  --popover: ${customization.backgroundColor};`)
  }

  if (customization.textColor) {
    rules.push(`  --foreground: ${customization.textColor};`)
  }
}

function applyBorderRadiusRule(rules: string[], config: ThemeConfiguration): void {
  if (!config.borderRadius) return

  const preset = borderRadiusPresets[config.borderRadius]
  if (!preset) return

  const cssEntries = Object.entries(preset.css)
  cssEntries.forEach(([property, value]) => {
    rules.push(`  ${property}: ${value};`)
  })

  const defaultRadius =
    preset.css['--radius-default'] ?? preset.css['--radius-medium'] ?? preset.css['--radius-large']
  if (defaultRadius) {
    rules.push(`  --radius: ${defaultRadius};`)
  }
}

function applyFontScaleRules(rules: string[], config: ThemeConfiguration): void {
  if (!config.fontScale) return

  const scaleValues: Record<string, string> = {
    small: '0.9',
    medium: '1',
    large: '1.1',
    xl: '1.25',
  }

  const scale = scaleValues[config.fontScale] ?? '1'
  rules.push(`  --font-scale: ${scale};`)
  rules.push(`  --theme-font-scale: ${scale};`)

  const baseSizes: Record<string, string> = {
    'text-xs': '0.75rem',
    'text-sm': '0.875rem',
    'text-base': '1rem',
    'text-lg': '1.125rem',
    'text-xl': '1.25rem',
    'text-2xl': '1.5rem',
    'text-3xl': '1.875rem',
    'text-4xl': '2.25rem',
  }

  Object.entries(baseSizes).forEach(([className, baseSize]) => {
    const scaledSize = parseFloat(baseSize) * parseFloat(scale)
    rules.push(`  --${className}: ${scaledSize}rem;`)
  })
}

function applySpacingRule(rules: string[], config: ThemeConfiguration): void {
  if (!config.spacing) return

  const spacingMultipliers: Record<string, string> = {
    compact: '0.75',
    medium: '1',
    spacious: '1.5',
  }

  const multiplier = spacingMultipliers[config.spacing] ?? '1'
  rules.push(`  --spacing-scale: ${multiplier};`)
  rules.push(`  --theme-spacing: ${multiplier};`)
}

function applyAnimationRule(rules: string[], config: ThemeConfiguration): void {
  if (!config.animationLevel) return

  const animationSettings: Record<string, { duration: string; easing: string; scale: string }> = {
    none: {
      duration: '0s',
      easing: 'linear',
      scale: '0',
    },
    reduced: {
      duration: '0.1s',
      easing: 'ease-out',
      scale: '0.5',
    },
    medium: {
      duration: '0.2s',
      easing: 'ease-out',
      scale: '1',
    },
    full: {
      duration: '0.3s',
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      scale: '1.2',
    },
  }

  const level = config.animationLevel as keyof typeof animationSettings
  const settings = animationSettings[level] ?? animationSettings.medium
  if (!settings) return
  rules.push(`  --animation-duration: ${settings.duration};`)
  rules.push(`  --animation-easing: ${settings.easing};`)
  rules.push(`  --animation-scale: ${settings.scale};`)
  rules.push(`  --theme-animation-level: ${config.animationLevel};`)
}

function applyTypographyRules(rules: string[], config: ThemeConfiguration): void {
  const typography = config.typography
  if (!typography) return

  if (typography.fontFamily) {
    rules.push(`  --typography-fontFamily: ${typography.fontFamily};`)
  }

  if (typography.headingFamily) {
    rules.push(`  --typography-headingFamily: ${typography.headingFamily};`)
  }

  if (typography.baseFontSize) {
    rules.push(`  --typography-baseFontSize: ${typography.baseFontSize};`)
  }

  if (typography.lineHeight) {
    rules.push(`  --typography-lineHeight: ${typography.lineHeight};`)
  }

  if (typography.fontWeights) {
    Object.entries(typography.fontWeights).forEach(([token, weight]) => {
      if (weight) {
        rules.push(`  --typography-fontWeights-${token}: ${weight};`)
      }
    })
  }

  if (typography.letterSpacing) {
    Object.entries(typography.letterSpacing).forEach(([token, value]) => {
      if (value) {
        rules.push(`  --typography-letterSpacing-${token}: ${value};`)
      }
    })
  }
}

function applyDarkModeOverrides(
  rules: string[],
  config: ThemeConfiguration,
  customization: ThemeCustomization | null | undefined,
  selector: string,
): void {
  if (config.colorMode !== 'dark' && config.colorMode !== 'auto') return

  rules.push('')
  rules.push('@media (prefers-color-scheme: dark) {')
  rules.push(`  ${selector} {`)

  if (customization?.backgroundColor && isLightBackground(customization.backgroundColor)) {
    rules.push(`    --background: hsl(224 71% 4%);`)
    rules.push(`    --card: hsl(224 71% 4%);`)
    rules.push(`    --popover: hsl(224 71% 4%);`)
  }

  if (customization?.textColor && !isLightBackground(customization.textColor)) {
    rules.push(`    --foreground: hsl(213 31% 91%);`)
  }

  rules.push('  }')
  rules.push('}')
}

function applyReducedMotionOverride(rules: string[], config: ThemeConfiguration): void {
  if (config.animationLevel !== 'none') return

  rules.push('')
  rules.push('@media (prefers-reduced-motion: reduce) {')
  rules.push('  *, *::before, *::after {')
  rules.push('    animation-duration: 0.01ms !important;')
  rules.push('    animation-iteration-count: 1 !important;')
  rules.push('    transition-duration: 0.01ms !important;')
  rules.push('    scroll-behavior: auto !important;')
  rules.push('  }')
  rules.push('}')
}

function appendCustomCSS(
  rules: string[],
  customization: ThemeCustomization | null | undefined,
): void {
  if (!customization?.customCSS) return

  rules.push('')
  rules.push('/* Custom CSS */')
  rules.push(customization.customCSS)
}

function applyCustomizationStyleOverrides(
  styles: Record<string, string>,
  customization: ThemeCustomization | null | undefined,
): void {
  if (!customization) return

  if (customization.primaryColor) {
    styles['--primary'] = customization.primaryColor
  }

  if (customization.accentColor) {
    styles['--accent'] = customization.accentColor
  }

  if (customization.backgroundColor) {
    styles['--background'] = customization.backgroundColor
    styles['--card'] = customization.backgroundColor
    styles['--popover'] = customization.backgroundColor
  }

  if (customization.textColor) {
    styles['--foreground'] = customization.textColor
  }
}

function applyTypographyStyleOverrides(
  styles: Record<string, string>,
  typography: ThemeTypographyPreset | null | undefined,
): void {
  if (!typography) return

  if (typography.fontFamily) {
    styles['--font-family-base'] = typography.fontFamily
  }

  if (typography.headingFamily) {
    styles['--font-family-heading'] = typography.headingFamily
  }

  if (typography.baseFontSize) {
    styles['--font-size-base'] = typography.baseFontSize
  }

  if (typography.lineHeight) {
    styles['--line-height-base'] = typography.lineHeight
  }
}
