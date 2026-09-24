'use client'

import { Button, Drawer, useField, useModal } from '@payloadcms/ui'
import type { JSONFieldClientProps } from 'payload'
import { toast } from 'sonner'
import { useCallback, useId, useMemo, useRef, useState, type ChangeEvent } from 'react'
import { useThemeLanguage, useThemeTranslations } from '../hooks/useThemeTranslations.js'
import type { ThemePreset } from '../presets.js'
import { parseThemePresetInput } from '../utils/customThemePresets.js'
import { resolveLocalizedText } from '../utils/localizedText.js'

const format = (template: string, values: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (match, key: string) => String(values[key] ?? match))

const baseClass = 'theme-preset-import-field'
const drawerSlug = 'import-theme-presets'

const ThemePresetImportField = ({ field, path }: JSONFieldClientProps) => {
  const { value, setValue } = useField<ThemePreset[] | null>({ path })
  const [textValue, setTextValue] = useState('')
  const { closeModal, openModal } = useModal()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const t = useThemeTranslations().presetImport
  const language = useThemeLanguage()
  const textareaId = useId()

  const presetSummary = useMemo(() => {
    if (!value || value.length === 0) {
      return t.none
    }
    const names = value.map((preset) => preset.label || preset.name).join(', ')
    return format(t.summary, { count: value.length, names })
  }, [value, t])

  const applyFromText = useCallback(
    (raw: string) => {
      if (!raw.trim()) {
        setValue(null)
        closeModal(drawerSlug)
        toast.success(t.cleared)
        return
      }

      const presets = parseThemePresetInput(raw)
      if (presets.length === 0) {
        toast.error(t.invalid)
        return
      }

      setValue(presets)
      closeModal(drawerSlug)
      toast.success(format(t.imported, { count: presets.length }))
      setTextValue('')
    },
    [setValue, closeModal, t],
  )

  const handleApplyClick = useCallback(() => {
    applyFromText(textValue)
  }, [applyFromText, textValue])

  const handleFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target?.files?.[0]
      if (!file) return
      try {
        const content = await file.text()
        setTextValue(content)
        applyFromText(content)
      } catch (error) {
        toast.error(format(t.readError, { message: (error as Error).message }))
      } finally {
        if (event.target) {
          event.target.value = ''
        }
      }
    },
    [applyFromText, t],
  )

  const handleImportClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleClear = useCallback(() => {
    setValue(null)
    toast.success(t.cleared)
  }, [setValue, t])

  const label = resolveLocalizedText(field.label, language, t.drawerTitle)
  const description = resolveLocalizedText(field.admin?.description, language)

  return (
    <>
      <div className={baseClass} style={{ display: 'grid', gap: '0.75rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <div style={{ fontWeight: 600 }}>{label}</div>
          {description && (
            <p style={{ margin: 0, color: 'var(--theme-elevation-600)', fontSize: '0.9rem' }}>
              {description}
            </p>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Button buttonStyle="secondary" onClick={() => openModal(drawerSlug)} size="small">
            {t.importButton}
          </Button>
          {value && value.length > 0 && (
            <Button buttonStyle="secondary" onClick={handleClear} size="small">
              {t.clearButton}
            </Button>
          )}
          <span
            role="status"
            style={{ fontSize: '0.875rem', color: 'var(--theme-elevation-600)' }}
          >
            {presetSummary}
          </span>
        </div>
      </div>

      <Drawer slug={drawerSlug} title={t.drawerTitle}>
        <div style={{ padding: '1.5rem', display: 'grid', gap: '1rem' }}>
          <p style={{ margin: 0, color: 'var(--theme-elevation-600)' }}>{t.drawerIntro}</p>

          <label htmlFor={textareaId} style={{ fontWeight: 600, fontSize: '0.875rem' }}>
            {t.textareaLabel}
          </label>
          <textarea
            id={textareaId}
            value={textValue}
            onChange={(event) => setTextValue(event.target.value)}
            rows={15}
            spellCheck={false}
            style={{
              width: '100%',
              fontFamily: 'monospace',
              borderRadius: '8px',
              border: '1px solid var(--theme-elevation-200)',
              padding: '12px',
              fontSize: '0.875rem',
              background: 'var(--theme-input-bg, var(--theme-elevation-0))',
              color: 'var(--theme-text)',
            }}
            placeholder={`[
  {
    "name": "brand-dark",
    "label": "Brand Dark",
    "borderRadius": "medium",
    "lightMode": { "background": "#ffffff", "foreground": "#111" },
    "darkMode": { "background": "#0a0a0a", "foreground": "#fff" }
  }
]`}
          />

          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <Button buttonStyle="secondary" onClick={handleImportClick}>
              {t.uploadButton}
            </Button>
            <Button buttonStyle="primary" onClick={handleApplyClick} disabled={!textValue.trim()}>
              {t.applyButton}
            </Button>
          </div>

          <input
            type="file"
            accept="application/json,.json"
            aria-hidden="true"
            tabIndex={-1}
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </div>
      </Drawer>
    </>
  )
}

export default ThemePresetImportField
