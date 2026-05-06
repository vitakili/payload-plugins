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
 * Convert any CSS color string to hex for the picker.
 * Uses 'color' package for hex/rgb/hsl; falls back to canvas
 * for modern formats (oklch, oklab, lch, etc.) which all
 * modern browsers support in fillStyle.
 */
function cssColorToHex(cssColor: string): string {
  if (!cssColor) return '#000000'
  try {
    return Color(cssColor).hex().toString()
  } catch {}
  // Canvas fallback — Chrome 111+, Firefox 113+, Safari 16.4+ all support oklch in fillStyle
  if (typeof document === 'undefined') return '#888888'
  try {
    const cv = document.createElement('canvas')
    cv.width = 1
    cv.height = 1
    const ctx = cv.getContext('2d')
    if (!ctx) return '#888888'
    ctx.fillStyle = cssColor
    ctx.fillRect(0, 0, 1, 1)
    const [r, g, b] = Array.from(ctx.getImageData(0, 0, 1, 1).data)
    return '#' + [r, g, b].map((n) => (n as number).toString(16).padStart(2, '0')).join('')
  } catch {
    return '#888888'
  }
}

const ThemeColorPickerField: TextFieldClientComponent = ({ field, path }) => {
  const { value, setValue } = useField<string>({ path })
  const [localValue, setLocalValue] = useState(value || '')
  const [showPicker, setShowPicker] = useState(false)
  const [hexValue, setHexValue] = useState(cssColorToHex(value || ''))
  const [isDragging, setIsDragging] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setLocalValue(value || '')
    setHexValue(cssColorToHex(value || ''))
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

  // Only update parent setValue when drag completes
  useEffect(() => {
    if (!isDragging) {
      setValue(localValue)
    }
  }, [isDragging, localValue, setValue])

  const handleHexChange = useCallback((hex: string) => {
    setHexValue(hex)
    setLocalValue(hex)
  }, [])

  const handleTextChange = useCallback((nextValue: string) => {
    setLocalValue(nextValue)
    setHexValue(cssColorToHex(nextValue))
  }, [])

  const handlePickerMouseDown = useCallback(() => {
    setIsDragging(true)
  }, [])

  const handlePickerMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

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
            style={{ backgroundColor: localValue || hexValue }}
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
          <div
            ref={pickerRef}
            className="color-picker-popover"
            onMouseDown={handlePickerMouseDown}
            onMouseUp={handlePickerMouseUp}
            onMouseLeave={handlePickerMouseUp}
          >
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
                    onClick={() => {
                      handleHexChange(color)
                      setValue(color)
                    }}
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
