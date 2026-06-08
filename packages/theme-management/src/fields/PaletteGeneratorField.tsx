'use client'

import { useForm, useFormFields } from '@payloadcms/ui'
import { ImageUp, Sparkles, Wand2 } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import { HexColorInput, HexColorPicker } from 'react-colorful'
import { useThemeLanguage } from '../hooks/useThemeTranslations.js'
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
  const { dispatchFields } = useForm()
  const lang = useThemeLanguage() as 'en' | 'cs'
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const currentPrimary = (() => {
    const v = formFields?.['themeConfiguration.lightMode.primary']?.value
    return typeof v === 'string' && v.trim() ? v : '#3b82f6'
  })()

  const [seed, setSeed] = useState<string>(currentPrimary)
  const [swatches, setSwatches] = useState<string[]>([])
  const [open, setOpen] = useState(false)

  const t = {
    title: lang === 'cs' ? 'Generátor palety' : 'Palette generator',
    subtitle:
      lang === 'cs'
        ? 'Z jedné značkové barvy (nebo z loga) vytvoří kompletní světlou i tmavou paletu.'
        : 'Builds a complete light & dark palette from one brand colour (or a logo).',
    generate: lang === 'cs' ? 'Vygenerovat paletu' : 'Generate palette',
    fromImage: lang === 'cs' ? 'Extrahovat z obrázku' : 'Extract from image',
    pick: lang === 'cs' ? 'Vyber barvu z loga:' : 'Pick a colour from the logo:',
    hint:
      lang === 'cs'
        ? 'Přepíše barvy ve světlém i tmavém režimu.'
        : 'Overwrites light & dark mode colours.',
  }

  const applyPalette = useCallback(() => {
    const palette = generatePaletteFromColor(seed)
    ;(['lightMode', 'darkMode'] as const).forEach((mode) => {
      const colors = palette[mode]
      ;(Object.keys(colors) as Array<keyof GeneratedColorMode>).forEach((key) => {
        dispatchFields({
          type: 'UPDATE',
          path: `themeConfiguration.${mode}.${key}`,
          value: colors[key],
        })
      })
    })
  }, [seed, dispatchFields])

  const handleFile = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const colors = extractDominantColors(img, 6)
      setSwatches(colors)
      if (colors[0]) setSeed(colors[0])
      URL.revokeObjectURL(url)
    }
    img.onerror = () => URL.revokeObjectURL(url)
    img.src = url
  }, [])

  return (
    <div style={{ marginBottom: '20px' }}>
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
      <div style={{ fontSize: '11px', color: 'var(--theme-elevation-500)', marginBottom: '12px' }}>
        {t.subtitle}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: '16px' }}>
        {/* Seed colour */}
        <div style={{ display: 'grid', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle colour picker"
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
              <HexColorPicker color={seed} onChange={setSeed} />
              <HexColorInput
                color={seed}
                onChange={setSeed}
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
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              background: 'var(--theme-elevation-800)',
              color: 'var(--theme-elevation-0)',
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
          <div style={{ fontSize: '10px', color: 'var(--theme-elevation-400)', maxWidth: '180px' }}>
            {t.hint}
          </div>
        </div>
      </div>

      {/* Extracted swatches */}
      {swatches.length > 0 ? (
        <div style={{ marginTop: '12px' }}>
          <div style={{ fontSize: '11px', color: 'var(--theme-elevation-600)', marginBottom: '6px' }}>
            {t.pick}
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {swatches.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setSeed(color)}
                title={color}
                aria-label={`Use ${color}`}
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
