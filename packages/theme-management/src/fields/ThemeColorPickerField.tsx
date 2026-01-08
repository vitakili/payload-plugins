'use client'

import { useField } from '@payloadcms/ui'
import Color from 'color'
import type { TextFieldClientComponent } from 'payload'
import { HexColorInput, HexColorPicker } from 'react-colorful'
import { useCallback, useEffect, useRef, useState } from 'react'

// Import CSS for styling
if (typeof window !== 'undefined') {
  // @ts-expect-error - Dynamic CSS import
  import('./ThemeColorPickerField.css').catch(() => {})
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

  return Color(color).hex().toString()
}

const ThemeColorPickerField: TextFieldClientComponent = ({ field, path }) => {
  const { value, setValue } = useField<string>({ path })
  const [localValue, setLocalValue] = useState(value || '')
  const [showPicker, setShowPicker] = useState(false)
  const [hexValue, setHexValue] = useState(toHex(value || ''))
  const pickerRef = useRef<HTMLDivElement>(null)

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

      <div className="color-picker-container">
        <div className="color-input-row">
          <button
            type="button"
            className="color-swatch-btn"
            style={{ backgroundColor: hexValue }}
            onClick={() => setShowPicker(!showPicker)}
            aria-label="Open color picker"
            title={hexValue}
          />
          <input
            type="text"
            value={localValue || ''}
            onChange={(event) => handleTextChange(event.target.value)}
            placeholder="oklch(...) or #hex"
            className="color-text-input"
          />
        </div>

        {showPicker && (
          <div ref={pickerRef} className="color-picker-popover">
            <div className="picker-header">
              <span className="picker-title">Color Picker</span>
              <button
                type="button"
                onClick={() => setShowPicker(false)}
                className="picker-close-btn"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <HexColorPicker color={hexValue} onChange={handleHexChange} className="hex-picker" />

            <div className="hex-input-row">
              <HexColorInput
                color={hexValue}
                onChange={handleHexChange}
                prefixed
                placeholder="#000000"
                className="hex-input"
              />
            </div>

            <div className="color-swatches">
              <div className="swatches-label">Quick Colors</div>
              <div className="swatches-grid">
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
                    className={`swatch-btn ${hexValue.toLowerCase() === color.toLowerCase() ? 'selected' : ''}`}
                    style={{ backgroundColor: color }}
                    aria-label={`Select ${color}`}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ThemeColorPickerField
