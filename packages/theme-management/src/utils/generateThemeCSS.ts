import type { ThemePreset } from '../presets.js'
import { borderRadiusPresets } from '../providers/Theme/themeConfig.js'

/**
 * Generates complete CSS for a theme preset
 * Creates both light and dark mode CSS variables
 */
export function generateThemeCSS(preset: ThemePreset): string {
  const { name, label, borderRadius, typography, lightMode, darkMode } = preset

  const rootLines: string[] = []
  const darkLines: string[] = []

  // Typography
  const typographyPreset = typography ?? getDefaultTypography()
  pushTypography(rootLines, typographyPreset)

  // Layout (shared across themes)
  pushLayoutDefaults(rootLines)

  // Border radius based on preset definition
  pushBorderRadius(rootLines, borderRadius)

  // Component system defaults derived from colors
  pushComponentDefaults(rootLines, lightMode)

  // Light mode colours
  pushColorTokens(rootLines, lightMode, 'light')

  // Shared status colors (can be overridden later)
  pushStatusColors(rootLines, 'light')

  // Dark mode colors
  pushColorTokens(darkLines, darkMode, 'dark')
  pushStatusColors(darkLines, 'dark')
  pushDarkModeComponentOverrides(darkLines, darkMode)

  const sections: string[] = []
  sections.push(`/* ${label} Theme */`)
  sections.push(buildCssBlock(`[data-theme='${name}']`, rootLines))

  sections.push(`
/* ${label} Theme - Dark Mode */`)
  sections.push(buildCssBlock(`[data-theme='${name}'][data-theme-mode='dark']`, darkLines))

  return sections.join('\n').trim()
}

/**
 * Convert HEX color to HSL format
 * Example: #3b82f6 -> hsl(221, 83%, 53%)
 */
function hexToHsl(hex: string): string {
  let normalized = hex.trim()
  if (!normalized.startsWith('#')) {
    normalized = `#${normalized}`
  }

  if (normalized.length === 4) {
    normalized = `#${normalized[1]}${normalized[1]}${normalized[2]}${normalized[2]}${normalized[3]}${normalized[3]}`
  }

  const r = parseInt(normalized.substring(1, 3), 16) / 255
  const g = parseInt(normalized.substring(3, 5), 16) / 255
  const b = parseInt(normalized.substring(5, 7), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      case b:
        h = ((r - g) / d + 4) / 6
        break
    }
  }

  const hDeg = Math.round(h * 360)
  const sPercent = Math.round(s * 100)
  const lPercent = Math.round(l * 100)

  return `hsl(${hDeg}, ${sPercent}%, ${lPercent}%)`
}

function toCssColor(color?: string | null): string | null {
  if (!color) return null
  const trimmed = color.trim()
  if (/^var\(/i.test(trimmed) || /^hsl\(/i.test(trimmed) || /^rgb(a)?\(/i.test(trimmed)) {
    return trimmed
  }
  if (/^#?[0-9a-f]{6}$/i.test(trimmed) || /^#?[0-9a-f]{3}$/i.test(trimmed)) {
    return hexToHsl(trimmed)
  }
  return trimmed
}

function buildCssBlock(selector: string, lines: string[]): string {
  if (!lines.length) {
    return `${selector} {}`
  }

  const body = lines.map((line) => (line.startsWith('--') ? `  ${line}` : line)).join('\n')
  return `${selector} {\n${body}\n}`
}

function pushTypography(lines: string[], typography: NonNullable<ThemePreset['typography']>): void {
  const {
    fontFamily,
    headingFamily,
    baseFontSize,
    lineHeight,
    fontWeights = {},
    letterSpacing = {},
  } = typography

  if (fontFamily) lines.push(`--typography-fontFamily: ${fontFamily};`)
  if (headingFamily) lines.push(`--typography-headingFamily: ${headingFamily};`)
  if (baseFontSize) lines.push(`--typography-baseFontSize: ${baseFontSize};`)
  if (lineHeight) lines.push(`--typography-lineHeight: ${lineHeight};`)

  Object.entries(fontWeights).forEach(([token, weight]) => {
    if (weight) {
      lines.push(`--typography-fontWeights-${token}: ${weight};`)
    }
  })

  Object.entries(letterSpacing).forEach(([token, value]) => {
    if (value) {
      lines.push(`--typography-letterSpacing-${token}: ${value};`)
    }
  })
}

function pushLayoutDefaults(lines: string[]): void {
  lines.push('--layout-containerWidth: 1440px;')
  lines.push('--layout-containerPadding: 1.5rem;')
  lines.push('--layout-containerPaddingTablet: 2.5rem;')
  lines.push('--layout-containerPaddingDesktop: 3rem;')
  lines.push('--layout-sectionSpacing: 5rem;')
  lines.push('--layout-sectionSpacingTablet: 7rem;')
  lines.push('--layout-sectionSpacingDesktop: 9rem;')
  lines.push('--layout-gridGap: 2rem;')
  lines.push('--layout-gridGapTablet: 2.5rem;')
  lines.push('--layout-gridGapDesktop: 3rem;')
}

function pushBorderRadius(lines: string[], borderRadius?: ThemePreset['borderRadius']): void {
  const presetKey = borderRadius ?? 'medium'
  const preset = borderRadiusPresets[presetKey]

  if (preset?.css) {
    Object.entries(preset.css).forEach(([token, value]) => {
      lines.push(`${token}: ${value};`)
    })

    const defaultRadius =
      preset.css['--radius-default'] ??
      preset.css['--radius-medium'] ??
      preset.css['--radius-large'] ??
      preset.css['--radius']

    if (defaultRadius) {
      lines.push(`--radius: ${defaultRadius};`)
    }
  }
}

function pushComponentDefaults(lines: string[], lightMode?: ThemePreset['lightMode']): void {
  lines.push('--components-button-padding: 1rem 2.5rem;')
  lines.push('--components-button-padding-large: 1.25rem 3rem;')
  lines.push('--components-button-transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);')
  lines.push('--components-button-hover-scale: 1.02;')
  lines.push('--components-button-hover-opacity: 0.9;')
  lines.push('--components-button-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);')
  lines.push('--components-button-hover-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);')

  lines.push('--components-card-padding: 2.5rem;')
  lines.push('--components-card-padding-compact: 1.5rem;')
  lines.push(
    '--components-card-shadow: 0 4px 16px -4px rgba(34, 42, 69, 0.12), 0 2px 8px -2px rgba(34, 42, 69, 0.08);',
  )
  lines.push(
    '--components-card-hover-shadow: 0 12px 48px -12px rgba(34, 42, 69, 0.2), 0 8px 32px -8px rgba(34, 42, 69, 0.12);',
  )
  lines.push('--components-card-hover-transform: translateY(-8px) scale(1.02);')

  const borderColor = toCssColor(lightMode?.border)
  if (borderColor) {
    lines.push(`--components-card-border: 1px solid ${borderColor};`)
    lines.push(`--components-input-border: 1.5px solid ${borderColor};`)
  }

  const primaryColor = toCssColor(lightMode?.primary)
  if (primaryColor) {
    lines.push(`--components-input-focus-border: 2px solid ${primaryColor};`)
  }

  lines.push('--components-input-height: 3.5rem;')
  lines.push('--components-input-padding: 1.25rem 1.75rem;')
}

const COLOR_TOKENS: Array<{
  key: keyof NonNullable<ThemePreset['lightMode']>
  wrapWithVar?: boolean
}> = [
  { key: 'background' },
  { key: 'foreground' },
  { key: 'card' },
  { key: 'cardForeground' },
  { key: 'popover' },
  { key: 'popoverForeground' },
  { key: 'primary', wrapWithVar: true },
  { key: 'primaryForeground' },
  { key: 'secondary' },
  { key: 'secondaryForeground' },
  { key: 'muted' },
  { key: 'mutedForeground' },
  { key: 'accent', wrapWithVar: true },
  { key: 'accentForeground' },
  { key: 'destructive' },
  { key: 'destructiveForeground' },
  { key: 'border' },
  { key: 'input' },
  { key: 'ring' },
]

function pushColorTokens(
  lines: string[],
  colors: ThemePreset['lightMode'] | ThemePreset['darkMode'],
  mode: 'light' | 'dark',
): void {
  if (!colors) return

  COLOR_TOKENS.forEach(({ key, wrapWithVar }) => {
    const value = toCssColor(colors[key])
    if (!value) return

    if (key === 'ring') {
      lines.push('--ring: var(--primary);')
      return
    }

    if (wrapWithVar) {
      const customVar = key === 'accent' ? '--accent-custom' : '--primary-custom'
      lines.push(`--${toKebab(key)}: var(${customVar}, ${value});`)
    } else {
      lines.push(`--${toKebab(key)}: ${value};`)
    }
  })

  if (mode === 'light') {
    lines.push('--primary-hover: color-mix(in hsl, var(--primary), black 10%);')
    lines.push('--secondary-hover: color-mix(in hsl, var(--secondary), black 10%);')
    lines.push('--accent-hover: color-mix(in hsl, var(--accent), white 10%);')
  } else {
    lines.push('--primary-hover: color-mix(in hsl, var(--primary), white 10%);')
    lines.push('--secondary-hover: color-mix(in hsl, var(--secondary), white 10%);')
    lines.push('--accent-hover: color-mix(in hsl, var(--accent), white 10%);')
  }
}

function pushStatusColors(lines: string[], mode: 'light' | 'dark'): void {
  if (mode === 'light') {
    lines.push('--success: hsl(120, 60%, 40%);')
    lines.push('--success-foreground: hsl(0, 0%, 100%);')
    lines.push('--warning: hsl(42, 85%, 55%);')
    lines.push('--warning-foreground: hsl(25, 15%, 15%);')
    lines.push('--error: hsl(0, 85%, 52%);')
    lines.push('--error-foreground: hsl(0, 0%, 100%);')
    lines.push('--info: var(--primary);')
    lines.push('--info-foreground: var(--primary-foreground);')
  } else {
    lines.push('--success: hsl(120, 60%, 50%);')
    lines.push('--success-foreground: hsl(0, 0%, 10%);')
    lines.push('--warning: hsl(42, 85%, 55%);')
    lines.push('--warning-foreground: hsl(0, 0%, 10%);')
    lines.push('--error: hsl(0, 85%, 52%);')
    lines.push('--error-foreground: hsl(0, 0%, 100%);')
    lines.push('--info: var(--primary);')
    lines.push('--info-foreground: var(--primary-foreground);')
  }
}

function pushDarkModeComponentOverrides(lines: string[], darkMode?: ThemePreset['darkMode']): void {
  lines.push(
    '--components-card-shadow: 0 8px 32px -8px rgba(0, 0, 0, 0.6), 0 4px 16px -4px rgba(0, 0, 0, 0.4);',
  )
  lines.push(
    '--components-card-hover-shadow: 0 16px 64px -16px rgba(0, 0, 0, 0.8), 0 12px 40px -12px rgba(0, 0, 0, 0.6);',
  )

  const borderColor = toCssColor(darkMode?.border)
  if (borderColor) {
    lines.push(`--components-card-border: 1px solid ${borderColor};`)
  }

  const primaryColor = toCssColor(darkMode?.primary)
  if (primaryColor) {
    lines.push(`--components-input-focus-border: 2px solid ${primaryColor};`)
  }
}

function toKebab(token: string): string {
  return token.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)
}

function getDefaultTypography(): NonNullable<ThemePreset['typography']> {
  return {
    fontFamily: 'var(--font-geist-sans)',
    headingFamily: 'var(--font-outfit)',
    baseFontSize: '16px',
    lineHeight: '1.75',
    fontWeights: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      black: '900',
    },
    letterSpacing: {
      tight: '-0.02em',
      normal: '0',
      wide: '0.025em',
      wider: '0.05em',
    },
  }
}

/**
 * Generate CSS for all themes
 */
export function generateAllThemesCSS(presets: ThemePreset[]): string {
  return presets.map((preset) => generateThemeCSS(preset)).join('\n\n')
}
