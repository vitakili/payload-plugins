'use client'

import { useField, useFormFields } from '@payloadcms/ui'
import type { TextFieldClientComponent } from 'payload'
import { useEffect, useMemo, useState } from 'react'
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

const ThemeColorPickerField: TextFieldClientComponent = ({ field, path }) => {
  const { value, setValue } = useField<string>({ path })
  const [localValue, setLocalValue] = useState(value || '')
  const allFields = useFormFields(([fields]) => fields)

  const mode = path.includes('lightMode') ? 'lightMode' : 'darkMode'
  const modePrefix = `themeConfiguration.${mode}`

  useEffect(() => {
    setLocalValue(value || '')
  }, [value])

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

  function handleChange(nextValue: string) {
    setLocalValue(nextValue)
    setValue(nextValue)
  }

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
          <input
            type="color"
            value={localValue || '#000000'}
            onChange={(event) => handleChange(event.target.value)}
            className="color-input"
          />
          <input
            type="text"
            value={localValue || ''}
            onChange={(event) => handleChange(event.target.value)}
            placeholder="#000000"
            className="text-input"
            pattern="^#[0-9A-Fa-f]{6}$"
          />
        </div>

        <div className="color-preview" style={{ backgroundColor: localValue || '#000000' }}>
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
