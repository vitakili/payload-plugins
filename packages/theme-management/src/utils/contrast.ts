import Color from 'color'

/**
 * WCAG contrast & accessibility helpers shared by the admin colour picker and
 * the palette accessibility audit. All functions are colour-format agnostic
 * (hex / rgb / hsl via the `color` package, with a canvas fallback for modern
 * formats such as oklch when running in the browser).
 */

export type WcagLevel = 'AAA' | 'AA' | 'AA Large' | 'fail'

/**
 * Best-effort conversion of any CSS colour string to hex. Uses the `color`
 * package first, then a 1×1 canvas (browser only) for formats `color` can't
 * parse (oklch, oklab, lch, named colours in some cases).
 */
export function cssColorToHex(cssColor: string): string | null {
  if (!cssColor || !cssColor.trim()) return null
  try {
    return Color(cssColor).hex().toString()
  } catch {
    /* fall through to canvas */
  }
  if (typeof document === 'undefined') return null
  try {
    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    ctx.fillStyle = cssColor
    ctx.fillRect(0, 0, 1, 1)
    const [r, g, b] = Array.from(ctx.getImageData(0, 0, 1, 1).data)
    return '#' + [r, g, b].map((n) => (n as number).toString(16).padStart(2, '0')).join('')
  } catch {
    return null
  }
}

/**
 * WCAG contrast ratio (1–21) between two CSS colours, or `null` if either can't
 * be parsed.
 */
export function getContrastRatio(a: string, b: string): number | null {
  try {
    return Number(Color(a).contrast(Color(b)).toFixed(2))
  } catch {
    const ah = cssColorToHex(a)
    const bh = cssColorToHex(b)
    if (!ah || !bh) return null
    try {
      return Number(Color(ah).contrast(Color(bh)).toFixed(2))
    } catch {
      return null
    }
  }
}

/**
 * Map a contrast ratio to a WCAG conformance level.
 * @param ratio Contrast ratio (1–21).
 * @param isLargeText Use the relaxed large-text thresholds (≥18.66px bold / ≥24px).
 */
export function getWcagLevel(ratio: number, isLargeText = false): WcagLevel {
  if (isLargeText) {
    if (ratio >= 4.5) return 'AAA'
    if (ratio >= 3) return 'AA'
    return 'fail'
  }
  if (ratio >= 7) return 'AAA'
  if (ratio >= 4.5) return 'AA'
  if (ratio >= 3) return 'AA Large'
  return 'fail'
}

/**
 * Suggest the nearest accessible variant of `foreground` (preserving hue and
 * saturation, adjusting only lightness) that meets `target` contrast against
 * `background`. Returns a hex string, or `null` if none is reachable / parsing
 * failed.
 */
export function suggestAccessibleColor(
  foreground: string,
  background: string,
  target = 4.5,
): string | null {
  try {
    const bg = Color(background)
    const fg = Color(foreground)
    const baseLightness = fg.hsl().object().l ?? 50

    let best: string | null = null
    let bestDelta = Number.POSITIVE_INFINITY

    for (let l = 0; l <= 100; l++) {
      const candidate = fg.lightness(l)
      const ratio = candidate.contrast(bg)
      if (ratio >= target) {
        const delta = Math.abs(l - baseLightness)
        if (delta < bestDelta) {
          bestDelta = delta
          best = candidate.hex().toString()
        }
      }
    }
    return best
  } catch {
    return null
  }
}

/** A colour-mode object keyed by token name (e.g. `background`, `primary`). */
export type AuditColors = Record<string, string | null | undefined>

export interface ContrastPairResult {
  /** Token key holding the foreground colour. */
  foregroundKey: string
  /** Token key holding the background colour. */
  backgroundKey: string
  /** Human-readable description of what the pair represents. */
  label: string
  foreground: string
  background: string
  ratio: number
  level: WcagLevel
  passes: boolean
  /** Nearest accessible foreground (hex) when the pair fails AA, else null. */
  suggestion: string | null
}

/**
 * The foreground/background token pairs that matter for readability. Each entry
 * is audited against the WCAG AA normal-text threshold (4.5:1).
 */
export const CONTRAST_PAIRS: Array<{
  foregroundKey: string
  backgroundKey: string
  label: string
}> = [
  { foregroundKey: 'foreground', backgroundKey: 'background', label: 'Body text' },
  { foregroundKey: 'mutedForeground', backgroundKey: 'background', label: 'Muted text' },
  { foregroundKey: 'primaryForeground', backgroundKey: 'primary', label: 'Primary button' },
  { foregroundKey: 'secondaryForeground', backgroundKey: 'secondary', label: 'Secondary button' },
  { foregroundKey: 'accentForeground', backgroundKey: 'accent', label: 'Accent' },
  { foregroundKey: 'cardForeground', backgroundKey: 'card', label: 'Card text' },
  { foregroundKey: 'destructiveForeground', backgroundKey: 'destructive', label: 'Destructive' },
]

/**
 * Audit a colour-mode palette against {@link CONTRAST_PAIRS}. Pairs whose colours
 * are missing/unparseable are skipped.
 */
export function auditThemePalette(colors: AuditColors, target = 4.5): ContrastPairResult[] {
  const results: ContrastPairResult[] = []

  for (const pair of CONTRAST_PAIRS) {
    const foreground = colors[pair.foregroundKey]
    const background = colors[pair.backgroundKey]
    if (!foreground || !background) continue

    const ratio = getContrastRatio(foreground, background)
    if (ratio == null) continue

    const passes = ratio >= target
    results.push({
      foregroundKey: pair.foregroundKey,
      backgroundKey: pair.backgroundKey,
      label: pair.label,
      foreground,
      background,
      ratio,
      level: getWcagLevel(ratio),
      passes,
      suggestion: passes ? null : suggestAccessibleColor(foreground, background, target),
    })
  }

  return results
}
