import type { ThemeTypographyPreset } from '../presets.js'
import { borderRadiusPresets } from '../providers/Theme/themeConfig.js'
import type { ResolvedThemeConfiguration } from './resolveThemeConfiguration.js'

type ThemeConfiguration = Omit<ResolvedThemeConfiguration, 'typography'> & {
  typography?: ResolvedThemeConfiguration['typography']
}

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

  // ── :root block — CSS custom properties ─────────────────────────────────
  cssRules.push(`${themeSelector} {`)
  applyCustomizationRootRules(cssRules, customization)
  applyBorderRadiusRule(cssRules, config)
  applyFontScaleRules(cssRules, config)
  applySpacingRule(cssRules, config)
  applyAnimationRule(cssRules, config)
  applyTypographyRules(cssRules, config)
  applyVisualEffectsCSSVars(cssRules, config)
  applyComponentStyleCSSVars(cssRules, config)
  cssRules.push('}')

  // ── Element-level effect rules (outside :root) ──────────────────────────
  applyEffectElementRules(cssRules, config)

  // ── Color mode overrides ────────────────────────────────────────────────
  applyDarkModeOverrides(cssRules, config, customization, themeSelector)

  // ── Animation: none — respect prefers-reduced-motion ───────────────────
  applyReducedMotionOverride(cssRules, config)

  // ── Custom CSS ──────────────────────────────────────────────────────────
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

// ─── Visual Effects ────────────────────────────────────────────────────────

type VEConfig = {
  effectStyle?: string | null
  shadowIntensity?: string | null
  backdropBlur?: string | null
  borderStyle?: string | null
  borderWidth?: string | null
  glassOpacity?: number | null
}

type CSConfig = {
  buttonVariant?: string | null
  cardStyle?: string | null
  cardHoverEffect?: string | null
  navbarStyle?: string | null
}

function getVE(config: ThemeConfiguration): VEConfig | null {
  return (config as unknown as { visualEffects?: VEConfig | null }).visualEffects ?? null
}

function getCS(config: ThemeConfiguration): CSConfig | null {
  return (config as unknown as { componentStyles?: CSConfig | null }).componentStyles ?? null
}

const SHADOW_MAP: Record<string, string> = {
  none: 'none',
  subtle: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
  medium: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)',
  strong: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)',
  dramatic: '0 25px 50px -12px rgba(0,0,0,0.25)',
}

const BLUR_PX_MAP: Record<string, string> = {
  none: '0px',
  slight: '4px',
  medium: '8px',
  strong: '16px',
  heavy: '24px',
}

/**
 * CSS custom properties for visual effects (emitted inside :root {})
 */
function applyVisualEffectsCSSVars(rules: string[], config: ThemeConfiguration): void {
  const ve = getVE(config)
  if (!ve) return

  if (ve.effectStyle) rules.push(`  --effect-style: ${ve.effectStyle};`)
  if (ve.shadowIntensity) {
    rules.push(`  --shadow-intensity: ${ve.shadowIntensity};`)
    const shadow = SHADOW_MAP[ve.shadowIntensity]
    if (shadow) rules.push(`  --card-shadow: ${shadow};`)
  }
  if (ve.backdropBlur) {
    const blurPx = BLUR_PX_MAP[ve.backdropBlur] ?? '0px'
    rules.push(`  --backdrop-blur: ${blurPx};`)
  }
  if (ve.borderStyle) rules.push(`  --border-style: ${ve.borderStyle};`)
  if (ve.borderWidth) rules.push(`  --border-width: ${ve.borderWidth};`)
  if (ve.glassOpacity != null) {
    const opacity = Math.min(100, Math.max(0, ve.glassOpacity)) / 100
    rules.push(`  --glass-opacity: ${opacity.toFixed(2)};`)
  }

  // Always emit --card-bg-opacity and --card-backdrop-filter so .glass-card / .glass
  // fallback rules in consumer globals.css can be overridden regardless of cached state.
  // Glass effect: translucent card; all other effects: reset to opaque/none.
  const opacity = ve.glassOpacity != null ? (ve.glassOpacity / 100).toFixed(2) : '0.60'
  const blur = BLUR_PX_MAP[ve.backdropBlur ?? 'medium'] ?? '8px'
  rules.push(`  --card-bg-opacity: ${opacity};`)
  rules.push(`  --card-backdrop-filter: blur(${blur});`)
  rules.push(`  --card-bg-opacity-non-glass: 1.0;`)
  rules.push(`  --card-backdrop-filter-non-glass: none;`)
}

/**
 * CSS custom properties for component styles (emitted inside :root {})
 */
function applyComponentStyleCSSVars(rules: string[], config: ThemeConfiguration): void {
  const cs = getCS(config)
  if (!cs) return

  if (cs.buttonVariant) rules.push(`  --button-variant: ${cs.buttonVariant};`)
  if (cs.cardStyle) rules.push(`  --card-style: ${cs.cardStyle};`)
  if (cs.cardHoverEffect) rules.push(`  --card-hover-effect: ${cs.cardHoverEffect};`)
  if (cs.navbarStyle) rules.push(`  --navbar-style: ${cs.navbarStyle};`)
}

/**
 * Element-level CSS overrides based on effect + component styles.
 * These rules are emitted OUTSIDE the :root {} block so they target
 * actual DOM elements. They rely on data-effect-style / data-card-style
 * attributes set on <html> by layout.tsx (SSR) and ThemeProvider (client).
 */
function applyEffectElementRules(rules: string[], config: ThemeConfiguration): void {
  const ve = getVE(config)
  const cs = getCS(config)
  if (!ve && !cs) return

  rules.push('')
  rules.push('/* ── Effect element overrides ── */')

  // ── Glass effect ──────────────────────────────────────────────────────
  // NOTE: All effect-style blocks are ALWAYS emitted regardless of the saved
  // effectStyle value. The CSS selectors are scoped by html[data-effect-style='X']
  // so only the matching data-attribute activates the rules. This means the CSS
  // is always correct even when stale cached/draft data is served.
  {
    const opacity = ve?.glassOpacity != null ? ve.glassOpacity : 60
    const blur = BLUR_PX_MAP[ve?.backdropBlur ?? 'strong'] ?? '16px'
    rules.push(`html[data-effect-style='glass'] [data-card],`)
    rules.push(`html[data-effect-style='glass'] .glass-card,`)
    rules.push(`html[data-effect-style='glass'] .glass {`)
    rules.push(
      `  background-color: color-mix(in srgb, var(--card) ${opacity}%, transparent) !important;`,
    )
    rules.push(`  backdrop-filter: blur(${blur}) saturate(150%) !important;`)
    rules.push(`  -webkit-backdrop-filter: blur(${blur}) saturate(150%) !important;`)
    rules.push(`  border-color: color-mix(in srgb, var(--border) 40%, transparent) !important;`)
    rules.push(
      `  box-shadow: 0 4px 24px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.1) !important;`,
    )
    rules.push(`}`)
    rules.push(`html[data-effect-style='glass'] [data-card]:hover,`)
    rules.push(`html[data-effect-style='glass'] .glass-card:hover,`)
    rules.push(`html[data-effect-style='glass'] .glass:hover {`)
    rules.push(
      `  background-color: color-mix(in srgb, var(--card) ${Math.min(opacity + 10, 90)}%, transparent) !important;`,
    )
    rules.push(
      `  box-shadow: 0 8px 32px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.15) !important;`,
    )
    rules.push(`}`)
    rules.push(`html[data-effect-style='glass'] header, html[data-effect-style='glass'] nav {`)
    rules.push(
      `  background-color: color-mix(in srgb, var(--background) 65%, transparent) !important;`,
    )
    rules.push(`  backdrop-filter: blur(${blur}) saturate(150%) !important;`)
    rules.push(`  -webkit-backdrop-filter: blur(${blur}) saturate(150%) !important;`)
    rules.push(`}`)
  }

  // ── Neumorphic effect ──────────────────────────────────────────────────
  {
    rules.push(`html[data-effect-style='neumorphic'] [data-card],`)
    rules.push(`html[data-effect-style='neumorphic'] .glass-card,`)
    rules.push(`html[data-effect-style='neumorphic'] .glass {`)
    rules.push(`  background-color: var(--background) !important;`)
    rules.push(`  border: none !important;`)
    rules.push(`  backdrop-filter: none !important;`)
    rules.push(`  -webkit-backdrop-filter: none !important;`)
    rules.push(
      `  box-shadow: 6px 6px 12px rgba(0,0,0,0.12), -6px -6px 12px rgba(255,255,255,0.75) !important;`,
    )
    rules.push(`}`)
    rules.push(`html[data-effect-style='neumorphic'] [data-card]:hover,`)
    rules.push(`html[data-effect-style='neumorphic'] .glass-card:hover,`)
    rules.push(`html[data-effect-style='neumorphic'] .glass:hover {`)
    rules.push(
      `  box-shadow: 8px 8px 16px rgba(0,0,0,0.15), -8px -8px 16px rgba(255,255,255,0.85) !important;`,
    )
    rules.push(`}`)
    rules.push(`html[data-effect-style='neumorphic'][data-theme-mode='dark'] [data-card],`)
    rules.push(`html[data-effect-style='neumorphic'].dark [data-card],`)
    rules.push(`html[data-effect-style='neumorphic'][data-theme-mode='dark'] .glass-card,`)
    rules.push(`html[data-effect-style='neumorphic'].dark .glass-card {`)
    rules.push(
      `  box-shadow: 6px 6px 12px rgba(0,0,0,0.4), -6px -6px 12px rgba(255,255,255,0.04) !important;`,
    )
    rules.push(`}`)
  }

  // ── Clay effect ────────────────────────────────────────────────────────
  {
    rules.push(`html[data-effect-style='clay'] [data-card],`)
    rules.push(`html[data-effect-style='clay'] .glass-card,`)
    rules.push(`html[data-effect-style='clay'] .glass {`)
    rules.push(`  border-radius: var(--radius-large, 1.5rem) !important;`)
    rules.push(
      `  box-shadow: 4px 4px 0px rgba(0,0,0,0.22), 0 8px 20px rgba(0,0,0,0.08) !important;`,
    )
    rules.push(`  border: none !important;`)
    rules.push(`  backdrop-filter: none !important;`)
    rules.push(`  -webkit-backdrop-filter: none !important;`)
    rules.push(`  transition: transform 200ms ease, box-shadow 200ms ease !important;`)
    rules.push(`}`)
    rules.push(`html[data-effect-style='clay'] [data-card]:hover,`)
    rules.push(`html[data-effect-style='clay'] .glass-card:hover,`)
    rules.push(`html[data-effect-style='clay'] .glass:hover {`)
    rules.push(`  transform: translateY(-3px) !important;`)
    rules.push(
      `  box-shadow: 6px 6px 0px rgba(0,0,0,0.25), 0 12px 24px rgba(0,0,0,0.12) !important;`,
    )
    rules.push(`}`)
  }

  // ── Elevated effect ────────────────────────────────────────────────────
  {
    const shadow = ve?.shadowIntensity
      ? (SHADOW_MAP[ve.shadowIntensity] ?? SHADOW_MAP.medium)
      : SHADOW_MAP.medium
    rules.push(`html[data-effect-style='elevated'] [data-card],`)
    rules.push(`html[data-effect-style='elevated'] .glass-card,`)
    rules.push(`html[data-effect-style='elevated'] .glass {`)
    rules.push(`  box-shadow: ${shadow} !important;`)
    rules.push(`  border: none !important;`)
    rules.push(`  backdrop-filter: none !important;`)
    rules.push(`  -webkit-backdrop-filter: none !important;`)
    rules.push(`  transition: box-shadow 200ms ease, transform 200ms ease !important;`)
    rules.push(`}`)
    rules.push(`html[data-effect-style='elevated'] [data-card]:hover,`)
    rules.push(`html[data-effect-style='elevated'] .glass-card:hover,`)
    rules.push(`html[data-effect-style='elevated'] .glass:hover {`)
    rules.push(
      `  box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1) !important;`,
    )
    rules.push(`  transform: translateY(-2px) !important;`)
    rules.push(`}`)
  }

  // ── Flat effect ────────────────────────────────────────────────────────
  {
    rules.push(`html[data-effect-style='flat'] [data-card],`)
    rules.push(`html[data-effect-style='flat'] .glass-card,`)
    rules.push(`html[data-effect-style='flat'] .glass {`)
    rules.push(`  box-shadow: none !important;`)
    rules.push(`  backdrop-filter: none !important;`)
    rules.push(`  -webkit-backdrop-filter: none !important;`)
    rules.push(`}`)
  }
  // ── Border overrides ───────────────────────────────────────────────────
  if (ve?.borderWidth && ve.borderWidth !== '1px' && ve.borderWidth !== '0px') {
    rules.push(`html[data-border-width='${ve.borderWidth}'] [data-card],`)
    rules.push(`html[data-border-width='${ve.borderWidth}'] .glass-card {`)
    rules.push(`  border-width: ${ve.borderWidth} !important;`)
    rules.push(`}`)
  }

  // ── Card style: bordered (used by brutalism etc.) ──────────────────────
  if (cs?.cardStyle === 'bordered') {
    const bw = ve?.borderWidth ?? '2px'
    rules.push(`html[data-card-style='bordered'] [data-card],`)
    rules.push(`html[data-card-style='bordered'] .glass-card {`)
    rules.push(`  border-width: ${bw} !important;`)
    rules.push(`  border-style: solid !important;`)
    rules.push(`  border-color: var(--foreground) !important;`)
    rules.push(`  box-shadow: 4px 4px 0 var(--foreground) !important;`)
    rules.push(`  border-radius: 0 !important;`)
    rules.push(`  background-color: var(--card) !important;`)
    rules.push(`  backdrop-filter: none !important;`)
    rules.push(`  -webkit-backdrop-filter: none !important;`)
    rules.push(`}`)
    rules.push(`html[data-card-style='bordered'] [data-card]:hover,`)
    rules.push(`html[data-card-style='bordered'] .glass-card:hover {`)
    rules.push(`  box-shadow: 6px 6px 0 var(--foreground) !important;`)
    rules.push(`  transform: translate(-2px, -2px) !important;`)
    rules.push(`}`)
  }

  // ── Card style: gradient-border ────────────────────────────────────────
  if (cs?.cardStyle === 'gradient-border') {
    rules.push(`html[data-card-style='gradient-border'] [data-card],`)
    rules.push(`html[data-card-style='gradient-border'] .glass-card {`)
    rules.push(
      `  border-image: linear-gradient(135deg, var(--primary), var(--accent)) 1 !important;`,
    )
    rules.push(`  border-width: 2px !important;`)
    rules.push(`  border-style: solid !important;`)
    rules.push(`}`)
  }

  // ── Navbar styles ──────────────────────────────────────────────────────
  const navbarStyle = cs?.navbarStyle
  if (navbarStyle === 'blur') {
    rules.push(`html[data-navbar-style='blur'] header {`)
    rules.push(
      `  background-color: color-mix(in srgb, var(--background) 70%, transparent) !important;`,
    )
    rules.push(`  backdrop-filter: blur(12px) !important;`)
    rules.push(`  -webkit-backdrop-filter: blur(12px) !important;`)
    rules.push(`}`)
  } else if (navbarStyle === 'transparent') {
    rules.push(`html[data-navbar-style='transparent'] header {`)
    rules.push(`  background-color: transparent !important;`)
    rules.push(`  border-bottom-color: transparent !important;`)
    rules.push(`}`)
  } else if (navbarStyle === 'floating') {
    rules.push(`html[data-navbar-style='floating'] header {`)
    rules.push(`  margin: 12px 16px 0;`)
    rules.push(`  border-radius: var(--radius-large, 1.5rem);`)
    rules.push(`  border: 1px solid var(--border);`)
    rules.push(`  box-shadow: 0 4px 24px rgba(0,0,0,0.08);`)
    rules.push(`}`)
  } else if (navbarStyle === 'minimal') {
    rules.push(`html[data-navbar-style='minimal'] header {`)
    rules.push(`  border-bottom-color: transparent !important;`)
    rules.push(`  box-shadow: none !important;`)
    rules.push(`}`)
  }

  // ── Button variant: brutal ─────────────────────────────────────────────
  if (cs?.buttonVariant === 'brutal') {
    rules.push(`html[data-button-variant='brutal'] [data-btn] {`)
    rules.push(`  border: 2px solid var(--foreground) !important;`)
    rules.push(`  border-radius: 0 !important;`)
    rules.push(`  box-shadow: 3px 3px 0 var(--foreground) !important;`)
    rules.push(`  transition: box-shadow 100ms ease, transform 100ms ease !important;`)
    rules.push(`}`)
    rules.push(`html[data-button-variant='brutal'] [data-btn]:hover {`)
    rules.push(`  box-shadow: 5px 5px 0 var(--foreground) !important;`)
    rules.push(`  transform: translate(-2px, -2px) !important;`)
    rules.push(`}`)
    rules.push(`html[data-button-variant='brutal'] [data-btn]:active {`)
    rules.push(`  box-shadow: 1px 1px 0 var(--foreground) !important;`)
    rules.push(`  transform: translate(2px, 2px) !important;`)
    rules.push(`}`)
  }

  // ── Button variant: pill ───────────────────────────────────────────────
  if (cs?.buttonVariant === 'pill') {
    rules.push(`html[data-button-variant='pill'] [data-btn] {`)
    rules.push(`  border-radius: 9999px !important;`)
    rules.push(`}`)
  }

  // ── Button variant: ghost ──────────────────────────────────────────────
  if (cs?.buttonVariant === 'outlined') {
    rules.push(`html[data-button-variant='outlined'] [data-btn] {`)
    rules.push(`  background-color: transparent !important;`)
    rules.push(`  border: 1px solid var(--border) !important;`)
    rules.push(`  box-shadow: none !important;`)
    rules.push(`}`)
  }

  // ── Card hover effects ─────────────────────────────────────────────────
  if (cs?.cardHoverEffect === 'lift') {
    rules.push(`html[data-card-hover='lift'] [data-card]:hover,`)
    rules.push(`html[data-card-hover='lift'] .glass-card:hover {`)
    rules.push(`  transform: translateY(-6px) !important;`)
    rules.push(`  box-shadow: 0 20px 40px rgba(0,0,0,0.12) !important;`)
    rules.push(`}`)
  } else if (cs?.cardHoverEffect === 'scale') {
    rules.push(`html[data-card-hover='scale'] [data-card]:hover,`)
    rules.push(`html[data-card-hover='scale'] .glass-card:hover {`)
    rules.push(`  transform: scale(1.02) !important;`)
    rules.push(`}`)
  } else if (cs?.cardHoverEffect === 'glow') {
    rules.push(`html[data-card-hover='glow'] [data-card]:hover,`)
    rules.push(`html[data-card-hover='glow'] .glass-card:hover {`)
    rules.push(
      `  box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary) 25%, transparent), 0 8px 32px rgba(0,0,0,0.1) !important;`,
    )
    rules.push(`}`)
  } else if (cs?.cardHoverEffect === 'tilt') {
    rules.push(`html[data-card-hover='tilt'] [data-card],`)
    rules.push(`html[data-card-hover='tilt'] .glass-card {`)
    rules.push(`  transition: transform 200ms ease !important;`)
    rules.push(`}`)
    rules.push(`html[data-card-hover='tilt'] [data-card]:hover,`)
    rules.push(`html[data-card-hover='tilt'] .glass-card:hover {`)
    rules.push(`  transform: perspective(1000px) rotateX(2deg) rotateY(-2deg) !important;`)
    rules.push(`}`)
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
