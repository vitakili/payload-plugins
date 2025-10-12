'use client'

import { useField } from '@payloadcms/ui'
import type { SelectFieldClientComponent } from 'payload'
import { useEffect, useState } from 'react'
import { allExtendedThemePresets } from '../extended-presets.js'

const ThemePresetSelectField: SelectFieldClientComponent = ({ field, path }) => {
  const { value, setValue } = useField<string>({ path })
  const [isOpen, setIsOpen] = useState(false)

  const options = (field.options as Array<{ label: string; value: string }>) || []
  const selectedOption = options.find((opt) => opt.value === value)

  const handleSelect = (optionValue: string) => {
    setValue(optionValue)
    setIsOpen(false)
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('.theme-preset-select-container')) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const label =
    typeof field.label === 'string'
      ? field.label
      : field.label?.en || field.label?.cs || 'Theme Preset'
  const description =
    typeof field.admin?.description === 'string'
      ? field.admin.description
      : field.admin?.description?.en || field.admin?.description?.cs

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

    return colors.slice(0, 5) // Max 5 swatches
  }

  return (
    <div
      className="theme-preset-select-container"
      style={{ position: 'relative', marginBottom: '16px' }}
    >
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

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          padding: '12px 14px',
          borderRadius: '6px',
          border: '1px solid var(--theme-elevation-200)',
          backgroundColor: 'var(--theme-input-bg)',
          color: 'var(--theme-elevation-800)',
          textAlign: 'left',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '14px',
          transition: 'border-color 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--theme-elevation-400)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--theme-elevation-200)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
          <span style={{ flex: 1 }}>{selectedOption?.label || 'Vyberte téma...'}</span>
          {selectedOption && (
            <div style={{ display: 'flex', gap: '4px' }}>
              {getPresetColors(selectedOption.value).map((color, index) => (
                <span
                  key={`${selectedOption.value}-swatch-${index}`}
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: color,
                    border: '1px solid rgba(15, 23, 42, 0.12)',
                    boxShadow: 'inset 0 1px 2px rgba(15, 23, 42, 0.08)',
                  }}
                />
              ))}
            </div>
          )}
        </div>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          style={{
            transition: 'transform 0.2s ease',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            marginLeft: '8px',
          }}
        >
          <path
            d="M3 4.5L6 7.5L9 4.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '4px',
            maxHeight: '320px',
            overflowY: 'auto',
            backgroundColor: 'var(--theme-elevation-0)',
            border: '1px solid var(--theme-elevation-200)',
            borderRadius: '8px',
            boxShadow: '0 8px 24px rgba(15, 23, 42, 0.15)',
            zIndex: 1000,
          }}
        >
          {options.map((option) => {
            const isSelected = option.value === value
            const colors = getPresetColors(option.value)

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  border: 'none',
                  backgroundColor: isSelected ? 'var(--theme-elevation-100)' : 'transparent',
                  color: 'var(--theme-elevation-800)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'background-color 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = 'var(--theme-elevation-50)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }
                }}
              >
                <div
                  style={{
                    fontWeight: isSelected ? 600 : 500,
                    flex: 1,
                  }}
                >
                  {option.label}
                </div>

                {/* Color Swatches */}
                <div style={{ display: 'flex', gap: '4px' }}>
                  {colors.map((color, index) => (
                    <span
                      key={`${option.value}-dropdown-swatch-${index}`}
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: color,
                        border: '1px solid rgba(15, 23, 42, 0.12)',
                        boxShadow: 'inset 0 1px 2px rgba(15, 23, 42, 0.08)',
                      }}
                    />
                  ))}
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default ThemePresetSelectField
