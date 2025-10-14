/**
 * Converts TweakCN theme presets to standard ThemePreset format
 */

import type { ExtendedThemePreset } from '../extended-presets.js'
import type { ThemePreset } from '../presets.js'
import { tweakcnThemePresets } from '../tweakcn-presets.js'

/**
 * Converts OKLCH color to HSL for preview
 * Simple extraction - takes the lightness value
 */
function oklchToPreviewColor(oklch: string): string {
  // Extract lightness from oklch(L C H)
  const match = oklch.match(/oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)\)/)
  if (!match) return '#3b82f6' // fallback blue

  const [, l, c, h] = match
  const lightness = Math.round(parseFloat(l) * 100)
  const chroma = parseFloat(c)
  const hue = parseFloat(h)

  // Convert to HSL approximation for preview
  const saturation = Math.min(100, Math.round(chroma * 100))

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`
}

/**
 * Maps OKLCH color to HEX for Payload compatibility
 * Converts OKLCH to RGB then to HEX
 */
function convertOklchColor(oklch: string): string {
  // Extract values from oklch(L C H)
  const match = oklch.match(/oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)\)/)
  if (!match) return '#3b82f6' // fallback blue

  const [, l, c, h] = match
  const lightness = parseFloat(l)
  const chroma = parseFloat(c)
  const hue = parseFloat(h)

  // Convert OKLCH to linear RGB
  // This is a simplified conversion - OKLCH->OKLab->Linear RGB->sRGB
  const hueRad = (hue * Math.PI) / 180

  // OKLab coordinates
  const a = chroma * Math.cos(hueRad)
  const b = chroma * Math.sin(hueRad)

  // OKLab to linear RGB (simplified matrix multiplication)
  const l_ = lightness + 0.3963377774 * a + 0.2158037573 * b
  const m_ = lightness - 0.1055613458 * a - 0.0638541728 * b
  const s_ = lightness - 0.0894841775 * a - 1.291485548 * b

  const l3 = l_ * l_ * l_
  const m3 = m_ * m_ * m_
  const s3 = s_ * s_ * s_

  let r = +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3
  let g = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3
  let bl = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3

  // Clamp to [0, 1]
  r = Math.max(0, Math.min(1, r))
  g = Math.max(0, Math.min(1, g))
  bl = Math.max(0, Math.min(1, bl))

  // Convert to sRGB (gamma correction)
  const toSRGB = (c: number) => {
    return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055
  }

  r = toSRGB(r)
  g = toSRGB(g)
  bl = toSRGB(bl)

  // Convert to HEX
  const toHex = (c: number) => {
    const hex = Math.round(c * 255).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }

  return `#${toHex(r)}${toHex(g)}${toHex(bl)}`
}

/**
 * Converts ExtendedThemePreset to ThemePreset
 */
export function convertTweakCNPreset(extended: ExtendedThemePreset): ThemePreset {
  const { label, value, styles } = extended
  const { light, dark } = styles

  // Extract border radius
  const radiusValue = light.radius ?? '0.5rem'
  let borderRadius: ThemePreset['borderRadius']

  if (radiusValue === '0' || radiusValue === '0px' || radiusValue === '0rem') {
    borderRadius = 'none'
  } else if (parseFloat(radiusValue) <= 0.25) {
    borderRadius = 'small'
  } else if (parseFloat(radiusValue) <= 0.5) {
    borderRadius = 'medium'
  } else if (parseFloat(radiusValue) <= 0.75) {
    borderRadius = 'large'
  } else {
    borderRadius = 'xl'
  }

  // Convert light mode colors
  const lightMode: Record<string, string> = {
    background: convertOklchColor(light.background),
    foreground: convertOklchColor(light.foreground),
    card: convertOklchColor(light.card),
    cardForeground: convertOklchColor(light['card-foreground']),
    popover: convertOklchColor(light.popover),
    popoverForeground: convertOklchColor(light['popover-foreground']),
    primary: convertOklchColor(light.primary),
    primaryForeground: convertOklchColor(light['primary-foreground']),
    secondary: convertOklchColor(light.secondary),
    secondaryForeground: convertOklchColor(light['secondary-foreground']),
    muted: convertOklchColor(light.muted),
    mutedForeground: convertOklchColor(light['muted-foreground']),
    accent: convertOklchColor(light.accent),
    accentForeground: convertOklchColor(light['accent-foreground']),
    destructive: convertOklchColor(light.destructive),
    destructiveForeground: convertOklchColor(light['destructive-foreground']),
    border: convertOklchColor(light.border),
    input: convertOklchColor(light.input),
    ring: convertOklchColor(light.ring),
  }

  // Convert dark mode colors
  const darkMode: Record<string, string> = {
    background: convertOklchColor(dark.background),
    foreground: convertOklchColor(dark.foreground),
    card: convertOklchColor(dark.card),
    cardForeground: convertOklchColor(dark['card-foreground']),
    popover: convertOklchColor(dark.popover),
    popoverForeground: convertOklchColor(dark['popover-foreground']),
    primary: convertOklchColor(dark.primary),
    primaryForeground: convertOklchColor(dark['primary-foreground']),
    secondary: convertOklchColor(dark.secondary),
    secondaryForeground: convertOklchColor(dark['secondary-foreground']),
    muted: convertOklchColor(dark.muted),
    mutedForeground: convertOklchColor(dark['muted-foreground']),
    accent: convertOklchColor(dark.accent),
    accentForeground: convertOklchColor(dark['accent-foreground']),
    destructive: convertOklchColor(dark.destructive),
    destructiveForeground: convertOklchColor(dark['destructive-foreground']),
    border: convertOklchColor(dark.border),
    input: convertOklchColor(dark.input),
    ring: convertOklchColor(dark.ring),
  }

  // Generate preview colors
  const preview = {
    colors: {
      primary: oklchToPreviewColor(light.primary),
      background: oklchToPreviewColor(light.background),
      accent: oklchToPreviewColor(light.accent),
    },
  }

  // Typography configuration
  const typography = light['font-sans']
    ? {
        fontFamily: light['font-sans'],
        headingFamily: light['font-sans'],
        baseFontSize: '16px',
        lineHeight: '1.6',
        fontWeights: {
          normal: '400',
          medium: '500',
          semibold: '600',
          bold: '700',
        },
        letterSpacing: {
          normal: '0',
          wide: '0.025em',
        },
      }
    : undefined

  return {
    name: `tweakcn-${value}`,
    label: `${label} (TweakCN)`,
    borderRadius,
    preview,
    lightMode,
    darkMode,
    typography,
  }
}

/**
 * Converts all TweakCN presets to ThemePreset format
 */
export function getAllTweakCNPresets(): ThemePreset[] {
  return Object.values(tweakcnThemePresets).map(convertTweakCNPreset)
}
