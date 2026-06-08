import Color from 'color'
import { getContrastRatio, suggestAccessibleColor } from './contrast.js'

/**
 * Generate a complete, harmonious light + dark colour palette from a single
 * brand colour using colour theory (hue preserved, lightness/saturation derived).
 * Foreground colours are nudged to meet WCAG AA where needed.
 *
 * Output keys match the plugin's colour-mode tokens, so the result can be
 * dispatched straight into `themeConfiguration.lightMode` / `.darkMode`.
 */

export type GeneratedColorMode = {
  background: string
  foreground: string
  card: string
  cardForeground: string
  popover: string
  popoverForeground: string
  primary: string
  primaryForeground: string
  secondary: string
  secondaryForeground: string
  muted: string
  mutedForeground: string
  accent: string
  accentForeground: string
  destructive: string
  destructiveForeground: string
  border: string
  input: string
  ring: string
}

export type GeneratedPalette = {
  lightMode: GeneratedColorMode
  darkMode: GeneratedColorMode
}

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value))

/** Build a hex colour from HSL channels. */
const hsl = (h: number, s: number, l: number): string =>
  Color(`hsl(${Math.round(h)}, ${clamp(s, 0, 100)}%, ${clamp(l, 0, 100)}%)`)
    .hex()
    .toString()

/** Pick black or white (whichever has higher contrast), then nudge to AA. */
const readableOn = (background: string): string => {
  const white = getContrastRatio('#ffffff', background) ?? 0
  const black = getContrastRatio('#000000', background) ?? 0
  const base = white >= black ? '#ffffff' : '#000000'
  if ((base === '#ffffff' ? white : black) >= 4.5) return base
  return suggestAccessibleColor(base, background, 4.5) ?? base
}

export interface GeneratePaletteOptions {
  /** Fixed destructive/danger colour. Defaults to a balanced red. */
  destructive?: string
}

export function generatePaletteFromColor(
  seed: string,
  options: GeneratePaletteOptions = {},
): GeneratedPalette {
  let h = 220
  let s = 70
  try {
    const obj = Color(seed).hsl().object()
    h = obj.h ?? h
    s = obj.s ?? s
  } catch {
    /* keep defaults if the seed can't be parsed */
  }

  const destructive = options.destructive ?? hsl(0, 72, 51)
  const tint = (sat: number) => clamp(sat, 0, 100)

  // ── Light mode ──────────────────────────────────────────────
  const lightPrimary = hsl(h, tint(s), 50)
  const lightMode: GeneratedColorMode = {
    background: hsl(h, tint(s * 0.18), 99),
    foreground: hsl(h, tint(s * 0.25), 12),
    card: hsl(h, tint(s * 0.12), 100),
    cardForeground: hsl(h, tint(s * 0.25), 12),
    popover: hsl(h, tint(s * 0.12), 100),
    popoverForeground: hsl(h, tint(s * 0.25), 12),
    primary: lightPrimary,
    primaryForeground: readableOn(lightPrimary),
    secondary: hsl(h, tint(s * 0.35), 94),
    secondaryForeground: hsl(h, tint(s), 22),
    muted: hsl(h, tint(s * 0.22), 95),
    mutedForeground: hsl(h, tint(s * 0.2), 38),
    accent: hsl(h, tint(s * 0.5), 92),
    accentForeground: hsl(h, tint(s), 22),
    destructive,
    destructiveForeground: '#ffffff',
    border: hsl(h, tint(s * 0.2), 88),
    input: hsl(h, tint(s * 0.2), 88),
    ring: lightPrimary,
  }

  // ── Dark mode (inverted lightness, slightly desaturated surfaces) ──
  const darkPrimary = hsl(h, tint(s), 58)
  const darkMode: GeneratedColorMode = {
    background: hsl(h, tint(s * 0.25), 8),
    foreground: hsl(h, tint(s * 0.1), 96),
    card: hsl(h, tint(s * 0.22), 11),
    cardForeground: hsl(h, tint(s * 0.1), 96),
    popover: hsl(h, tint(s * 0.22), 11),
    popoverForeground: hsl(h, tint(s * 0.1), 96),
    primary: darkPrimary,
    primaryForeground: readableOn(darkPrimary),
    secondary: hsl(h, tint(s * 0.25), 18),
    secondaryForeground: hsl(h, tint(s * 0.1), 94),
    muted: hsl(h, tint(s * 0.2), 17),
    mutedForeground: hsl(h, tint(s * 0.15), 64),
    accent: hsl(h, tint(s * 0.3), 22),
    accentForeground: hsl(h, tint(s * 0.1), 94),
    destructive: hsl(0, 62, 50),
    destructiveForeground: '#ffffff',
    border: hsl(h, tint(s * 0.2), 22),
    input: hsl(h, tint(s * 0.2), 22),
    ring: darkPrimary,
  }

  return { lightMode, darkMode }
}

/**
 * Extract a few dominant colours from an image element (browser only) via a
 * downsampled canvas and coarse colour bucketing. Returns hex strings ordered by
 * a saturation-weighted frequency score (so brand colours rank above greys),
 * suitable as seeds for {@link generatePaletteFromColor}.
 */
export function extractDominantColors(image: HTMLImageElement, count = 5): string[] {
  if (typeof document === 'undefined') return []
  try {
    const size = 64
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    if (!ctx) return []
    ctx.drawImage(image, 0, 0, size, size)
    const { data } = ctx.getImageData(0, 0, size, size)

    const buckets = new Map<string, { r: number; g: number; b: number; n: number; score: number }>()

    for (let i = 0; i < data.length; i += 4) {
      const a = data[i + 3]
      if (a < 125) continue // skip transparent
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]

      // Quantise to 5 bits per channel to group similar colours.
      const key = `${r >> 5}-${g >> 5}-${b >> 5}`
      const max = Math.max(r, g, b)
      const min = Math.min(r, g, b)
      const saturation = max === 0 ? 0 : (max - min) / max
      const entry = buckets.get(key) ?? { r: 0, g: 0, b: 0, n: 0, score: 0 }
      entry.r += r
      entry.g += g
      entry.b += b
      entry.n += 1
      // Weight by saturation so vivid brand colours outrank near-greys.
      entry.score += 1 + saturation * 4
      buckets.set(key, entry)
    }

    return Array.from(buckets.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, count)
      .map((e) =>
        Color({
          r: Math.round(e.r / e.n),
          g: Math.round(e.g / e.n),
          b: Math.round(e.b / e.n),
        })
          .hex()
          .toString(),
      )
  } catch {
    return []
  }
}
