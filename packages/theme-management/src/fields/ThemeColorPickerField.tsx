'use client'

import { useField, useFormFields } from '@payloadcms/ui'
import type { TextFieldClientComponent } from 'payload'
import { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import { HexColorPicker, HexColorInput } from 'react-colorful'
import './ThemeColorPickerField.css'

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

  const handleHexChange = useCallback((hex: string) => {
    setHexValue(hex)
    setLocalValue(hex)
    setValue(hex)
  }, [setValue])

  const handleTextChange = useCallback((nextValue: string) => {
    setLocalValue(nextValue)
    setValue(nextValue)
    setHexValue(toHex(nextValue))
  }, [setValue])

  const fieldName = path.split('.').pop() || ''
  const label = resolveLocalizedValue(field.label, fieldName)
  const description = resolveLocalizedValue(field.admin?.description, '')

  return (
    <div className="theme-color-picker-field">
      <div className="field-header">
        <label className="field-label">{label}</label>
        {description && <div className="field-description">{description}</div>}
      </div>

      <div className="color-picker-container">
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

        {/* Professional Color Picker Popover */}
        {showPicker && (
          <div className="color-picker-popover" ref={pickerRef}>
            <HexColorPicker color={hexValue} onChange={handleHexChange} />
            <div className="picker-footer">
              <HexColorInput
                color={hexValue}
                onChange={handleHexChange}
                prefixed
                placeholder="#000000"
                className="hex-input"
              />
              <button
                type="button"
                onClick={() => setShowPicker(false)}
                className="close-button"
              >
                Done
              </button>
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
