'use client'

import { useField, useFormFields } from '@payloadcms/ui'
import { X } from 'lucide-react'
import type { TextFieldClientComponent } from 'payload'
import { HexColorInput, HexColorPicker } from 'react-colorful'
import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { useThemeLanguage, useThemeTranslations } from '../hooks/useThemeTranslations.js'
import { cssColorToHex as toHex, getContrastRatio } from '../utils/contrast.js'
import { resolveLocalizedText } from '../utils/localizedText.js'

// Import CSS for styling
if (typeof window !== 'undefined') {
  import('./ThemeColorPickerField.css').catch(() => {})
}

/**
 * Convert any CSS color string to hex for the picker, with a neutral fallback so
 * the swatch always renders. Delegates to the shared {@link toHex} util
 * (color package + canvas fallback for oklch/lch).
 */
function cssColorToHex(cssColor: string): string {
  if (!cssColor) return '#000000'
  return toHex(cssColor) ?? '#888888'
}

/** WCAG contrast ratio between two CSS colours (1–21), or null if unparseable. */
const contrastRatio = getContrastRatio

type ContrastLevel = 'aa' | 'aaLarge' | 'low'

function contrastLevel(ratio: number): ContrastLevel {
  if (ratio >= 4.5) return 'aa'
  if (ratio >= 3) return 'aaLarge'
  return 'low'
}

const format = (template: string, values: Record<string, string>) =>
  template.replace(/\{(\w+)\}/g, (match, key: string) => values[key] ?? match)

const SURFACE_TOKENS = ['card', 'popover', 'primary', 'secondary', 'muted', 'accent', 'destructive']

const isForegroundToken = (name: string) => name === 'foreground' || name.endsWith('Foreground')

/** The token a colour is read against: surfaces ↔ their `…Foreground`, background ↔ foreground. */
function contrastPartner(name: string): string | null {
  if (name === 'background') return 'foreground'
  if (name === 'foreground') return 'background'
  if (SURFACE_TOKENS.includes(name)) return `${name}Foreground`
  const base = name.endsWith('Foreground') ? name.slice(0, -'Foreground'.length) : ''
  return SURFACE_TOKENS.includes(base) ? base : null
}

const QUICK_COLORS = [
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
]

const ThemeColorPickerField: TextFieldClientComponent = ({ field, path }) => {
  const { value, setValue } = useField<string>({ path })
  const t = useThemeTranslations()
  const language = useThemeLanguage()
  const inputId = useId()
  const descriptionId = useId()
  const popoverId = useId()
  const [localValue, setLocalValue] = useState(value || '')
  const [showPicker, setShowPicker] = useState(false)
  const [hexValue, setHexValue] = useState(cssColorToHex(value || ''))
  const [isDragging, setIsDragging] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)
  const swatchRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    setLocalValue(value || '')
    setHexValue(cssColorToHex(value || ''))
  }, [value])

  const closePicker = useCallback((restoreFocus: boolean) => {
    setShowPicker(false)
    setIsDragging(false)
    if (restoreFocus) swatchRef.current?.focus()
  }, [])

  // Close on outside pointer, Escape; move focus into the popover when it opens.
  useEffect(() => {
    if (!showPicker) return

    function handlePointerOutside(event: PointerEvent) {
      const target = event.target as Node
      if (pickerRef.current?.contains(target) || swatchRef.current?.contains(target)) return
      closePicker(false)
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.stopPropagation()
        closePicker(true)
      }
    }

    document.addEventListener('pointerdown', handlePointerOutside)
    document.addEventListener('keydown', handleKeyDown)
    pickerRef.current?.querySelector<HTMLElement>('.react-colorful__interactive')?.focus()

    return () => {
      document.removeEventListener('pointerdown', handlePointerOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [showPicker, closePicker])

  // A drag ends wherever the pointer is released, when the browser cancels the
  // gesture (e.g. to scroll on touch), or when the window loses focus.
  useEffect(() => {
    if (!isDragging) return
    const endDrag = () => setIsDragging(false)
    window.addEventListener('pointerup', endDrag)
    window.addEventListener('pointercancel', endDrag)
    window.addEventListener('blur', endDrag)
    return () => {
      window.removeEventListener('pointerup', endDrag)
      window.removeEventListener('pointercancel', endDrag)
      window.removeEventListener('blur', endDrag)
    }
  }, [isDragging])

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

  const fieldName = path.split('.').pop() || ''
  const label = resolveLocalizedText(field.label, language, fieldName)
  const description = resolveLocalizedText(field.admin?.description, language)

  // Contrast is only meaningful against the token this colour is paired with
  // (e.g. primary ↔ primaryForeground), so measure that pair instead of white/black.
  const pairKey = contrastPartner(fieldName)
  const pairPath = pairKey ? [...path.split('.').slice(0, -1), pairKey].join('.') : null
  const pairValue = useFormFields(([fields]) =>
    pairPath ? (fields?.[pairPath]?.value as string | undefined) : undefined,
  )
  const ownValue = localValue || hexValue
  const pairSample =
    pairKey && typeof pairValue === 'string' && pairValue.trim()
      ? isForegroundToken(fieldName)
        ? {
            foreground: ownValue,
            background: pairValue,
            foregroundLabel: label,
            backgroundLabel: pairKey,
          }
        : {
            foreground: pairValue,
            background: ownValue,
            foregroundLabel: pairKey,
            backgroundLabel: label,
          }
      : null

  const levelLabel: Record<ContrastLevel, string> = {
    aa: t.colorPicker.levelAA,
    aaLarge: t.colorPicker.levelAALarge,
    low: t.colorPicker.levelLow,
  }

  return (
    <div className="theme-color-picker-field">
      <div className="field-header">
        <label className="field-label" htmlFor={inputId}>
          {label}
        </label>
        {description && (
          <div className="field-description" id={descriptionId}>
            {description}
          </div>
        )}
      </div>

      <div className="color-picker-container">
        <div className="color-input-row">
          <button
            ref={swatchRef}
            type="button"
            className="color-swatch-btn"
            style={{ backgroundColor: localValue || hexValue }}
            onClick={() => setShowPicker((open) => !open)}
            aria-label={`${t.colorPicker.openPicker}: ${label}`}
            aria-expanded={showPicker}
            aria-controls={showPicker ? popoverId : undefined}
            title={hexValue}
          />
          <input
            id={inputId}
            type="text"
            value={localValue || ''}
            onChange={(event) => handleTextChange(event.target.value)}
            placeholder={t.colorPicker.placeholder}
            aria-describedby={description ? descriptionId : undefined}
            spellCheck={false}
            className="color-text-input"
          />
        </div>

        {pairSample ? (
          <div className="color-contrast-row">
            {(() => {
              const ratio = contrastRatio(pairSample.foreground, pairSample.background)
              if (ratio == null) return null
              const level = contrastLevel(ratio)
              const title = format(t.colorPicker.pairContrastTitle, {
                foreground: pairSample.foregroundLabel,
                background: pairSample.backgroundLabel,
              })
              return (
                <span className="contrast-chip" title={`${title}: ${ratio.toFixed(2)}:1`}>
                  <span
                    className="contrast-sample"
                    style={{ background: pairSample.background, color: pairSample.foreground }}
                    aria-hidden="true"
                  >
                    Aa
                  </span>
                  <span className={`contrast-ratio contrast-ratio--${level}`}>
                    <span className="sr-only">{title}: </span>
                    {t.colorPicker.pairContrast} {ratio.toFixed(1)} · {levelLabel[level]}
                  </span>
                </span>
              )
            })()}
          </div>
        ) : null}

        {showPicker && (
          <div
            ref={pickerRef}
            id={popoverId}
            role="dialog"
            aria-label={`${t.colorPicker.title}: ${label}`}
            className="color-picker-popover"
            onPointerDown={() => setIsDragging(true)}
          >
            <div className="picker-header">
              <span className="picker-title">{t.colorPicker.title}</span>
              <button
                type="button"
                onClick={() => closePicker(true)}
                className="picker-close-btn"
                aria-label={t.colorPicker.close}
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>

            <HexColorPicker color={hexValue} onChange={handleHexChange} className="hex-picker" />

            <div className="hex-input-row">
              <HexColorInput
                color={hexValue}
                onChange={handleHexChange}
                prefixed
                placeholder="#000000"
                aria-label="HEX"
                className="hex-input"
              />
            </div>

            <div className="color-swatches">
              <div className="swatches-label">{t.colorPicker.quickColors}</div>
              <div className="swatches-grid">
                {QUICK_COLORS.map((color) => {
                  const selected = hexValue.toLowerCase() === color.toLowerCase()
                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => {
                        handleHexChange(color)
                        setValue(color)
                      }}
                      className={`swatch-btn ${selected ? 'selected' : ''}`}
                      style={{ backgroundColor: color }}
                      aria-label={`${t.colorPicker.selectColor} ${color}`}
                      aria-pressed={selected}
                      title={color}
                    />
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ThemeColorPickerField
