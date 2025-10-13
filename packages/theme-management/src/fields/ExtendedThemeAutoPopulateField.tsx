'use client'

import { useField, useForm } from '@payloadcms/ui'
import type { SelectFieldClientComponent } from 'payload'
import { useCallback, useEffect, useRef } from 'react'
import { allExtendedThemePresets } from '../extended-presets.js'

/**
 * Extended Theme Field with Auto-Population
 *
 * This component:
 * 1. Shows color swatches for each theme option
 * 2. Auto-populates ALL color fields when a theme is selected
 * 3. Fills in ALL light mode and dark mode colors with preset defaults
 */
const ExtendedThemeAutoPopulateField: SelectFieldClientComponent = ({ field, path }) => {
  const { value, setValue } = useField<string>({ path })
  const { dispatchFields } = useForm()
  const hasInitializedRef = useRef(false)

  const options = (field.options as Array<{ label: string; value: string }>) || []
  const selectedOption = options.find((opt) => opt.value === value)

  // Auto-populate colors when theme is selected
  const applyThemePreset = useCallback(
    (presetKey: string) => {
      const preset = allExtendedThemePresets[presetKey as keyof typeof allExtendedThemePresets]
      if (!preset) return

      // Apply all light mode colors
      Object.entries(preset.styles.light).forEach(([key, colorValue]) => {
        dispatchFields({
          type: 'UPDATE',
          path: `themeConfiguration.extendedLightMode.${key}`,
          value: colorValue,
        })
      })

      // Apply all dark mode colors
      Object.entries(preset.styles.dark).forEach(([key, colorValue]) => {
        dispatchFields({
          type: 'UPDATE',
          path: `themeConfiguration.extendedDarkMode.${key}`,
          value: colorValue,
        })
      })
    },
    [dispatchFields],
  )

  const handleChange = useCallback(
    (newValue: string) => {
      setValue(newValue)
      if (newValue) {
        applyThemePreset(newValue)
      }
    },
    [setValue, applyThemePreset],
  )

  // Auto-populate on initial load if value exists
  useEffect(() => {
    if (!hasInitializedRef.current && value) {
      applyThemePreset(value)
      hasInitializedRef.current = true
    }
  }, [value, applyThemePreset])

  // Get color swatches for a preset
  const getPresetColors = (presetValue: string) => {
    const preset = allExtendedThemePresets[presetValue as keyof typeof allExtendedThemePresets]
    if (!preset) return []

    const colors = [
      preset.styles.light.primary,
      preset.styles.light.secondary,
      preset.styles.light.accent,
      preset.styles.light.background,
      preset.styles.light.foreground,
    ].filter(Boolean)

    return colors.slice(0, 5)
  }

  const label =
    typeof field.label === 'string'
      ? field.label
      : field.label?.en || field.label?.cs || 'Theme Preset'
  const description =
    typeof field.admin?.description === 'string'
      ? field.admin.description
      : field.admin?.description?.en || field.admin?.description?.cs

  return (
    <div style={{ marginBottom: '16px' }}>
      <label
        style={{
          display: 'block',
          marginBottom: '6px',
          fontSize: '13px',
          fontWeight: 600,
          color: 'var(--theme-elevation-800)',
        }}
      >
        {label}
      </label>

      {description && (
        <div
          style={{
            fontSize: '12px',
            color: 'var(--theme-elevation-500)',
            marginBottom: '8px',
          }}
        >
          {description}
        </div>
      )}

      <select
        value={value || ''}
        onChange={(e) => handleChange(e.target.value)}
        style={{
          width: '100%',
          padding: '10px 12px',
          borderRadius: '6px',
          border: '1px solid var(--theme-elevation-200)',
          backgroundColor: 'var(--theme-input-bg)',
          color: 'var(--theme-elevation-800)',
          fontSize: '14px',
          cursor: 'pointer',
        }}
      >
        <option value="">Select a theme...</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {/* Show color swatches for selected theme */}
      {selectedOption && (
        <div
          style={{
            marginTop: '12px',
            padding: '12px',
            borderRadius: '8px',
            backgroundColor: 'var(--theme-elevation-50)',
            border: '1px solid var(--theme-elevation-200)',
          }}
        >
          <div
            style={{
              fontSize: '12px',
              fontWeight: 600,
              marginBottom: '8px',
              color: 'var(--theme-elevation-700)',
            }}
          >
            {selectedOption.label}
          </div>
          <div
            style={{
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
            }}
          >
            {getPresetColors(selectedOption.value).map((color, index) => (
              <div
                key={`${selectedOption.value}-${index}`}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  backgroundColor: color,
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                }}
                title={color}
              />
            ))}
          </div>
          <div
            style={{
              marginTop: '8px',
              fontSize: '11px',
              color: 'var(--theme-elevation-500)',
            }}
          >
            ✅ All colors auto-populated from this theme
          </div>
        </div>
      )}
    </div>
  )
}

export default ExtendedThemeAutoPopulateField
