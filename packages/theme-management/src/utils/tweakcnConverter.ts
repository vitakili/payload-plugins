/**
 * Converts TweakCN theme presets to sta  // Extract lightness from oklch(L C H) or oklch(L C H / A)
  const match = color.match(/oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*[\d.]+%?)?\)/)
  if (!match) return 'hsl(217, 91%, 60%)' // fallback bluerd ThemePreset format
 */

import type { ExtendedThemePreset } from '../extended-presets.js'
import type { ThemePreset } from '../presets.js'
import { tweakcnThemePresets } from '../tweakcn-presets.js'

/**
 * Converts OKLCH color to HSL for preview
 * Handles CSS variables by using fallback values
 */
function oklchToPreviewColor(color: string): string {
  // Handle CSS variables - convert to HSL approximation
  if (color.startsWith('var(')) {
    const hexFallback = colorVarFallbacks[color]
    if (hexFallback) {
      // Convert HEX to HSL for preview
      const r = parseInt(hexFallback.slice(1, 3), 16) / 255
      const g = parseInt(hexFallback.slice(3, 5), 16) / 255
      const b = parseInt(hexFallback.slice(5, 7), 16) / 255

      const max = Math.max(r, g, b)
      const min = Math.min(r, g, b)
      const l = (max + min) / 2
      let h = 0
      let s = 0

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

      return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`
    }
    return 'hsl(217, 91%, 60%)' // fallback blue
  }

  // Extract lightness from oklch(L C H)
  const match = color.match(/oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)\)/)
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
 * Common CSS color variable fallbacks
 * Maps var(--color-X-Y) to approximate HEX values
 */
const colorVarFallbacks: Record<string, string> = {
  // Blue
  'var(--color-blue-50)': '#eff6ff',
  'var(--color-blue-100)': '#dbeafe',
  'var(--color-blue-200)': '#bfdbfe',
  'var(--color-blue-300)': '#93c5fd',
  'var(--color-blue-400)': '#60a5fa',
  'var(--color-blue-500)': '#3b82f6',
  'var(--color-blue-600)': '#2563eb',
  'var(--color-blue-700)': '#1d4ed8',
  'var(--color-blue-800)': '#1e40af',
  'var(--color-blue-900)': '#1e3a8a',
  // Violet
  'var(--color-violet-50)': '#f5f3ff',
  'var(--color-violet-100)': '#ede9fe',
  'var(--color-violet-200)': '#ddd6fe',
  'var(--color-violet-300)': '#c4b5fd',
  'var(--color-violet-400)': '#a78bfa',
  'var(--color-violet-500)': '#8b5cf6',
  'var(--color-violet-600)': '#7c3aed',
  'var(--color-violet-700)': '#6d28d9',
  'var(--color-violet-800)': '#5b21b6',
  'var(--color-violet-900)': '#4c1d95',
  // Green
  'var(--color-green-50)': '#f0fdf4',
  'var(--color-green-100)': '#dcfce7',
  'var(--color-green-200)': '#bbf7d0',
  'var(--color-green-300)': '#86efac',
  'var(--color-green-400)': '#4ade80',
  'var(--color-green-500)': '#22c55e',
  'var(--color-green-600)': '#16a34a',
  'var(--color-green-700)': '#15803d',
  'var(--color-green-800)': '#166534',
  'var(--color-green-900)': '#14532d',
  // Red
  'var(--color-red-50)': '#fef2f2',
  'var(--color-red-100)': '#fee2e2',
  'var(--color-red-200)': '#fecaca',
  'var(--color-red-300)': '#fca5a5',
  'var(--color-red-400)': '#f87171',
  'var(--color-red-500)': '#ef4444',
  'var(--color-red-600)': '#dc2626',
  'var(--color-red-700)': '#b91c1c',
  'var(--color-red-800)': '#991b1b',
  'var(--color-red-900)': '#7f1d1d',
  // Yellow
  'var(--color-yellow-50)': '#fefce8',
  'var(--color-yellow-100)': '#fef9c3',
  'var(--color-yellow-200)': '#fef08a',
  'var(--color-yellow-300)': '#fde047',
  'var(--color-yellow-400)': '#facc15',
  'var(--color-yellow-500)': '#eab308',
  'var(--color-yellow-600)': '#ca8a04',
  'var(--color-yellow-700)': '#a16207',
  'var(--color-yellow-800)': '#854d0e',
  'var(--color-yellow-900)': '#713f12',
  // Lime
  'var(--color-lime-50)': '#f7fee7',
  'var(--color-lime-100)': '#ecfccb',
  'var(--color-lime-200)': '#d9f99d',
  'var(--color-lime-300)': '#bef264',
  'var(--color-lime-400)': '#a3e635',
  'var(--color-lime-500)': '#84cc16',
  'var(--color-lime-600)': '#65a30d',
  'var(--color-lime-700)': '#4d7c0f',
  'var(--color-lime-800)': '#3f6212',
  'var(--color-lime-900)': '#365314',
  // Orange
  'var(--color-orange-50)': '#fff7ed',
  'var(--color-orange-100)': '#ffedd5',
  'var(--color-orange-200)': '#fed7aa',
  'var(--color-orange-300)': '#fdba74',
  'var(--color-orange-400)': '#fb923c',
  'var(--color-orange-500)': '#f97316',
  'var(--color-orange-600)': '#ea580c',
  'var(--color-orange-700)': '#c2410c',
  'var(--color-orange-800)': '#9a3412',
  'var(--color-orange-900)': '#7c2d12',
  // Rose
  'var(--color-rose-50)': '#fff1f2',
  'var(--color-rose-100)': '#ffe4e6',
  'var(--color-rose-200)': '#fecdd3',
  'var(--color-rose-300)': '#fda4af',
  'var(--color-rose-400)': '#fb7185',
  'var(--color-rose-500)': '#f43f5e',
  'var(--color-rose-600)': '#e11d48',
  'var(--color-rose-700)': '#be123c',
  'var(--color-rose-800)': '#9f1239',
  'var(--color-rose-900)': '#881337',
  // Zinc (neutral grays)
  'var(--color-zinc-50)': '#fafafa',
  'var(--color-zinc-100)': '#f4f4f5',
  'var(--color-zinc-200)': '#e4e4e7',
  'var(--color-zinc-300)': '#d4d4d8',
  'var(--color-zinc-400)': '#a1a1aa',
  'var(--color-zinc-500)': '#71717a',
  'var(--color-zinc-600)': '#52525b',
  'var(--color-zinc-700)': '#3f3f46',
  'var(--color-zinc-800)': '#27272a',
  'var(--color-zinc-900)': '#18181b',
}

/**
 * Maps OKLCH color to HEX for Payload compatibility
 * Converts OKLCH to RGB then to HEX, or uses fallback for CSS variables
 */
function convertOklchColor(color: string): string {
  // Handle CSS variables
  if (color.startsWith('var(')) {
    const fallback = colorVarFallbacks[color]
    if (fallback) {
      return fallback
    }
    console.warn(`No fallback found for CSS variable: ${color}`)
    return '#3b82f6' // fallback blue
  }

  // Extract values from oklch(L C H) or oklch(L C H / A)
  const match = color.match(/oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*[\d.]+%?)?\)/)
  if (!match) {
    console.warn(`Invalid OKLCH format: ${color}`)
    return '#3b82f6' // fallback blue
  }

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
