'use client'

import { Button, Drawer, useField, useModal } from '@payloadcms/ui'
import type { JSONFieldClientProps } from 'payload'
import { toast } from 'sonner'
import { useCallback, useMemo, useRef, useState, type ChangeEvent } from 'react'
import type { ThemePreset } from '../presets.js'
import { parseThemePresetInput } from '../utils/customThemePresets.js'

const baseClass = 'theme-preset-import-field'
const drawerSlug = 'import-theme-presets'

const ThemePresetImportField = ({ field, path }: JSONFieldClientProps) => {
  const { value, setValue } = useField<ThemePreset[] | null>({ path })
  const [textValue, setTextValue] = useState('')
  const { closeModal, openModal } = useModal()
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const presetSummary = useMemo(() => {
    if (!value || value.length === 0) {
      return 'No custom presets imported'
    }
    const names = value.map((preset) => preset.name).join(', ')
    return `${value.length} preset${value.length === 1 ? '' : 's'}: ${names}`
  }, [value])

  const applyFromText = useCallback(
    (raw: string) => {
      if (!raw.trim()) {
        setValue(null)
        closeModal(drawerSlug)
        toast.success('Cleared custom presets')
        return
      }

      const presets = parseThemePresetInput(raw)
      if (presets.length === 0) {
        toast.error('No valid presets found. Ensure each entry has a name and label.')
        return
      }

      setValue(presets)
      closeModal(drawerSlug)
      toast.success(`Imported ${presets.length} preset${presets.length === 1 ? '' : 's'}`)
      setTextValue('')
    },
    [setValue, closeModal],
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
        toast.error((error as Error).message)
      } finally {
        if (event.target) {
          event.target.value = ''
        }
      }
    },
    [applyFromText],
  )

  const handleImportClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleClear = useCallback(() => {
    setValue(null)
    toast.success('Cleared custom presets')
  }, [setValue])

  const label =
    typeof field.label === 'string' ? field.label : (field.label?.en ?? 'Custom Presets')
  const description =
    typeof field.admin?.description === 'string'
      ? field.admin.description
      : (field.admin?.description as Record<string, string>)?.en

  return (
    <>
      <div className={baseClass} style={{ display: 'grid', gap: '0.75rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <label style={{ fontWeight: 600 }}>{label}</label>
          {description && (
            <p style={{ margin: 0, color: 'var(--theme-elevation-500)', fontSize: '0.9rem' }}>
              {description}
            </p>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Button buttonStyle="secondary" onClick={() => openModal(drawerSlug)} size="small">
            Import Presets
          </Button>
          {value && value.length > 0 && (
            <Button buttonStyle="secondary" onClick={handleClear} size="small">
              Clear
            </Button>
          )}
          <span style={{ fontSize: '0.875rem', color: 'var(--theme-elevation-600)' }}>
            {presetSummary}
          </span>
        </div>
      </div>

      <Drawer slug={drawerSlug} title="Import Theme Presets">
        <div style={{ padding: '1.5rem', display: 'grid', gap: '1rem' }}>
          <p style={{ margin: 0, color: 'var(--theme-elevation-600)' }}>
            Paste JSON or upload a .json file containing theme preset definitions.
          </p>

          <textarea
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
              Upload JSON File
            </Button>
            <Button buttonStyle="primary" onClick={handleApplyClick} disabled={!textValue.trim()}>
              Apply
            </Button>
          </div>

          <input
            type="file"
            accept="application/json"
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
