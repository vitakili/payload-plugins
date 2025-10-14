'use client'

import { useField } from '@payloadcms/ui'
import type { TextFieldClientProps } from 'payload'
import { useCallback, useEffect, useRef, useState } from 'react'

const colorPresets: Record<string, string[]> = {
  'Theme Colors': ['#3b82f6', '#1e40af', '#b45309', '#78716c', '#8b5cf6', '#f97316'],
  'Common Colors': ['#ef4444', '#10b981', '#f59e0b', '#06b6d4', '#ec4899', '#6b7280'],
  'Neutral Tones': ['#000000', '#1f2937', '#6b7280', '#d1d5db', '#f3f4f6', '#ffffff'],
}

function resolveLocalizedValue(value: unknown): string {
  if (typeof value === 'string') {
    return value
  }

  if (typeof value === 'object' && value !== null) {
    const localized = value as Record<string, unknown>
    const fallback = localized.en ?? localized.cs ?? localized['']
    return typeof fallback === 'string' ? fallback : ''
  }

  return ''
}

export default function ColorPickerField(props: TextFieldClientProps) {
  const { field, path } = props
  const { value = '#000000', setValue } = useField<string>({ path })
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)

  const fieldLabel = resolveLocalizedValue(field.label)
  const fieldDescription = resolveLocalizedValue(field.admin?.description)
  const placeholder = resolveLocalizedValue(field.admin?.placeholder) || 'e.g., #3b82f6, hsl(...)'

  const handleColorChange = useCallback(
    (color: string) => {
      setValue(color)
    },
    [setValue],
  )

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      handleColorChange(event.target.value)
    },
    [handleColorChange],
  )

  const togglePicker = useCallback(() => {
    setIsPickerOpen((previous) => !previous)
  }, [])

  useEffect(() => {
    if (!isPickerOpen) {
      return
    }

    function handleClickOutside(event: MouseEvent) {
      if (!pickerRef.current) {
        return
      }

      if (!pickerRef.current.contains(event.target as Node)) {
        setIsPickerOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isPickerOpen])

  return (
    <div className="field-type color-picker-field" style={{ position: 'relative' }}>
      {fieldLabel && (
        <label
          htmlFor={path}
          className="field-label"
          style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}
        >
          {fieldLabel}
          {field.required && (
            <span
              className="required"
              style={{ color: 'var(--theme-error-500)', marginLeft: '4px' }}
            >
              *
            </span>
          )}
        </label>
      )}

      {fieldDescription && (
        <div
          className="field-description"
          style={{
            marginBottom: '8px',
            fontSize: '13px',
            color: 'var(--theme-elevation-500)',
            lineHeight: 1.5,
          }}
        >
          {fieldDescription}
        </div>
      )}

      <div
        className="color-picker-input-group"
        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
      >
        <button
          type="button"
          onClick={togglePicker}
          className="color-preview-button"
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '6px',
            border: '2px solid #e5e7eb',
            backgroundColor: value || '#ffffff',
            cursor: 'pointer',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title={value ? `Current color: ${value}` : 'Select a color'}
        >
          {!value && <span style={{ fontSize: '20px', color: '#9ca3af' }}>?</span>}
        </button>

        <input
          id={path}
          type="text"
          value={value || ''}
          onChange={handleInputChange}
          placeholder={placeholder}
          style={{
            flex: 1,
            padding: '8px 12px',
            border: '1px solid var(--theme-elevation-150)',
            borderRadius: '6px',
            fontSize: '14px',
            fontFamily: 'monospace',
            backgroundColor: 'var(--theme-elevation-0)',
            color: 'var(--theme-elevation-1000)',
          }}
        />

        <input
          type="color"
          value={value?.startsWith('#') ? value : '#3b82f6'}
          onChange={handleInputChange}
          title="Pick a color"
          style={{
            width: '40px',
            height: '40px',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        />
      </div>

      {isPickerOpen && (
        <div
          ref={pickerRef}
          className="color-presets"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 1000,
            marginTop: '4px',
            padding: '16px',
            border: '1px solid var(--theme-elevation-150)',
            borderRadius: '8px',
            backgroundColor: 'var(--theme-elevation-0)',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            maxHeight: '300px',
            overflowY: 'auto',
          }}
        >
          <div
            style={{
              marginBottom: '16px',
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--theme-elevation-800)',
            }}
          >
            🎨 Professional Color Picker
          </div>

          {Object.entries(colorPresets).map(([groupName, colors]) => (
            <div key={groupName} style={{ marginBottom: '16px' }}>
              <div
                style={{
                  marginBottom: '8px',
                  fontSize: '12px',
                  fontWeight: 500,
                  color: 'var(--theme-elevation-600)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                {groupName}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '6px' }}>
                {colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => handleColorChange(color)}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '6px',
                      border:
                        value === color
                          ? '3px solid var(--theme-success-500)'
                          : '1px solid var(--theme-elevation-150)',
                      backgroundColor: color,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      position: 'relative',
                      overflow: 'hidden',
                      boxShadow:
                        value === color
                          ? '0 0 0 2px var(--theme-primary-200)'
                          : '0 1px 3px rgba(0, 0, 0, 0.1)',
                    }}
                    title={`${color} - Click to select`}
                    onMouseEnter={(event) => {
                      event.currentTarget.style.transform = 'scale(1.1)'
                    }}
                    onMouseLeave={(event) => {
                      event.currentTarget.style.transform = 'scale(1)'
                    }}
                  >
                    {color === '#ffffff' && (
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          border: '1px solid var(--theme-elevation-150)',
                          borderRadius: 'inherit',
                        }}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div
            style={{
              marginTop: '16px',
              paddingTop: '16px',
              borderTop: '1px solid var(--theme-elevation-100)',
            }}
          >
            <div
              style={{
                marginBottom: '8px',
                fontSize: '12px',
                fontWeight: 500,
                color: 'var(--theme-elevation-600)',
              }}
            >
              CUSTOM COLOR
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="color"
                value={value?.startsWith('#') ? value : '#3b82f6'}
                onChange={handleInputChange}
                style={{
                  width: '36px',
                  height: '36px',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              />
              <div style={{ fontSize: '11px', color: '#9ca3af', lineHeight: 1.3 }}>
                <div>
                  <strong>Formats:</strong>
                </div>
                <div>Hex, RGB, HSL, CSS vars</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
