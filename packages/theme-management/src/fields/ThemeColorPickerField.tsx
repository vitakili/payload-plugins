'use client'

import { useField, useFormFields } from '@payloadcms/ui'
import type { TextFieldClientComponent } from 'payload'
import { HexColorInput, HexColorPicker } from 'react-colorful'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

// Import CSS only in browser environment
// This prevents Node.js from trying to import CSS directly
// which causes ERR_UNKNOWN_FILE_EXTENSION error
if (typeof window !== 'undefined') {
  // @ts-expect-error - Dynamic import of CSS is not recognized by TypeScript
  import('./ThemeColorPickerField.css').catch((err) => {
    console.warn('Failed to load CSS file:', err)
  })
}

function resolveLocalizedValue(value: unknown, fallback: string) {
  if (typeof value === 'string') {
    return value
  }

  if (typeof value === 'object' && value !== null) {
    const localized = value as Record<string, unknown>
    const resolved = localized.en ?? localized.cs ?? localized['']
    if (typeof resolved === 'string') {
      return resolved
    }
  }

  return fallback
}

/**
 * Convert various color formats to HEX for the color picker
 */
function toHex(color: string): string {
  if (!color) return '#000000'

  // Already hex
  if (color.startsWith('#')) return color

  // OKLCH format - extract hue and convert to approximate hex
  if (color.startsWith('oklch')) {
    // For now, return a default - proper conversion requires color-conversion library
    return '#3b82f6' // blue-500 as default
  }

  // HSL format
  if (color.startsWith('hsl')) {
    const regex = /hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/
    const match = regex.exec(color)
    if (match) {
      const [, h, s, l] = match.map(Number)
      return hslToHex(h, s, l)
    }
  }

  return '#000000'
}

/**
 * Convert HSL to HEX
 */
function hslToHex(h: number, s: number, l: number): string {
  s /= 100
  l /= 100

  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2

  let r = 0
  let g = 0
  let b = 0

  if (h >= 0 && h < 60) {
    r = c
    g = x
  } else if (h >= 60 && h < 120) {
    r = x
    g = c
  } else if (h >= 120 && h < 180) {
    g = c
    b = x
  } else if (h >= 180 && h < 240) {
    g = x
    b = c
  } else if (h >= 240 && h < 300) {
    r = x
    b = c
  } else if (h >= 300 && h < 360) {
    r = c
    b = x
  }

  const toHex = (n: number) => {
    const hex = Math.round((n + m) * 255).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

const ThemeColorPickerField: TextFieldClientComponent = ({ field, path }) => {
  const { value, setValue } = useField<string>({ path })
  const [localValue, setLocalValue] = useState(value || '')
  const [showPicker, setShowPicker] = useState(false)
  const [hexValue, setHexValue] = useState(toHex(value || ''))
  const pickerRef = useRef<HTMLDivElement>(null)
  const allFields = useFormFields(([fields]) => fields)

  const mode = path.includes('lightMode') ? 'lightMode' : 'darkMode'
  const modePrefix = `themeConfiguration.${mode}`

  useEffect(() => {
    setLocalValue(value || '')
    setHexValue(toHex(value || ''))
  }, [value])

  // Close picker when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowPicker(false)
      }
    }

    if (showPicker) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showPicker])

  const colorValues = useMemo(() => {
    if (!allFields) {
      return {}
    }

    const names = [
      'background',
      'foreground',
      'card',
      'cardForeground',
      'popover',
      'popoverForeground',
      'primary',
      'primaryForeground',
      'secondary',
      'secondaryForeground',
      'muted',
      'mutedForeground',
      'accent',
      'accentForeground',
      'destructive',
      'destructiveForeground',
      'border',
      'input',
      'ring',
    ]

    return names.reduce<Record<string, string>>((accumulator, name) => {
      const fieldState = allFields[`${modePrefix}.${name}`]
      const parsedValue = typeof fieldState?.value === 'string' ? fieldState.value : undefined
      accumulator[name] = parsedValue ?? ''
      return accumulator
    }, {})
  }, [allFields, modePrefix])

  const handleHexChange = useCallback(
    (hex: string) => {
      setHexValue(hex)
      setLocalValue(hex)
      setValue(hex)
    },
    [setValue],
  )

  const handleTextChange = useCallback(
    (nextValue: string) => {
      setLocalValue(nextValue)
      setValue(nextValue)
      setHexValue(toHex(nextValue))
    },
    [setValue],
  )

  const fieldName = path.split('.').pop() || ''
  const label = resolveLocalizedValue(field.label, fieldName)
  const description = resolveLocalizedValue(field.admin?.description, '')

  return (
    <div className="theme-color-picker-field">
      <div className="field-header">
        <label className="field-label">{label}</label>
        {description && <div className="field-description">{description}</div>}
      </div>

      <div className="color-picker-container" style={{ position: 'relative' }}>
        <div className="color-input-wrapper">
          <button
            type="button"
            className="color-swatch"
            style={{ backgroundColor: hexValue }}
            onClick={() => setShowPicker(!showPicker)}
            aria-label="Open color picker"
          />
          <input
            type="text"
            value={localValue || ''}
            onChange={(event) => handleTextChange(event.target.value)}
            placeholder="oklch(...) or #hex"
            className="text-input"
          />
        </div>

        {/* Compact Color Picker Popover */}
        {showPicker && (
          <div
            ref={pickerRef}
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              marginTop: '8px',
              padding: '16px',
              backgroundColor: 'var(--theme-elevation-0)',
              border: '1px solid var(--theme-elevation-200)',
              borderRadius: '8px',
              boxShadow: '0 8px 24px rgba(15, 23, 42, 0.15)',
              zIndex: 1000,
              width: '280px',
            }}
          >
            <HexColorPicker
              color={hexValue}
              onChange={handleHexChange}
              style={{ width: '100%', height: '160px' }}
            />

            <div style={{ marginTop: '12px', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <HexColorInput
                color={hexValue}
                onChange={handleHexChange}
                prefixed
                placeholder="#000000"
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid var(--theme-elevation-150)',
                  fontSize: '13px',
                  fontFamily: 'monospace',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPicker(false)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: 'var(--theme-elevation-500)',
                  color: 'var(--theme-elevation-0)',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 600,
                }}
              >
                OK
              </button>
            </div>

            {/* Quick Color Swatches */}
            <div style={{ marginTop: '12px' }}>
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  marginBottom: '6px',
                  color: 'var(--theme-elevation-500)',
                }}
              >
                Rychlé barvy
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '6px' }}>
                {[
                  '#ef4444',
                  '#f97316',
                  '#f59e0b',
                  '#84cc16',
                  '#10b981',
                  '#06b6d4',
                  '#3b82f6',
                  '#8b5cf6',
                  '#ec4899',
                  '#64748b',
                  '#000000',
                  '#ffffff',
                ].map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => handleHexChange(color)}
                    style={{
                      width: '100%',
                      height: '28px',
                      borderRadius: '4px',
                      border:
                        hexValue.toLowerCase() === color.toLowerCase()
                          ? '2px solid var(--theme-elevation-800)'
                          : '1px solid var(--theme-elevation-150)',
                      backgroundColor: color,
                      cursor: 'pointer',
                    }}
                    aria-label={`Select ${color}`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="color-preview" style={{ backgroundColor: hexValue }}>
          <span className="preview-label">{localValue || 'Not set'}</span>
        </div>
      </div>

      {(fieldName === 'primary' || fieldName === 'background') && (
        <div
          className="mini-preview"
          style={{
            backgroundColor: colorValues.background || '#ffffff',
            color: colorValues.foreground || '#000000',
            borderColor: colorValues.border || '#e2e8f0',
          }}
        >
          <div
            className="preview-card"
            style={{
              backgroundColor: colorValues.card || '#ffffff',
              color: colorValues.cardForeground || '#000000',
              borderColor: colorValues.border || '#e2e8f0',
            }}
          >
            <button
              className="preview-button"
              style={{
                backgroundColor: colorValues.primary || '#0070f3',
                color: colorValues.primaryForeground || '#ffffff',
              }}
            >
              Primary Button
            </button>
            <button
              className="preview-button secondary"
              style={{
                backgroundColor: colorValues.secondary || '#f1f5f9',
                color: colorValues.secondaryForeground || '#0f172a',
              }}
            >
              Secondary
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ThemeColorPickerField
