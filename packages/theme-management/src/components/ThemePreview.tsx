'use client'

import { useField } from '@payloadcms/ui'
import React, { useMemo } from 'react'
import { allThemePresets } from '../presets.js'
import { themeIsValid } from '../providers/Theme/types.js'
import { getTranslations } from '../translations.js'
import { getAdminLanguage } from '../utils/getAdminLanguage.js'

const DEFAULT_THEME_KEY = 'cool'
const basePresetMap = allThemePresets.reduce<Record<string, (typeof allThemePresets)[number]>>(
  (accumulator, preset) => {
    accumulator[preset.name] = preset
    return accumulator
  },
  {},
)

const fallbackPreset = basePresetMap[DEFAULT_THEME_KEY] ?? allThemePresets[0]
const fallbackLightMode = fallbackPreset?.lightMode ?? {
  primary: '#3b82f6',
  accent: '#06b6d4',
  background: '#ffffff',
  foreground: '#1f2937',
}

export default function ThemePreview() {
  // Get individual field values using useField hooks
  const { value: selectedTheme } = useField<string>({ path: 'themeConfiguration.theme' })
  const { value: primaryColor } = useField<string>({
    path: 'themeConfiguration.customization.primaryColor',
  })
  const { value: accentColor } = useField<string>({
    path: 'themeConfiguration.customization.accentColor',
  })
  const { value: backgroundColor } = useField<string>({
    path: 'themeConfiguration.customization.backgroundColor',
  })
  const { value: textColor } = useField<string>({
    path: 'themeConfiguration.customization.textColor',
  })

  // Determine current theme and if overrides are active
  const currentTheme = themeIsValid(selectedTheme)
    ? selectedTheme
    : (fallbackPreset?.name ?? 'cool')
  const hasOverrides = Boolean(primaryColor || accentColor || backgroundColor || textColor)

  const themeColors = useMemo(() => {
    const preset = basePresetMap[currentTheme] ?? fallbackPreset
    const lightMode = preset?.lightMode ?? fallbackLightMode

    return {
      primary: lightMode?.primary ?? fallbackLightMode.primary,
      accent:
        lightMode?.accent ??
        lightMode?.secondary ??
        fallbackLightMode.accent ??
        fallbackLightMode.primary,
      background: lightMode?.background ?? fallbackLightMode.background,
      text: lightMode?.foreground ?? fallbackLightMode.foreground,
    }
  }, [currentTheme])

  const currentColors = useMemo(
    () => ({
      primary: primaryColor || themeColors.primary,
      accent: accentColor || themeColors.accent,
      background: backgroundColor || themeColors.background,
      text: textColor || themeColors.text,
    }),
    [primaryColor, accentColor, backgroundColor, textColor, themeColors],
  )

  const t = getTranslations(getAdminLanguage())

  return (
    <div className="theme-preview" style={{ marginTop: '20px' }}>
      <div
        style={{
          fontSize: '16px',
          fontWeight: '600',
          marginBottom: '16px',
          color: '#374151',
        }}
      >
        {t.livePreview.largeTitle}
      </div>

      <div
        className="preview-container"
        style={{
          border: '2px solid #e5e7eb',
          borderRadius: '12px',
          overflow: 'hidden',
          backgroundColor: currentColors.background,
          color: currentColors.text,
          minHeight: '300px',
        }}
      >
        {/* Header */}
        <div
          style={{
            backgroundColor: currentColors.primary,
            color: currentColors.background,
            padding: '16px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ fontSize: '20px', fontWeight: '700' }}>{t.preview.siteTitle}</div>
          <nav style={{ display: 'flex', gap: '24px', fontSize: '14px' }}>
            <span>{t.preview.nav.home}</span>
            <span>{t.preview.nav.about}</span>
            <span>{t.preview.nav.services}</span>
            <span>{t.preview.nav.contact}</span>
          </nav>
        </div>

        {/* Content */}
        <div style={{ padding: '32px 24px' }}>
          <h1
            style={{
              fontSize: '32px',
              fontWeight: '800',
              marginBottom: '16px',
              color: currentColors.text,
            }}
          >
            {t.preview.welcomeTitle}
          </h1>

          <p
            style={{
              fontSize: '16px',
              lineHeight: '1.6',
              marginBottom: '24px',
              color: currentColors.text,
              opacity: 0.8,
            }}
          >
            {t.preview.welcomeCopy}
          </p>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
            <button
              style={{
                backgroundColor: currentColors.primary,
                color: currentColors.background,
                border: 'none',
                padding: '12px 24px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Primary Button
            </button>
            <button
              style={{
                backgroundColor: 'transparent',
                color: currentColors.primary,
                border: `2px solid ${currentColors.primary}`,
                padding: '10px 24px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Secondary Button
            </button>
          </div>

          {/* Card */}
          <div
            style={{
              backgroundColor: currentColors.text,
              color: currentColors.background,
              padding: '24px',
              borderRadius: '8px',
              opacity: 0.05,
              marginBottom: '16px',
            }}
          />
          <div
            style={{
              border: `1px solid ${currentColors.text}`,
              padding: '20px',
              borderRadius: '8px',
              opacity: 0.1,
            }}
          >
            <h2
              style={{
                fontSize: '18px',
                fontWeight: '600',
                marginBottom: '12px',
                color: currentColors.text,
              }}
            >
              {t.preview.sampleCardTitle}
            </h2>
            <p
              style={{
                fontSize: '14px',
                color: currentColors.text,
                opacity: 0.7,
              }}
            >
              This shows how cards and content blocks will appear.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            backgroundColor: currentColors.accent,
            color: currentColors.background,
            padding: '16px 24px',
            textAlign: 'center',
            fontSize: '14px',
            marginTop: 'auto',
          }}
        >
          {t.preview.footer}
        </div>
      </div>

      {/* Theme info */}
      <div
        style={{
          marginTop: '12px',
          fontSize: '12px',
          color: '#6b7280',
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '8px',
        }}
      >
        <div>
          <strong>Active Theme:</strong> {currentTheme}
        </div>
        <div>
          <strong>Primary:</strong> {currentColors.primary}
        </div>
        <div>
          <strong>Accent:</strong> {currentColors.accent}
        </div>
        <div>
          <strong>Background:</strong> {currentColors.background}
        </div>
      </div>

      {/* Customization indicator */}
      {hasOverrides && (
        <div
          style={{
            marginTop: '8px',
            padding: '8px 12px',
            backgroundColor: '#fef3c7',
            borderRadius: '6px',
            fontSize: '11px',
            color: '#92400e',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span>⚡</span>
          <span>
            <strong>Custom colors applied</strong> - overriding theme defaults
          </span>
        </div>
      )}
    </div>
  )
}
