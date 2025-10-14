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
 * Maps OKLCH color to RGB/HSL for Payload compatibility
 */
function convertOklchColor(oklch: string): string {
  // For now, return the OKLCH as-is since browsers support it
  // Could add polyfill conversion if needed
  return oklch
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
  const typography = light['font-sans'] ? {
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
  } : undefined
  
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
