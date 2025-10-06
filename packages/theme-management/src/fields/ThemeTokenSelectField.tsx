'use client'

import { useField } from '@payloadcms/ui'
import type { SelectFieldClientProps } from 'payload'
import { useCallback, useEffect, useState } from 'react'
import { defaultThemePresets } from '../presets.js'
import { resolveThemeConfiguration } from '../utils/resolveThemeConfiguration.js'

interface ThemeColorOption {
  value: string
  label: string
  color: string
  description?: string
}

const FALLBACK_TOKENS: ThemeColorOption[] = [
  { value: 'background', label: 'Theme background', color: 'var(--background)' },
  { value: 'card', label: 'Card background', color: 'var(--card)' },
  { value: 'muted', label: 'Muted surface', color: 'var(--muted)' },
  { value: 'accent', label: 'Accent surface', color: 'var(--accent)' },
  { value: 'secondary', label: 'Secondary surface', color: 'var(--secondary)' },
  { value: 'primary', label: 'Primary surface', color: 'var(--primary)' },
]

async function fetchThemeConfiguration(): Promise<Record<string, unknown> | null> {
  try {
    const response = await fetch('/api/site-settings')
    if (!response.ok) {
      return null
    }
    const data = await response.json()
    return data?.docs?.[0]?.themeConfiguration ?? null
  } catch (error) {
    console.warn('[ThemeTokenSelectField] Failed to fetch theme configuration:', error)
    return null
  }
}

function buildOptionsFromConfiguration(configuration: Record<string, unknown> | null): ThemeColorOption[] {
  if (!configuration) {
    return FALLBACK_TOKENS
  }

  const resolved = resolveThemeConfiguration(configuration)
  const lightMode = resolved.lightMode ?? defaultThemePresets[0]?.lightMode ?? {}
  const orderedKeys: string[] = [
    'background',
    'card',
    'muted',
    'accent',
    'secondary',
    'primary',
    'popover',
  ]

  const typedLightMode = lightMode as Record<string, string | null | undefined>

  const tokens = orderedKeys
    .map((key) => {
      const value = typedLightMode?.[key]
      if (typeof value !== 'string' || value.trim().length === 0) {
        return null
      }

      const labelMap: Record<string, string> = {
        background: 'Theme background',
        card: 'Card background',
        muted: 'Muted surface',
        accent: 'Accent surface',
        secondary: 'Secondary surface',
        primary: 'Primary surface',
        popover: 'Popover surface',
      }

      return {
        value: key,
        label: labelMap[key] ?? key,
        color: value,
      }
    })
    .filter((token): token is ThemeColorOption => Boolean(token))

  return tokens.length > 0 ? tokens : FALLBACK_TOKENS
}

export default function ThemeTokenSelectField(props: SelectFieldClientProps) {
  const { path, field } = props
  const { value, setValue } = useField<string>({ path })
  const [options, setOptions] = useState<ThemeColorOption[]>(FALLBACK_TOKENS)
  const selectedValue = value || 'background'

  useEffect(() => {
    let isMounted = true

    fetchThemeConfiguration().then((configuration) => {
      if (!isMounted) return
      setOptions(buildOptionsFromConfiguration(configuration))
    })

    return () => {
      isMounted = false
    }
  }, [])

  const handleSelect = useCallback(
    (nextValue: string) => {
      setValue(nextValue)
    },
    [setValue],
  )

  const label = typeof field.label === 'string' ? field.label : ''
  let description = ''
  if (typeof field.admin?.description === 'string') {
    description = field.admin.description
  } else if (
    field.admin?.description &&
    typeof field.admin.description === 'object' &&
    typeof field.admin.description.en === 'string'
  ) {
    description = field.admin.description.en
  }

  return (
    <div className="field-type theme-token-select">
      {label && (
        <label
          className="field-label"
          htmlFor={path}
          style={{ display: 'block', marginBottom: '8px' }}
        >
          {label}
          {field.required && <span className="required">*</span>}
        </label>
      )}

      {description && (
        <div
          className="field-description"
          style={{ marginBottom: '12px', fontSize: '13px', color: 'var(--theme-elevation-500)' }}
        >
          {description}
        </div>
      )}

      <div
        className="token-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
          gap: '10px',
        }}
      >
        {options.map((option) => {
          const isActive = option.value === selectedValue
          return (
            <button
              type="button"
              key={option.value}
              onClick={() => handleSelect(option.value)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                borderRadius: '10px',
                border: isActive
                  ? '2px solid var(--theme-primary-500)'
                  : '1px solid var(--theme-elevation-150)',
                backgroundColor: 'var(--theme-elevation-0)',
                boxShadow: isActive
                  ? '0 10px 20px -10px rgba(59, 130, 246, 0.4)'
                  : '0 1px 2px rgba(15, 23, 42, 0.08)',
                cursor: 'pointer',
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
              }}
            >
              <span
                aria-hidden
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  border: '1px solid rgba(15, 23, 42, 0.08)',
                  background: option.color,
                }}
              />
              <span
                style={{ fontSize: '13px', fontWeight: 600, color: 'var(--theme-elevation-800)' }}
              >
                {option.label}
              </span>
            </button>
          )
        })}
      </div>

      <select
        id={path}
        value={selectedValue}
        onChange={(event) => handleSelect(event.target.value)}
        style={{ display: 'none' }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
