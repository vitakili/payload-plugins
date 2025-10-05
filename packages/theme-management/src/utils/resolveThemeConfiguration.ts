import { FONT_VALUE_TO_CSS } from '@/constants/themeFonts'
import type { SiteSetting } from '@/payload-types'
import type { Mode, ThemePreset as ThemePresetKey } from '@/providers/Theme/types'
import { themeIsValid } from '@/providers/Theme/types'
import type { ThemeTypographyPreset } from '../presets'
import { defaultThemePresets } from '../presets'

interface ThemeTypographyOverride {
  bodyFont?: string | null
  headingFont?: string | null
  bodyFontCustom?: string | null
  headingFontCustom?: string | null
  baseFontSize?: string | null
  lineHeight?: string | null
}

type SiteThemeConfiguration = SiteSetting['themeConfiguration'] & {
  typography?: ThemeTypographyOverride | null
}

const BORDER_RADIUS_VALUES = ['none', 'small', 'medium', 'large', 'xl', 'full'] as const
const FONT_SCALE_VALUES = ['small', 'medium', 'large'] as const
const SPACING_VALUES = ['compact', 'medium', 'spacious'] as const
const ANIMATION_LEVEL_VALUES = ['none', 'reduced', 'medium', 'full'] as const
const MODE_VALUES = ['auto', 'light', 'dark'] as const

type BorderRadiusOption = 'none' | 'small' | 'medium' | 'large' | 'xl'
type FontScaleOption = (typeof FONT_SCALE_VALUES)[number]
type SpacingOption = (typeof SPACING_VALUES)[number]
type AnimationLevelOption = (typeof ANIMATION_LEVEL_VALUES)[number]

type ThemeModeOption = (typeof MODE_VALUES)[number]

type ThemeColorConfiguration = NonNullable<SiteThemeConfiguration['lightMode']>

const DEFAULT_THEME_NAME: ThemePresetKey = 'cool'
const DEFAULT_THEME_PRESET = defaultThemePresets.find(
  (preset) => preset.name === DEFAULT_THEME_NAME,
)

export interface ResolvedThemeConfiguration {
  theme: ThemePresetKey
  colorMode: Mode
  allowColorModeToggle: boolean
  borderRadius: BorderRadiusOption
  fontScale: FontScaleOption
  spacing: SpacingOption
  animationLevel: AnimationLevelOption
  customCSS: string | null
  lightMode?: ThemeColorConfiguration
  darkMode?: ThemeColorConfiguration
  typography: ThemeTypographyPreset | null
}

export const DEFAULT_THEME_CONFIGURATION: ResolvedThemeConfiguration = {
  theme: DEFAULT_THEME_NAME,
  colorMode: 'auto',
  allowColorModeToggle: true,
  borderRadius: 'medium',
  fontScale: 'medium',
  spacing: 'medium',
  animationLevel: 'medium',
  customCSS: null,
  lightMode: DEFAULT_THEME_PRESET?.lightMode,
  darkMode: DEFAULT_THEME_PRESET?.darkMode,
  typography: DEFAULT_THEME_PRESET?.typography ?? null,
}

function resolveBorderRadius(value: unknown): BorderRadiusOption {
  if (value === 'full') {
    return 'xl'
  }

  if (
    typeof value === 'string' &&
    BORDER_RADIUS_VALUES.includes(value as (typeof BORDER_RADIUS_VALUES)[number])
  ) {
    const candidate = value as BorderRadiusOption | 'full'
    return candidate === 'full' ? 'xl' : (candidate as BorderRadiusOption)
  }

  return DEFAULT_THEME_CONFIGURATION.borderRadius
}

function isFontScale(value: unknown): value is FontScaleOption {
  return typeof value === 'string' && FONT_SCALE_VALUES.includes(value as FontScaleOption)
}

function isSpacing(value: unknown): value is SpacingOption {
  return typeof value === 'string' && SPACING_VALUES.includes(value as SpacingOption)
}

function isAnimationLevel(value: unknown): value is AnimationLevelOption {
  return typeof value === 'string' && ANIMATION_LEVEL_VALUES.includes(value as AnimationLevelOption)
}

function isMode(value: unknown): value is ThemeModeOption {
  return typeof value === 'string' && MODE_VALUES.includes(value as ThemeModeOption)
}

export function resolveThemeConfiguration(
  themeConfiguration?: SiteThemeConfiguration | null,
): ResolvedThemeConfiguration {
  if (!themeConfiguration) {
    return DEFAULT_THEME_CONFIGURATION
  }

  const {
    theme,
    colorMode,
    allowColorModeToggle,
    borderRadius,
    fontScale,
    spacing,
    animationLevel,
    customCSS,
    lightMode,
    darkMode,
    typography,
  } = themeConfiguration

  const resolvedTheme =
    typeof theme === 'string' && themeIsValid(theme)
      ? (theme as ThemePresetKey)
      : DEFAULT_THEME_CONFIGURATION.theme
  const resolvedMode = isMode(colorMode)
    ? (colorMode as Mode)
    : DEFAULT_THEME_CONFIGURATION.colorMode
  const resolvedBorderRadius = resolveBorderRadius(borderRadius)
  const resolvedFontScale = isFontScale(fontScale)
    ? fontScale
    : DEFAULT_THEME_CONFIGURATION.fontScale
  const resolvedSpacing = isSpacing(spacing) ? spacing : DEFAULT_THEME_CONFIGURATION.spacing
  const resolvedAnimationLevel = isAnimationLevel(animationLevel)
    ? animationLevel
    : DEFAULT_THEME_CONFIGURATION.animationLevel
  const resolvedAllowToggle =
    typeof allowColorModeToggle === 'boolean'
      ? allowColorModeToggle
      : DEFAULT_THEME_CONFIGURATION.allowColorModeToggle
  const resolvedCustomCSS = typeof customCSS === 'string' ? customCSS : null
  const preset = defaultThemePresets.find((candidate) => candidate.name === resolvedTheme)
  const baseLightMode = preset?.lightMode ?? DEFAULT_THEME_CONFIGURATION.lightMode
  const baseDarkMode = preset?.darkMode ?? DEFAULT_THEME_CONFIGURATION.darkMode
  const resolvedLightMode = mergeColorModes(baseLightMode, lightMode)
  const resolvedDarkMode = mergeColorModes(baseDarkMode, darkMode)
  const resolvedTypography =
    mergeTypography(preset?.typography, typography) ?? preset?.typography ?? null

  return {
    theme: resolvedTheme,
    colorMode: resolvedMode,
    allowColorModeToggle: resolvedAllowToggle,
    borderRadius: resolvedBorderRadius,
    fontScale: resolvedFontScale,
    spacing: resolvedSpacing,
    animationLevel: resolvedAnimationLevel,
    customCSS: resolvedCustomCSS,
    lightMode: resolvedLightMode,
    darkMode: resolvedDarkMode,
    typography: resolvedTypography,
  }
}

function mergeColorModes(
  base?: ThemeColorConfiguration,
  overrides?: SiteThemeConfiguration['lightMode'],
): ThemeColorConfiguration | undefined {
  const merged: Record<string, string> = {}

  if (base) {
    Object.entries(base).forEach(([key, value]) => {
      if (typeof value === 'string' && value.trim().length > 0) {
        merged[key] = value
      }
    })
  }

  if (overrides) {
    Object.entries(overrides).forEach(([key, value]) => {
      if (typeof value === 'string' && value.trim().length > 0) {
        merged[key] = value
      } else if (value === null) {
        delete merged[key]
      }
    })
  }

  return Object.keys(merged).length > 0 ? (merged as ThemeColorConfiguration) : undefined
}

function mergeTypography(
  base?: ThemeTypographyPreset | null,
  overrides?: ThemeTypographyOverride | null,
): ThemeTypographyPreset | null {
  if (!base && !overrides) {
    return base ?? null
  }

  const result: ThemeTypographyPreset = {
    fontFamily: base?.fontFamily ?? 'var(--font-geist-sans)',
    headingFamily: base?.headingFamily ?? 'var(--font-geist-sans)',
    baseFontSize: base?.baseFontSize ?? '16px',
    lineHeight: base?.lineHeight ?? '1.6',
    fontWeights: { ...(base?.fontWeights ?? {}) },
    letterSpacing: { ...(base?.letterSpacing ?? {}) },
  }

  if (overrides) {
    const resolvedBodyFont = resolveFontSelection(
      overrides.bodyFont,
      overrides.bodyFontCustom,
      base?.fontFamily,
    )
    if (resolvedBodyFont) {
      result.fontFamily = resolvedBodyFont
    }

    const resolvedHeadingFont = resolveFontSelection(
      overrides.headingFont,
      overrides.headingFontCustom,
      base?.headingFamily,
    )
    if (resolvedHeadingFont) {
      result.headingFamily = resolvedHeadingFont
    }

    if (overrides.baseFontSize && overrides.baseFontSize !== 'preset') {
      result.baseFontSize = overrides.baseFontSize
    }

    if (overrides.lineHeight && overrides.lineHeight !== 'preset') {
      result.lineHeight = overrides.lineHeight
    }
  }

  return result
}

function resolveFontSelection(
  selection?: string | null,
  custom?: string | null,
  fallback?: string | null,
): string | null {
  if (!selection || selection === 'preset') {
    return fallback ?? null
  }

  if (selection === 'custom') {
    const trimmed = custom?.trim()
    return trimmed && trimmed.length > 0 ? trimmed : (fallback ?? null)
  }

  const mapped = FONT_VALUE_TO_CSS[selection]
  return mapped ?? fallback ?? null
}
