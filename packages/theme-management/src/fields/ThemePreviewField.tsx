'use client'

import './ThemePreviewField.css'
import { useField, useForm, useFormFields } from '@payloadcms/ui'
import type { SelectFieldClientProps } from 'payload'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import type {
  ResolvedTypographyPreview,
  TypographySelection,
} from '../components/typographyPreviewUtils.js'
import { resolveTypographyPreview } from '../components/typographyPreviewUtils.js'
import { allThemePresets } from '../index.js'
import type { ThemePreset, ThemeTypographyPreset } from '../presets.js'
import { borderRadiusPresets } from '../providers/Theme/themeConfig.js'
import { getTranslations } from '../translations.js'
import { getAdminLanguage } from '../utils/getAdminLanguage.js'
import { darkModeDefaults, lightModeDefaults } from './colorModeFields.js'

interface ColorModeColors {
  background?: string
  foreground?: string
  card?: string
  cardForeground?: string
  popover?: string
  popoverForeground?: string
  primary?: string
  primaryForeground?: string
  secondary?: string
  secondaryForeground?: string
  muted?: string
  mutedForeground?: string
  accent?: string
  accentForeground?: string
  destructive?: string
  destructiveForeground?: string
  border?: string
  input?: string
  ring?: string
}

interface ThemePresetDefinition {
  label: string
  lightMode: ColorModeColors
  darkMode: ColorModeColors
  typography?: ThemeTypographyPreset
  borderRadius: 'none' | 'small' | 'medium' | 'large' | 'xl'
}

// FALLBACK_THEME and runtime theme presets are computed inside the component

const colorKeys = Object.keys(lightModeDefaults) as (keyof ColorModeColors)[]

// translations and swatches will be computed inside the component to respect admin language at runtime

interface ModePreviewProps {
  icon: string
  title: string
  colors: ColorModeColors
  typography: ResolvedTypographyPreview
  radius: {
    card: string
    chip: string
    pill: string
  }
}

function ModePreview({ icon, title, colors, typography, radius }: Readonly<ModePreviewProps>) {
  const t = getTranslations(getAdminLanguage())
  const background = colors.background ?? '#ffffff'
  const foreground = colors.foreground ?? '#0a0a0a'
  const borderColor = colors.border ?? 'rgba(148, 163, 184, 0.35)'
  const cardBackground = colors.card ?? background
  const cardForeground = colors.cardForeground ?? foreground
  const primary = colors.primary ?? foreground
  const primaryForeground = colors.primaryForeground ?? background
  const secondary = colors.secondary ?? '#f4f4f5'
  const secondaryForeground = colors.secondaryForeground ?? foreground
  const muted = colors.muted ?? secondary
  const mutedForeground = colors.mutedForeground ?? secondaryForeground
  const accent = colors.accent ?? secondary
  const accentForeground = colors.accentForeground ?? secondaryForeground
  const headingFont = typography.headingFont
  const bodyFont = typography.bodyFont
  const baseFontSize = typography.baseFontSize
  const lineHeight = typography.lineHeight

  return (
    <div
      style={{
        display: 'grid',
        gap: '16px',
        padding: '18px',
        borderRadius: '12px',
        backgroundColor: background,
        color: foreground,
        border: `1px solid ${borderColor}`,
        boxShadow: '0 8px 20px rgba(15, 23, 42, 0.08)',
        fontFamily: bodyFont,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '12px',
          fontWeight: 600,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          opacity: 0.7,
        }}
      >
        <span>
          {icon} {title}
        </span>
        <span style={{ fontFamily: 'monospace', fontSize: '11px' }}>
          {background.toUpperCase()}
        </span>
      </div>

      <div
        style={{
          backgroundColor: cardBackground,
          color: cardForeground,
          borderRadius: radius.card,
          border: `1px solid ${borderColor}`,
          padding: '16px',
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        <button
          type="button"
          style={{
            padding: '10px 18px',
            borderRadius: radius.pill,
            border: 'none',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 600,
            letterSpacing: '0.02em',
            backgroundColor: primary,
            color: primaryForeground,
            boxShadow: '0 6px 14px rgba(15, 23, 42, 0.15)',
          }}
        >
          {t.ui.primaryAction}
        </button>
        <button
          type="button"
          style={{
            padding: '10px 18px',
            borderRadius: radius.chip,
            border: '1px solid transparent',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 600,
            letterSpacing: '0.02em',
            backgroundColor: secondary,
            color: secondaryForeground,
            boxShadow: 'inset 0 0 0 1px rgba(15, 23, 42, 0.08)',
          }}
        >
          {t.ui.secondaryAction}
        </button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: '10px',
        }}
      >
        <div
          style={{
            borderRadius: radius.chip,
            padding: '10px 12px',
            fontSize: '12px',
            fontWeight: 500,
            backgroundColor: muted,
            color: mutedForeground,
          }}
        >
          Muted Card
        </div>
        <div
          style={{
            borderRadius: radius.chip,
            padding: '10px 12px',
            fontSize: '12px',
            fontWeight: 500,
            backgroundColor: accent,
            color: accentForeground,
          }}
        >
          Accent Tag
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gap: '8px',
          borderRadius: '10px',
          border: `1px dashed ${borderColor}`,
          padding: '14px',
          backgroundColor: 'rgba(148, 163, 184, 0.08)',
        }}
      >
        <div
          style={{
            fontFamily: headingFont,
            fontSize: 'clamp(24px, 3vw, 32px)',
            fontWeight: 600,
            lineHeight: 1.2,
          }}
        >
          Nadpis / Heading preview
        </div>
        <p
          style={{
            margin: 0,
            fontFamily: bodyFont,
            fontSize: baseFontSize,
            lineHeight,
            color: foreground,
            opacity: 0.85,
          }}
        >
          Sphinx of black quartz, judge my vow. Příliš žluťoučký kůň úpěl ďábelské ódy.
        </p>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px',
            fontSize: '11px',
            color: 'rgba(15, 23, 42, 0.7)',
          }}
        >
          <span>Body: {typography.bodyLabel}</span>
          <span>Heading: {typography.headingLabel}</span>
          <span>Base size: {baseFontSize}</span>
          <span>Line height: {lineHeight}</span>
        </div>
      </div>
    </div>
  )
}

export default function ThemePreviewField(props: SelectFieldClientProps) {
  const { field, path } = props
  // If the plugin provided theme presets via admin config, prefer those;
  // support both `field.admin.themePresets` (legacy) and `field.admin.custom.themePresets`
  // otherwise fallback to `allThemePresets`.
  // Prefer presets passed via `admin.custom.themePresets` (set by the field factory / plugin).
  // Fall back to legacy `admin.themePresets` for backwards compatibility, then to `allThemePresets`.
  const baseThemePresets =
    (field?.admin?.custom as unknown as { themePresets?: ThemePreset[] })?.themePresets ??
    (field?.admin as unknown as { themePresets?: ThemePreset[] })?.themePresets ??
    allThemePresets
  const runtimeThemePresets = useMemo(() => {
    return (baseThemePresets as ThemePreset[]).reduce<Record<string, ThemePresetDefinition>>(
      (acc, preset) => {
        acc[preset.name] = {
          label: preset.label,
          lightMode: { ...lightModeDefaults, ...(preset.lightMode ?? {}) },
          darkMode: { ...darkModeDefaults, ...(preset.darkMode ?? {}) },
          typography: preset.typography,
          borderRadius: preset.borderRadius,
        }
        return acc
      },
      {},
    )
  }, [baseThemePresets])
  const fallbackTheme = baseThemePresets[0]?.name ?? 'cool'
  const { value: selectedTheme, setValue } = useField<string>({ path })
  const { dispatchFields } = useForm()
  const formFields = useFormFields(([formState]) => formState)
  const hasAppliedInitialPresetRef = useRef(false)

  const applyPreset = useCallback(
    (presetName: string) => {
      const preset = runtimeThemePresets[presetName]
      if (!preset) {
        return
      }

      colorKeys.forEach((key) => {
        const lightValue = preset.lightMode[key]
        const darkValue = preset.darkMode[key]

        if (lightValue) {
          dispatchFields({
            type: 'UPDATE',
            path: `themeConfiguration.lightMode.${key}`,
            value: lightValue,
          })
        }

        if (darkValue) {
          dispatchFields({
            type: 'UPDATE',
            path: `themeConfiguration.darkMode.${key}`,
            value: darkValue,
          })
        }
      })
    },
    [dispatchFields],
  )

  const handleThemeSelect = useCallback(
    (value: string) => {
      setValue(value)

      if (!value) {
        return
      }

      hasAppliedInitialPresetRef.current = true
      applyPreset(value)
    },
    [applyPreset, setValue],
  )

  useEffect(() => {
    if (!selectedTheme) {
      return
    }

    if (runtimeThemePresets[selectedTheme]) {
      return
    }

    hasAppliedInitialPresetRef.current = false
    setValue(fallbackTheme)
  }, [selectedTheme, setValue])

  useEffect(() => {
    if (hasAppliedInitialPresetRef.current) {
      return
    }

    if (!selectedTheme) {
      return
    }

    if (!formFields) {
      return
    }

    const preset = runtimeThemePresets[selectedTheme]
    if (!preset) {
      hasAppliedInitialPresetRef.current = true
      return
    }

    const hasExistingValues = colorKeys.some((key) => {
      const lightField = formFields[`themeConfiguration.lightMode.${key}`]
      const darkField = formFields[`themeConfiguration.darkMode.${key}`]

      const lightValue = typeof lightField?.value === 'string' && lightField.value.trim().length > 0
      const darkValue = typeof darkField?.value === 'string' && darkField.value.trim().length > 0

      return lightValue || darkValue
    })

    if (hasExistingValues) {
      hasAppliedInitialPresetRef.current = true
      return
    }

    applyPreset(selectedTheme)
    hasAppliedInitialPresetRef.current = true
  }, [selectedTheme, formFields, applyPreset])

  const lightModeColors = useMemo(() => {
    const presetLightMode = selectedTheme
      ? runtimeThemePresets[selectedTheme]?.lightMode
      : undefined

    return colorKeys.reduce<ColorModeColors>((acc, key) => {
      const fieldState = formFields?.[`themeConfiguration.lightMode.${key}`]
      const rawValue =
        typeof fieldState?.value === 'string' && fieldState.value.trim().length > 0
          ? fieldState.value
          : undefined

      acc[key] = rawValue ?? presetLightMode?.[key] ?? lightModeDefaults[key]
      return acc
    }, {} as ColorModeColors)
  }, [formFields, selectedTheme])

  const darkModeColors = useMemo(() => {
    const presetDarkMode = selectedTheme ? runtimeThemePresets[selectedTheme]?.darkMode : undefined

    return colorKeys.reduce<ColorModeColors>((acc, key) => {
      const fieldState = formFields?.[`themeConfiguration.darkMode.${key}`]
      const rawValue =
        typeof fieldState?.value === 'string' && fieldState.value.trim().length > 0
          ? fieldState.value
          : undefined

      acc[key] = rawValue ?? presetDarkMode?.[key] ?? darkModeDefaults[key]
      return acc
    }, {} as ColorModeColors)
  }, [formFields, selectedTheme])

  const activePreset = selectedTheme ? runtimeThemePresets[selectedTheme] : undefined
  const formTypographySelection = useMemo<TypographySelection | null>(() => {
    if (!formFields) {
      return null
    }

    const getValue = (key: string) => formFields[`themeConfiguration.typography.${key}`]?.value

    return {
      bodyFont: (getValue('bodyFont') as string | undefined) ?? undefined,
      headingFont: (getValue('headingFont') as string | undefined) ?? undefined,
      bodyFontCustom: (getValue('bodyFontCustom') as string | undefined) ?? undefined,
      headingFontCustom: (getValue('headingFontCustom') as string | undefined) ?? undefined,
      baseFontSize: (getValue('baseFontSize') as string | undefined) ?? undefined,
      lineHeight: (getValue('lineHeight') as string | undefined) ?? undefined,
    }
  }, [formFields])

  const previewTypography = useMemo<ResolvedTypographyPreview>(() => {
    return resolveTypographyPreview(formTypographySelection, selectedTheme)
  }, [formTypographySelection, selectedTheme])

  const borderRadiusValue = formFields?.['themeConfiguration.borderRadius']?.value
  const presetRadius = activePreset?.borderRadius ?? 'medium'
  const resolvedBorderRadius = (
    typeof borderRadiusValue === 'string' && borderRadiusValue.length
      ? borderRadiusValue
      : presetRadius
  ) as keyof typeof borderRadiusPresets
  const borderRadiusPreset = borderRadiusPresets[resolvedBorderRadius] ?? borderRadiusPresets.medium
  const borderRadiusCSS =
    typeof borderRadiusPreset.css === 'string'
      ? { '--radius-default': borderRadiusPreset.css }
      : (borderRadiusPreset.css as Record<string, string>)
  const previewRadius = {
    card: borderRadiusCSS['--radius-large'] ?? '1rem',
    chip: borderRadiusCSS['--radius-default'] ?? '0.75rem',
    pill: borderRadiusCSS['--radius-xl'] ?? borderRadiusCSS['--radius-large'] ?? '999px',
  }

  // Translate labels at runtime based on admin language
  const t = getTranslations(getAdminLanguage())
  const highlightSwatches = [
    { key: 'primary', label: t.colors.primary },
    { key: 'secondary', label: t.colors.secondary },
    { key: 'accent', label: t.colors.accent },
    { key: 'background', label: t.colors.background },
    { key: 'foreground', label: t.colors.foreground },
  ]

  const fieldLabel =
    typeof field.label === 'string' ? field.label : field.label?.en || field.label?.cs || 'Theme'

  return (
    <div style={{ marginBottom: '24px' }}>
      <label
        style={{
          display: 'block',
          marginBottom: '10px',
          fontSize: '13px',
          fontWeight: 600,
          color: 'var(--theme-elevation-800)',
        }}
      >
        {fieldLabel}
      </label>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '24px',
          alignItems: 'flex-start',
        }}
      >
        <div
          style={{
            flex: '0 0 320px',
            minWidth: '260px',
            maxWidth: '420px',
            display: 'grid',
            gap: '12px',
          }}
        >
          <div className="theme-preset-list">
            {Object.entries(runtimeThemePresets).map(([key, preset]) => {
              const isSelected = key === selectedTheme
              const swatches = highlightSwatches
                .map(({ key: colorKey }) => preset.lightMode[colorKey])
                .filter((color): color is string => Boolean(color))

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleThemeSelect(key)}
                  className={`theme-preset-button ${isSelected ? 'selected' : ''}`}
                >
                  <div className="theme-info">
                    <span className="theme-label">{preset.label}</span>
                    <span className="theme-name">{key}</span>
                  </div>
                  <div className="theme-swatches" aria-hidden="true">
                    {swatches.map((color, index) => (
                      <span
                        key={`${key}-swatch-${color}-${index}`}
                        className="color-swatch"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </button>
              )
            })}
          </div>

          {activePreset && (
            <div
              style={{
                padding: '12px',
                borderRadius: '10px',
                border: '1px solid var(--theme-elevation-200)',
                backgroundColor: 'var(--theme-elevation-50)',
                display: 'grid',
                gap: '8px',
                fontSize: '12px',
                color: 'var(--theme-elevation-600)',
              }}
            >
              <div style={{ fontWeight: 600, color: 'var(--theme-elevation-800)' }}>
                {activePreset.label}
              </div>
              <div>Primary color: {activePreset.lightMode.primary}</div>
              <div>Accent color: {activePreset.lightMode.accent}</div>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '12px',
                  marginTop: '4px',
                }}
              >
                {highlightSwatches.map(({ key, label }) => {
                  const swatchValue = activePreset.lightMode[key]

                  if (!swatchValue) {
                    return null
                  }

                  return (
                    <div
                      key={key}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        minWidth: 'fit-content',
                      }}
                    >
                      <span
                        style={{
                          width: '22px',
                          height: '22px',
                          borderRadius: '999px',
                          border: '1px solid rgba(15, 23, 42, 0.12)',
                          backgroundColor: swatchValue,
                          boxShadow: 'inset 0 1px 2px rgba(15, 23, 42, 0.08)',
                        }}
                        aria-hidden="true"
                      />
                      <span style={{ fontSize: '11px', color: 'var(--theme-elevation-700)' }}>
                        {label}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {field.admin?.description && (
            <div
              style={{
                fontSize: '12px',
                color: 'var(--theme-elevation-600)',
                lineHeight: 1.5,
              }}
            >
              {typeof field.admin.description === 'string'
                ? field.admin.description
                : field.admin.description?.en || field.admin.description?.cs || ''}
            </div>
          )}
        </div>

        <div
          style={{
            flex: '1 1 420px',
            minWidth: '320px',
            position: 'sticky',
            top: '96px',
            alignSelf: 'flex-start',
          }}
        >
          <div
            style={{
              width: '100%',
              borderRadius: '16px',
              border: '1px solid var(--theme-elevation-200)',
              backgroundColor: 'var(--theme-elevation-25)',
              padding: '20px',
              display: 'grid',
              gap: '18px',
              maxHeight: 'calc(100vh - 140px)',
              overflowY: 'auto',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontWeight: 600,
                fontSize: '13px',
                color: 'var(--theme-elevation-800)',
              }}
            >
              {/* safe translations for preview header */}
              <span>{getTranslations('en').livePreview.smallTitle}</span>
              <span style={{ fontSize: '12px', color: 'var(--theme-elevation-600)' }}>
                {activePreset ? activePreset.label : getTranslations('en').preview.customPalette}
              </span>
            </div>

            <div
              style={{
                display: 'grid',
                gap: '16px',
              }}
            >
              <ModePreview
                icon="☀️"
                title={getTranslations('en').ui.lightMode}
                colors={lightModeColors}
                typography={previewTypography}
                radius={previewRadius}
              />
              <ModePreview
                icon="🌙"
                title={getTranslations('en').ui.darkMode}
                colors={darkModeColors}
                typography={previewTypography}
                radius={previewRadius}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
