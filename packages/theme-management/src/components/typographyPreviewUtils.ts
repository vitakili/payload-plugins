import {
  BODY_FONT_OPTIONS,
  getFontCatalogEntry,
  HEADING_FONT_OPTIONS,
  LETTER_SPACING_TO_CSS,
  toFontSizeCss,
} from '../constants/themeFonts.js'
import { defaultThemePresets } from '../presets.js'

export interface TypographySelection {
  bodyFont?: string | null
  headingFont?: string | null
  bodyFontCustom?: string | null
  headingFontCustom?: string | null
  baseFontSize?: string | null
  lineHeight?: string | null
  headingWeight?: string | null
  letterSpacing?: string | null
}

export interface ResolvedTypographyPreview {
  bodyFont: string
  headingFont: string
  baseFontSize: string
  lineHeight: string
  headingWeight: string
  headingLetterSpacing: string
  headingTransform: 'none' | 'uppercase'
  bodyLabel: string
  headingLabel: string
}

const FALLBACK_THEME = defaultThemePresets[0]?.name ?? 'cool'
const fallbackPreset =
  defaultThemePresets.find((preset) => preset.name === FALLBACK_THEME) ?? defaultThemePresets[0]

const FONT_VAR_FALLBACK: Record<string, string> = {
  'var(--font-inter)': '"Inter", system-ui, sans-serif',
  'var(--font-geist-sans)': '"Geist Sans", system-ui, sans-serif',
  'var(--font-geist-mono)': '"Geist Mono", SFMono-Regular, ui-monospace, monospace',
  'var(--font-roboto)': '"Roboto", system-ui, sans-serif',
  'var(--font-open-sans)': '"Open Sans", system-ui, sans-serif',
  'var(--font-lato)': '"Lato", system-ui, sans-serif',
  'var(--font-montserrat)': '"Montserrat", system-ui, sans-serif',
  'var(--font-poppins)': '"Poppins", system-ui, sans-serif',
  'var(--font-outfit)': '"Outfit", system-ui, sans-serif',
  'var(--font-playfair)': '"Playfair Display", "Times New Roman", serif',
  'var(--font-merriweather)': '"Merriweather", "Times New Roman", serif',
  'var(--font-raleway)': '"Raleway", system-ui, sans-serif',
  'var(--font-lora)': '"Lora", "Times New Roman", serif',
  'var(--font-manrope)': '"Manrope", system-ui, sans-serif',
  'var(--font-urbanist)': '"Urbanist", system-ui, sans-serif',
}

function withFallback(fontFamily: string, fallback: string): string {
  const value = fontFamily?.trim() || fallback

  // A `var(--font-x)` without a fallback whose variable is not defined (always the
  // case in the admin) makes the whole font-family declaration invalid. Give every
  // such reference a fallback stack so the preview always renders a real face.
  return value.replace(/var\((--[\w-]+)\)/g, (match, name: string) => {
    const mapped = FONT_VAR_FALLBACK[match] ?? 'system-ui, sans-serif'
    return `var(${name}, ${mapped})`
  })
}

function getPresetTypography(themeName?: string) {
  const preset = defaultThemePresets.find((item) => item.name === themeName) ?? fallbackPreset
  return preset?.typography
}

function resolveFontFamily(
  value: string | null | undefined,
  customValue: string | null | undefined,
  fallback: string,
): string {
  if (!value || value === 'preset') {
    return withFallback(fallback, fallbackPreset?.typography?.fontFamily ?? 'system-ui, sans-serif')
  }

  if (value === 'custom') {
    if (customValue && customValue.trim().length > 0) {
      return customValue.trim()
    }
    return withFallback(fallback, fallbackPreset?.typography?.fontFamily ?? 'system-ui, sans-serif')
  }

  // Catalog stacks are complete (variable with fallback + generic family).
  const preconfigured = getFontCatalogEntry(value)?.fontFamily
  if (preconfigured) {
    return preconfigured
  }

  return withFallback(fallback, fallbackPreset?.typography?.fontFamily ?? 'system-ui, sans-serif')
}

function resolveOptionLabel(
  options: ReadonlyArray<{ label: string | Record<string, string>; value: string }>,
  value?: string | null,
  locale: 'en' | 'cs' = 'en',
): string {
  const option = options.find((item) => item.value === value)
  if (!option) return value ?? ''
  if (typeof option.label === 'string') {
    return option.label
  }
  return option.label?.[locale] ?? Object.values(option.label)[0] ?? option.value
}

export function resolveTypographyPreview(
  selection: TypographySelection | null | undefined,
  themeName?: string,
): ResolvedTypographyPreview {
  const presetTypography = getPresetTypography(themeName)
  const fallbackBody = presetTypography?.fontFamily ?? 'system-ui, sans-serif'
  const fallbackHeading = presetTypography?.headingFamily ?? fallbackBody
  const fallbackSize = presetTypography?.baseFontSize ?? '16px'
  const fallbackLineHeight = presetTypography?.lineHeight ?? '1.6'

  const bodyFontValue = selection?.bodyFont ?? 'preset'
  const headingFontValue = selection?.headingFont ?? 'preset'
  const bodyFontCustom = selection?.bodyFontCustom ?? undefined
  const headingFontCustom = selection?.headingFontCustom ?? undefined
  const resolvedBodyFont = resolveFontFamily(bodyFontValue, bodyFontCustom, fallbackBody)
  const resolvedHeadingFont = resolveFontFamily(
    headingFontValue,
    headingFontCustom,
    fallbackHeading,
  )

  const baseFontSize = toFontSizeCss(selection?.baseFontSize) ?? fallbackSize
  const lineHeight =
    selection?.lineHeight && selection.lineHeight !== 'preset'
      ? selection.lineHeight
      : fallbackLineHeight

  return {
    bodyFont: resolvedBodyFont,
    headingFont: resolvedHeadingFont,
    baseFontSize,
    lineHeight,
    headingWeight:
      selection?.headingWeight && selection.headingWeight !== 'preset'
        ? selection.headingWeight
        : (presetTypography?.headingWeight ?? '700'),
    headingLetterSpacing:
      (selection?.letterSpacing && LETTER_SPACING_TO_CSS[selection.letterSpacing]) ??
      presetTypography?.headingLetterSpacing ??
      'normal',
    headingTransform: selection?.letterSpacing === 'wider' ? 'uppercase' : 'none',
    bodyLabel: resolveOptionLabel(BODY_FONT_OPTIONS, bodyFontValue),
    headingLabel: resolveOptionLabel(HEADING_FONT_OPTIONS, headingFontValue),
  }
}
