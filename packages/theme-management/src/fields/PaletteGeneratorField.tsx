'use client'

import { useForm, useFormFields } from '@payloadcms/ui'
import { ImageUp, Sparkles, Wand2 } from 'lucide-react'
import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { HexColorInput, HexColorPicker } from 'react-colorful'
import {
  createBulkWriter,
  getAppearanceSession,
  useAppearanceSession,
} from '../hooks/useAppearanceSession.js'
import { useThemeTranslations } from '../hooks/useThemeTranslations.js'
import {
  extractDominantColors,
  generatePaletteFromColor,
  type GeneratedColorMode,
} from '../utils/generatePalette.js'

/**
 * Admin tool that generates a full light + dark palette from a single brand
 * colour (or a colour extracted from an uploaded logo/image) and writes it
 * straight into the colour-mode fields.
 */
export default function PaletteGeneratorField() {
  const formFields = useFormFields(([state]) => state) as Record<
    string,
    { value?: unknown } | undefined
  >
  const { dispatchFields, setModified } = useForm()
  const t = useThemeTranslations().paletteGenerator
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const currentPrimary = (() => {
    const v = formFields?.['themeConfiguration.lightMode.primary']?.value
    return typeof v === 'string' && v.trim() ? v : '#3b82f6'
  })()

  const [seed, setSeed] = useState<string>(currentPrimary)
  const [swatches, setSwatches] = useState<string[]>([])
  const [open, setOpen] = useState(false)
  const [imageError, setImageError] = useState(false)
  const seedTouchedRef = useRef(false)

  // Follow the form's primary colour (e.g. after a preset is applied) until the
  // editor picks a seed of their own.
  useEffect(() => {
    if (!seedTouchedRef.current) setSeed(currentPrimary)
  }, [currentPrimary])

  const chooseSeed = useCallback((color: string) => {
    seedTouchedRef.current = true
    setSeed(color)
  }, [])

  const { locks } = useAppearanceSession()
  const appearanceT = useThemeTranslations().appearance
  const colorsLocked = locks.colors
  const lockNoteId = useId()

  const applyPalette = useCallback(() => {
    if (getAppearanceSession().locks.colors) return
    const palette = generatePaletteFromColor(seed)
    const writer = createBulkWriter(formFields, dispatchFields)
    ;(['lightMode', 'darkMode'] as const).forEach((mode) => {
      const colors = palette[mode]
      ;(Object.keys(colors) as Array<keyof GeneratedColorMode>).forEach((key) => {
        writer.write(`themeConfiguration.${mode}.${key}`, colors[key])
      })
    })
    // `dispatchFields` alone does not flip the form's dirty flag, so Payload
    // would keep the Save button disabled after generating a palette.
    setModified(true)
    writer.commit('palette', `${appearanceT.generatedPalette} ${seed}`)
  }, [seed, formFields, dispatchFields, setModified, appearanceT.generatedPalette])

  const handleFile = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setImageError(false)
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const colors = extractDominantColors(img, 6)
      setSwatches(colors)
      if (colors[0]) chooseSeed(colors[0])
      URL.revokeObjectURL(url)
    }
    img.onerror = () => {
      setImageError(true)
      URL.revokeObjectURL(url)
    }
    img.src = url
    // Allow re-selecting the same file after an error.
    event.target.value = ''
  }, [chooseSeed])

  return (
    <div
      style={{
        padding: '16px',
        borderRadius: '12px',
        border: '1px solid var(--theme-elevation-200)',
        backgroundColor: 'var(--theme-elevation-25)',
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '13px',
          fontWeight: 600,
          color: 'var(--theme-elevation-800)',
        }}
      >
        <Sparkles size={14} aria-hidden />
        {t.title}
      </div>
      <div style={{ fontSize: '12px', color: 'var(--theme-elevation-600)', marginBottom: '12px' }}>
        {t.subtitle}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: '16px' }}>
        {/* Seed colour */}
        <div style={{ display: 'grid', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label={`${t.seedLabel}: ${seed}`}
            aria-expanded={open}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 8px 4px 4px',
              borderRadius: '8px',
              border: '1px solid var(--theme-elevation-200)',
              background: 'var(--theme-elevation-50)',
              cursor: 'pointer',
            }}
          >
            <span
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                background: seed,
                border: '1px solid rgba(0,0,0,0.1)',
              }}
            />
            <span style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--theme-elevation-700)' }}>
              {seed}
            </span>
          </button>
          {open ? (
            <div style={{ display: 'grid', gap: '8px' }}>
              <HexColorPicker color={seed} onChange={chooseSeed} />
              <HexColorInput
                color={seed}
                onChange={chooseSeed}
                prefixed
                style={{
                  width: '160px',
                  padding: '6px 8px',
                  borderRadius: '6px',
                  border: '1px solid var(--theme-elevation-200)',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                }}
              />
            </div>
          ) : null}
        </div>

        {/* Actions */}
        <div style={{ display: 'grid', gap: '8px' }}>
          <button
            type="button"
            onClick={applyPalette}
            disabled={colorsLocked}
            aria-describedby={colorsLocked ? lockNoteId : undefined}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              border: 'none',
              cursor: colorsLocked ? 'not-allowed' : 'pointer',
              background: 'var(--theme-elevation-800)',
              color: 'var(--theme-elevation-0)',
              opacity: colorsLocked ? 0.5 : 1,
              fontWeight: 600,
              fontSize: '12px',
            }}
          >
            <Wand2 size={14} aria-hidden />
            {t.generate}
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              border: '1px solid var(--theme-elevation-200)',
              cursor: 'pointer',
              background: 'transparent',
              color: 'var(--theme-elevation-700)',
              fontWeight: 600,
              fontSize: '12px',
            }}
          >
            <ImageUp size={14} aria-hidden />
            {t.fromImage}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFile}
            style={{ display: 'none' }}
          />
          <div
            id={lockNoteId}
            style={{ fontSize: '12px', color: 'var(--theme-elevation-600)', maxWidth: '200px' }}
          >
            {colorsLocked ? appearanceT.colorsLocked : t.hint}
          </div>
        </div>
      </div>

      {imageError ? (
        <div role="alert" style={{ marginTop: '12px', fontSize: '12px', color: 'var(--theme-error-600)' }}>
          {t.imageError}
        </div>
      ) : null}

      {/* Extracted swatches */}
      {swatches.length > 0 ? (
        <div style={{ marginTop: '12px' }}>
          <div style={{ fontSize: '12px', color: 'var(--theme-elevation-600)', marginBottom: '6px' }}>
            {t.pick}
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {swatches.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => chooseSeed(color)}
                title={color}
                aria-label={`${t.useColor} ${color}`}
                aria-pressed={color === seed}
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '6px',
                  background: color,
                  cursor: 'pointer',
                  border:
                    color === seed
                      ? '2px solid var(--theme-elevation-800)'
                      : '1px solid rgba(0,0,0,0.12)',
                }}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
