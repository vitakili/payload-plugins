import type { BorderRadiusPreset } from '../providers/Theme/types.js'
import { getBorderRadiusConfig } from '../providers/Theme/themeConfig.js'
import { resolveThemeConfiguration } from './resolveThemeConfiguration.js'

/**
 * Export the resolved theme as portable design tokens.
 *
 * - {@link generateDesignTokens} → W3C Design Tokens JSON (Figma Tokens /
 *   Style Dictionary interop).
 * - {@link generateTailwindV4Theme} → a Tailwind v4 `@theme inline { … }` block
 *   that maps utilities (`bg-primary`, `text-foreground`, …) to the CSS variables
 *   the plugin injects at runtime, so colours stay theme-driven.
 */

type TokenColumn = { key: string; cssVar: string; tw: string }

/** Colour token key → CSS variable → Tailwind utility name. */
const COLOR_TOKENS: TokenColumn[] = [
  { key: 'background', cssVar: '--background', tw: 'background' },
  { key: 'foreground', cssVar: '--foreground', tw: 'foreground' },
  { key: 'card', cssVar: '--card', tw: 'card' },
  { key: 'cardForeground', cssVar: '--card-foreground', tw: 'card-foreground' },
  { key: 'popover', cssVar: '--popover', tw: 'popover' },
  { key: 'popoverForeground', cssVar: '--popover-foreground', tw: 'popover-foreground' },
  { key: 'primary', cssVar: '--primary', tw: 'primary' },
  { key: 'primaryForeground', cssVar: '--primary-foreground', tw: 'primary-foreground' },
  { key: 'secondary', cssVar: '--secondary', tw: 'secondary' },
  { key: 'secondaryForeground', cssVar: '--secondary-foreground', tw: 'secondary-foreground' },
  { key: 'muted', cssVar: '--muted', tw: 'muted' },
  { key: 'mutedForeground', cssVar: '--muted-foreground', tw: 'muted-foreground' },
  { key: 'accent', cssVar: '--accent', tw: 'accent' },
  { key: 'accentForeground', cssVar: '--accent-foreground', tw: 'accent-foreground' },
  { key: 'destructive', cssVar: '--destructive', tw: 'destructive' },
  { key: 'destructiveForeground', cssVar: '--destructive-foreground', tw: 'destructive-foreground' },
  { key: 'border', cssVar: '--border', tw: 'border' },
  { key: 'input', cssVar: '--input', tw: 'input' },
  { key: 'ring', cssVar: '--ring', tw: 'ring' },
]

const asColorRecord = (mode: unknown): Record<string, string> => {
  const out: Record<string, string> = {}
  if (mode && typeof mode === 'object') {
    for (const { key } of COLOR_TOKENS) {
      const value = (mode as Record<string, unknown>)[key]
      if (typeof value === 'string' && value.trim()) out[key] = value.trim()
    }
  }
  return out
}

const resolveRadiusValue = (borderRadius: string | undefined): string => {
  const config = getBorderRadiusConfig((borderRadius ?? 'medium') as BorderRadiusPreset)
  if (typeof config?.css === 'string') return config.css
  const record = (config?.css ?? {}) as Record<string, string>
  return record['--radius-default'] ?? record['--radius-large'] ?? '0.5rem'
}

/** A minimal W3C design-tokens group node. */
type TokenLeaf = { $value: string; $type: 'color' | 'dimension' }
type TokenGroup = { [key: string]: TokenLeaf | TokenGroup }

/**
 * Build a W3C Design Tokens document from a theme configuration. Colours are
 * grouped under `color.light` / `color.dark`; border radius under `radius`.
 */
export function generateDesignTokens(themeConfiguration: unknown): TokenGroup {
  const resolved = resolveThemeConfiguration(themeConfiguration)
  const light = asColorRecord(resolved.lightMode)
  const dark = asColorRecord(resolved.darkMode)

  const toGroup = (colors: Record<string, string>): TokenGroup => {
    const group: TokenGroup = {}
    for (const { key } of COLOR_TOKENS) {
      if (colors[key]) group[key] = { $value: colors[key], $type: 'color' }
    }
    return group
  }

  return {
    color: {
      light: toGroup(light),
      dark: toGroup(dark),
    },
    radius: {
      base: { $value: resolveRadiusValue(resolved.borderRadius), $type: 'dimension' },
    },
  }
}

/** Pretty-printed JSON string of {@link generateDesignTokens}. */
export function generateDesignTokensJson(themeConfiguration: unknown): string {
  return JSON.stringify(generateDesignTokens(themeConfiguration), null, 2)
}

/**
 * Generate a Tailwind v4 `@theme inline { … }` block. The utilities reference the
 * runtime CSS variables (`var(--primary)` …) so colours follow the active theme,
 * light/dark mode and live preview without rebuilding Tailwind.
 *
 * Drop the output into your global stylesheet (after `@import "tailwindcss";`).
 */
export function generateTailwindV4Theme(themeConfiguration: unknown): string {
  const resolved = resolveThemeConfiguration(themeConfiguration)
  const lines = COLOR_TOKENS.map(({ cssVar, tw }) => `  --color-${tw}: var(${cssVar});`)
  lines.push(`  --radius: ${resolveRadiusValue(resolved.borderRadius)};`)
  return `@theme inline {\n${lines.join('\n')}\n}`
}

/**
 * Generate a Tailwind v3 `theme.extend` config fragment (as a JS string) mapping
 * colours to the runtime CSS variables. For projects still on Tailwind v3.
 */
export function generateTailwindV3Theme(themeConfiguration: unknown): string {
  const resolved = resolveThemeConfiguration(themeConfiguration)
  const colorEntries = COLOR_TOKENS.map(({ cssVar, tw }) => `        '${tw}': 'var(${cssVar})',`)
  return [
    'module.exports = {',
    '  theme: {',
    '    extend: {',
    '      colors: {',
    colorEntries.join('\n'),
    '      },',
    '      borderRadius: {',
    `        DEFAULT: '${resolveRadiusValue(resolved.borderRadius)}',`,
    '      },',
    '    },',
    '  },',
    '}',
  ].join('\n')
}
