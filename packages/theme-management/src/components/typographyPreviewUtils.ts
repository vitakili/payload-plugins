import { BODY_FONT_OPTIONS, FONT_VALUE_TO_CSS, HEADING_FONT_OPTIONS } from '@/constants/themeFonts'
import { defaultThemePresets } from '../presets'

export interface TypographySelection {
  bodyFont?: string | null
  headingFont?: string | null
  bodyFontCustom?: string | null
  headingFontCustom?: string | null
  baseFontSize?: string | null
  lineHeight?: string | null
}

export interface ResolvedTypographyPreview {
  bodyFont: string
  headingFont: string
  baseFontSize: string
  lineHeight: string
  bodyLabel: string
  headingLabel: string
}

const FALLBACK_THEME = defaultThemePresets[0]?.name ?? 'cool'
const fallbackPreset =
  defaultThemePresets.find((preset) => preset.name === FALLBACK_THEME) ?? defaultThemePresets[0]

const FONT_VAR_FALLBACK: Record<string, string> = {
  'var(--font-geist-sans)': '"Geist Sans", system-ui, sans-serif',
  'var(--font-geist-mono)': '"Geist Mono", SFMono-Regular, ui-monospace, monospace',
  'var(--font-inter)': '"Inter", system-ui, sans-serif',
  'var(--font-outfit)': '"Outfit", system-ui, sans-serif',
  'var(--font-playfair)': '"Playfair Display", "Times New Roman", serif',
  'var(--font-lora)': '"Lora", "Times New Roman", serif',
  'var(--font-manrope)': '"Manrope", system-ui, sans-serif',
  'var(--font-urbanist)': '"Urbanist", system-ui, sans-serif',
}

function withFallback(fontFamily: string, fallback: string): string {
  if (!fontFamily) return fallback

  if (fontFamily.startsWith('var(')) {
    const mappedFallback = FONT_VAR_FALLBACK[fontFamily] ?? fallback
    return `${fontFamily}, ${mappedFallback}`
  }

  return fontFamily
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

  const preconfigured = FONT_VALUE_TO_CSS[value]
  if (preconfigured) {
    return withFallback(
      preconfigured,
      fallbackPreset?.typography?.fontFamily ?? 'system-ui, sans-serif',
    )
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

  const baseFontSize =
    selection?.baseFontSize && selection.baseFontSize !== 'preset'
      ? selection.baseFontSize
      : fallbackSize
  const lineHeight =
    selection?.lineHeight && selection.lineHeight !== 'preset'
      ? selection.lineHeight
      : fallbackLineHeight

  return {
    bodyFont: resolvedBodyFont,
    headingFont: resolvedHeadingFont,
    baseFontSize,
    lineHeight,
    bodyLabel: resolveOptionLabel(BODY_FONT_OPTIONS, bodyFontValue),
    headingLabel: resolveOptionLabel(HEADING_FONT_OPTIONS, headingFontValue),
  }
}
