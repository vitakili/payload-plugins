'use client'

import { useField } from '@payloadcms/ui'
import type { SelectFieldClientProps } from 'payload'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { allThemePresets, fetchThemeConfiguration } from '../index.js'
import type { SiteThemeConfiguration } from '../payload-types.js'
import type { ThemePreset } from '../presets.js'
import type { FetchThemeConfigurationOptions } from '../types.js'
import { getAdminLanguage } from '../utils/getAdminLanguage.js'
import { inferTenant } from '../utils/inferTenant.js'
import { resolveThemeConfiguration } from '../utils/resolveThemeConfiguration.js'

interface ThemeColorOption {
  value: string
  label: string | { [key: string]: string | undefined }
  color: string
  description?: string
}

const FALLBACK_TOKENS: ThemeColorOption[] = [
  {
    value: 'background',
    label: { en: 'Theme background', cs: 'Pozadí tématu' },
    color: 'var(--background)',
  },
  { value: 'card', label: { en: 'Card background', cs: 'Pozadí karty' }, color: 'var(--card)' },
  { value: 'muted', label: { en: 'Muted surface', cs: 'Tlumený povrch' }, color: 'var(--muted)' },
  {
    value: 'accent',
    label: { en: 'Accent surface', cs: 'Akcentní povrch' },
    color: 'var(--accent)',
  },
  {
    value: 'secondary',
    label: { en: 'Secondary surface', cs: 'Sekundární povrch' },
    color: 'var(--secondary)',
  },
  {
    value: 'primary',
    label: { en: 'Primary surface', cs: 'Primární povrch' },
    color: 'var(--primary)',
  },
]

// Use plugin-provided fetch helper which supports collection/global and options
// This will use `collectionSlug`, `useGlobal`, tenant, locale, depth, draft, etc.
// Accept fetch options from field.admin.custom to allow overrides in different setups.

function buildOptionsFromConfiguration(
  configuration: SiteThemeConfiguration | Record<string, unknown> | null,
  themePresets: ThemePreset[],
): ThemeColorOption[] {
  if (!configuration) {
    return FALLBACK_TOKENS
  }

  const resolved = resolveThemeConfiguration(configuration)
  const lightMode = resolved.lightMode ?? themePresets[0]?.lightMode ?? {}
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

      const labelMap: Record<string, { en: string; cs: string }> = {
        background: { en: 'Theme background', cs: 'Pozadí tématu' },
        card: { en: 'Card background', cs: 'Pozadí karty' },
        muted: { en: 'Muted surface', cs: 'Tlumený povrch' },
        accent: { en: 'Accent surface', cs: 'Akcentní povrch' },
        secondary: { en: 'Secondary surface', cs: 'Sekundární povrch' },
        primary: { en: 'Primary surface', cs: 'Primární povrch' },
        popover: { en: 'Popover surface', cs: 'Popover povrch' },
      }

      return {
        value: key,
        label: labelMap[key] ?? { en: key, cs: key },
        color: value,
      }
    })
    .filter((token): token is NonNullable<typeof token> => token !== null)

  return tokens.length > 0 ? tokens : FALLBACK_TOKENS
}

export default function ThemeTokenSelectField(props: SelectFieldClientProps) {
  const { path, field } = props
  const { value, setValue } = useField<string>({ path })
  // Try to read themeConfiguration from the active form (Site Settings) first
  const { value: formThemeConfiguration } = useField<SiteThemeConfiguration | null>({
    path: 'themeConfiguration',
  })

  const [options, setOptions] = useState<ThemeColorOption[]>(FALLBACK_TOKENS)
  const selectedValue = value || 'background'

  // Get themePresets from admin.custom or use defaults
  const themePresets = useMemo(() => {
    const customPresets = (field.admin?.custom as { themePresets?: ThemePreset[] })?.themePresets
    return customPresets && customPresets.length > 0 ? customPresets : allThemePresets
  }, [field.admin?.custom])

  useEffect(() => {
    // If the active form contains themeConfiguration (e.g., editing Site Settings), prefer it
    if (formThemeConfiguration) {
      setOptions(buildOptionsFromConfiguration(formThemeConfiguration, themePresets))
      return
    }

    let isMounted = true

    // Allow fields to override fetch options via admin.custom
    type CustomAdmin = {
      fetchThemeConfigurationOptions?: FetchThemeConfigurationOptions
      fetchOptions?: FetchThemeConfigurationOptions
      collectionSlug?: string
      useGlobal?: boolean
      tenantSlug?: string
      depth?: number
      locale?: string
      draft?: boolean
      queryParams?: Record<string, unknown>
    }

    const custom = (field.admin?.custom as unknown as CustomAdmin) ?? {}

    // Use helper to infer tenant from different sources (custom override, URL params, global runtime, cookies)
    const inferredTenant = inferTenant(custom.tenantSlug)

    // Determine admin language to pass as `locale` to fetch, if not provided
    const adminLang = getAdminLanguage()

    const fetchOpts: FetchThemeConfigurationOptions | undefined =
      custom.fetchThemeConfigurationOptions ??
      custom.fetchOptions ??
      (custom.collectionSlug || typeof custom.useGlobal !== 'undefined'
        ? ({
            collectionSlug: custom.collectionSlug,
            useGlobal: custom.useGlobal,
            tenantSlug: inferredTenant,
            depth: custom.depth,
            // prefer explicit custom.locale, otherwise use admin language
            locale: custom.locale ?? adminLang,
            draft: custom.draft,
            queryParams: custom.queryParams,
          } as unknown as FetchThemeConfigurationOptions)
        : undefined)

    fetchThemeConfiguration(fetchOpts).then(async (configuration) => {
      if (!isMounted) return
      if (configuration) {
        setOptions(buildOptionsFromConfiguration(configuration, themePresets))
        return
      }

      // If nothing found and fetchOpts didn't explicitly request global, try fallback to global
      // This helps in setups where plugin created a standalone global (default slug 'appearance-settings')
      const explicitlyRequestedGlobal = !!(
        (fetchOpts as FetchThemeConfigurationOptions | undefined)?.useGlobal === true ||
        (fetchOpts as FetchThemeConfigurationOptions | undefined)?.collectionSlug ===
          'appearance-settings'
      )

      if (!explicitlyRequestedGlobal) {
        try {
          // Prefer custom.collectionSlug if provided, otherwise try the default standalone slug
          const fallbackCollection = (custom && custom.collectionSlug) || 'appearance-settings'
          const fallbackOpts: FetchThemeConfigurationOptions = {
            useGlobal: true,
            collectionSlug: fallbackCollection,
            tenantSlug: inferredTenant,
            locale: custom.locale ?? adminLang,
          }
          const fallbackConfig = await fetchThemeConfiguration(fallbackOpts)
          if (!isMounted) return
          if (fallbackConfig) {
            // Found theme config in global, use it
            setOptions(buildOptionsFromConfiguration(fallbackConfig, themePresets))
            return
          }
        } catch (e) {
          console.warn('[ThemeTokenSelectField] Fallback global fetch failed:', e)
        }
      }

      // final fallback: use empty tokens
      setOptions(buildOptionsFromConfiguration(configuration, themePresets))
    })

    return () => {
      isMounted = false
    }
  }, [themePresets, field.admin?.custom, formThemeConfiguration])

  const handleSelect = useCallback(
    (nextValue: string) => {
      setValue(nextValue)
    },
    [setValue],
  )

  // Make admin language reactive so switching admin UI language updates labels
  const initialAdminLang = getAdminLanguage()
  const [adminLang, setAdminLang] = useState<string>(initialAdminLang)

  useEffect(() => {
    if (typeof document === 'undefined' || !('MutationObserver' in window)) return
    const el = document.documentElement
    const obs = new MutationObserver(() => {
      const next = getAdminLanguage()
      if (next !== adminLang) setAdminLang(next)
    })
    obs.observe(el, { attributes: true, attributeFilter: ['lang'] })
    return () => obs.disconnect()
  }, [adminLang])

  const label =
    typeof field.label === 'string'
      ? field.label
      : (field.label && (field.label as Record<string, string>)[adminLang]) ||
        field.label?.en ||
        field.label?.cs ||
        ''

  let description = ''
  if (typeof field.admin?.description === 'string') {
    description = field.admin.description
  } else if (field.admin?.description && typeof field.admin.description === 'object') {
    description =
      (field.admin.description as Record<string, string>)[adminLang] ||
      (field.admin.description as Record<string, string>).en ||
      (field.admin.description as Record<string, string>).cs ||
      ''
  }

  // Helper function to get label text from localized or string label
  const getOptionLabel = (option: ThemeColorOption): string => {
    if (typeof option.label === 'string') {
      return option.label
    }
    // Prefer current admin language, fallback to English/Czech, then any available language
    return (
      (option.label as Record<string, string>)[adminLang] ||
      option.label.en ||
      option.label.cs ||
      Object.values(option.label)[0] ||
      option.value
    )
  }

  // Resolve CSS variable colors (e.g., 'var(--primary)') to their computed values when possible
  const resolveCssColor = (color: string): string => {
    if (typeof window === 'undefined' || !color || !color.trim().startsWith('var(')) {
      return color
    }

    try {
      const match = color.trim().match(/var\((--[^)]+)\)/)
      if (!match) return color
      const varName = match[1]
      const computed = getComputedStyle(document.documentElement).getPropertyValue(varName).trim()
      return computed || color
    } catch (e) {
      return color
    }
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
                  ? '2px solid var(--theme-success-500)'
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
                  backgroundColor: resolveCssColor(option.color),
                  flexShrink: 0,
                }}
              />
              <span
                style={{ fontSize: '13px', fontWeight: 600, color: 'var(--theme-elevation-800)' }}
              >
                {getOptionLabel(option)}
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
            {getOptionLabel(option)}
          </option>
        ))}
      </select>
    </div>
  )
}
