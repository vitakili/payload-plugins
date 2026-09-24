'use client'

import { useField } from '@payloadcms/ui'
import { Palette } from 'lucide-react'
import type { TextFieldClientProps } from 'payload'
import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { useThemeLanguage, useThemeTranslations } from '../hooks/useThemeTranslations.js'
import { resolveLocalizedText } from '../utils/localizedText.js'

type PresetGroup = 'themeColors' | 'commonColors' | 'neutralTones'

const colorPresets: Record<PresetGroup, string[]> = {
  themeColors: ['#3b82f6', '#1e40af', '#b45309', '#78716c', '#8b5cf6', '#f97316'],
  commonColors: ['#ef4444', '#10b981', '#f59e0b', '#06b6d4', '#ec4899', '#6b7280'],
  neutralTones: ['#000000', '#1f2937', '#6b7280', '#d1d5db', '#f3f4f6', '#ffffff'],
}

export default function ColorPickerField(props: TextFieldClientProps) {
  const { field, path } = props
  const { value = '#000000', setValue } = useField<string>({ path })
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const t = useThemeTranslations().colorPicker
  const language = useThemeLanguage()
  const inputId = useId()
  const descriptionId = useId()
  const popoverId = useId()

  const fieldLabel = resolveLocalizedText(field.label, language)
  const fieldDescription = resolveLocalizedText(field.admin?.description, language)
  const placeholder =
    resolveLocalizedText(field.admin?.placeholder, language) || t.placeholder

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

    function handlePointerOutside(event: PointerEvent) {
      const target = event.target as Node
      if (pickerRef.current?.contains(target) || toggleRef.current?.contains(target)) {
        return
      }
      setIsPickerOpen(false)
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsPickerOpen(false)
        toggleRef.current?.focus()
      }
    }

    document.addEventListener('pointerdown', handlePointerOutside)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isPickerOpen])

  return (
    <div className="field-type color-picker-field" style={{ position: 'relative' }}>
      {fieldLabel && (
        <label
          htmlFor={inputId}
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
          id={descriptionId}
          className="field-description"
          style={{
            marginBottom: '8px',
            fontSize: '13px',
            color: 'var(--theme-elevation-600)',
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
          ref={toggleRef}
          type="button"
          onClick={togglePicker}
          className="color-preview-button"
          aria-expanded={isPickerOpen}
          aria-controls={isPickerOpen ? popoverId : undefined}
          aria-label={`${t.presetsTitle}${fieldLabel ? `: ${fieldLabel}` : ''}`}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '6px',
            border: '2px solid var(--theme-elevation-200)',
            backgroundColor: value || 'var(--theme-elevation-0)',
            cursor: 'pointer',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title={value ? `${t.currentColor}: ${value}` : t.presetsTitle}
        >
          {!value && <Palette size={18} color="var(--theme-elevation-500)" aria-hidden />}
        </button>

        <input
          id={inputId}
          type="text"
          value={value || ''}
          onChange={handleInputChange}
          placeholder={placeholder}
          aria-describedby={fieldDescription ? descriptionId : undefined}
          spellCheck={false}
          style={{
            flex: 1,
            minWidth: 0,
            padding: '8px 12px',
            border: '1px solid var(--theme-elevation-150)',
            borderRadius: '6px',
            fontSize: '14px',
            fontFamily: 'monospace',
            backgroundColor: 'var(--theme-input-bg, var(--theme-elevation-0))',
            color: 'var(--theme-elevation-1000)',
          }}
        />

        <input
          type="color"
          value={value?.startsWith('#') ? value : '#3b82f6'}
          onChange={handleInputChange}
          title={t.customColor}
          aria-label={t.customColor}
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
          id={popoverId}
          role="dialog"
          aria-label={t.presetsTitle}
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
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '16px',
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--theme-elevation-800)',
            }}
          >
            <Palette size={14} aria-hidden />
            {t.presetsTitle}
          </div>

          {(Object.keys(colorPresets) as PresetGroup[]).map((group) => (
            <div key={group} role="group" aria-label={t[group]} style={{ marginBottom: '16px' }}>
              <div
                style={{
                  marginBottom: '8px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--theme-elevation-600)',
                }}
              >
                {t[group]}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '6px' }}>
                {colorPresets[group].map((color) => {
                  const selected = value === color
                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => handleColorChange(color)}
                      aria-pressed={selected}
                      aria-label={`${t.selectColor} ${color}`}
                      title={color}
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '6px',
                        border: selected
                          ? '3px solid var(--theme-elevation-900)'
                          : '1px solid var(--theme-elevation-200)',
                        backgroundColor: color,
                        cursor: 'pointer',
                        boxShadow: selected
                          ? '0 0 0 2px var(--theme-elevation-0)'
                          : '0 1px 3px rgba(0, 0, 0, 0.1)',
                      }}
                    />
                  )
                })}
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
                fontWeight: 600,
                color: 'var(--theme-elevation-600)',
              }}
            >
              {t.customColor}
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="color"
                value={value?.startsWith('#') ? value : '#3b82f6'}
                onChange={handleInputChange}
                aria-label={t.customColor}
                style={{
                  width: '36px',
                  height: '36px',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              />
              <div style={{ fontSize: '12px', color: 'var(--theme-elevation-600)', lineHeight: 1.4 }}>
                {t.formats}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
