'use client'

import { useField, useForm, useFormFields } from '@payloadcms/ui'
import type { SelectFieldClientProps } from 'payload'
import { useCallback, useEffect, useMemo, useRef, type ChangeEvent } from 'react'
import { borderRadiusPresets } from '@/providers/Theme/themeConfig'
import type {
  ResolvedTypographyPreview,
  TypographySelection,
} from '../components/typographyPreviewUtils'
import { resolveTypographyPreview } from '../components/typographyPreviewUtils'
import { defaultThemePresets } from '../index'
import type { ThemeTypographyPreset } from '../presets'
import { darkModeDefaults, lightModeDefaults } from './colorModeFields'

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

const FALLBACK_THEME = defaultThemePresets[0]?.name ?? 'cool'

const themePresets = defaultThemePresets.reduce<Record<string, ThemePresetDefinition>>(
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

const colorKeys = Object.keys(lightModeDefaults) as (keyof ColorModeColors)[]

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
          Primary Action
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
          Secondary
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
  const { value: selectedTheme, setValue } = useField<string>({ path })
  const { dispatchFields } = useForm()
  const formFields = useFormFields(([formState]) => formState)
  const hasAppliedInitialPresetRef = useRef(false)

  const applyPreset = useCallback(
    (presetName: string) => {
      const preset = themePresets[presetName]
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

  const handleThemeChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const value = event.target.value
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

    if (themePresets[selectedTheme]) {
      return
    }

    hasAppliedInitialPresetRef.current = false
    setValue(FALLBACK_THEME)
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

    const preset = themePresets[selectedTheme]
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
    const presetLightMode = selectedTheme ? themePresets[selectedTheme]?.lightMode : undefined

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
    const presetDarkMode = selectedTheme ? themePresets[selectedTheme]?.darkMode : undefined

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

  const activePreset = selectedTheme ? themePresets[selectedTheme] : undefined
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
    pill:
      borderRadiusCSS['--radius-xl'] ?? borderRadiusCSS['--radius-large'] ?? '999px',
  }

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
          <select
            value={selectedTheme || ''}
            onChange={handleThemeChange}
            style={{
              width: '100%',
              padding: '12px 14px',
              fontSize: '14px',
              borderRadius: '8px',
              border: '1px solid var(--theme-elevation-250)',
              backgroundColor: 'var(--theme-input-bg)',
              color: 'var(--theme-elevation-800)',
              cursor: 'pointer',
            }}
          >
            <option value="">Select a theme…</option>
            {Object.entries(themePresets).map(([key, preset]) => (
              <option key={key} value={key}>
                {preset.label}
              </option>
            ))}
          </select>

          {activePreset && (
            <div
              style={{
                padding: '12px',
                borderRadius: '10px',
                border: '1px solid var(--theme-elevation-200)',
                backgroundColor: 'var(--theme-elevation-50)',
                display: 'grid',
                gap: '6px',
                fontSize: '12px',
                color: 'var(--theme-elevation-600)',
              }}
            >
              <div style={{ fontWeight: 600, color: 'var(--theme-elevation-800)' }}>
                {activePreset.label}
              </div>
              <div>Primary color: {activePreset.lightMode.primary}</div>
              <div>Accent color: {activePreset.lightMode.accent}</div>
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
              <span>🎨 Live Preview</span>
              <span style={{ fontSize: '12px', color: 'var(--theme-elevation-600)' }}>
                {activePreset ? activePreset.label : 'Custom palette'}
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
                title="Light Mode"
                colors={lightModeColors}
                typography={previewTypography}
                radius={previewRadius}
              />
              <ModePreview
                icon="🌙"
                title="Dark Mode"
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
