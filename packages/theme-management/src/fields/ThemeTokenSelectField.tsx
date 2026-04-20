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

  // Read tenant from the current form (sibling data) where present.
  // Prefer `tenant` field as it is populated correctly in most setups.
  const { value: formTenant } = useField<any>({ path: 'tenant' })

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

    const custom = field.admin?.custom as unknown as CustomAdmin

    // Prefer tenant ID from the current form (`formTenant`) first since editor fills the relation id.
    // If the relation is an object, prefer `id` over `slug` to avoid passing a human-readable slug when an id is available.
    // Then respect an explicit `admin.custom.tenantSlug` override, otherwise fall back to other heuristics.
    const tenantFromForm = (() => {
      if (typeof formTenant === 'string' && formTenant.trim()) return formTenant
      if (formTenant && typeof formTenant === 'object') {
        // Prefer id first
        return (formTenant.id ?? formTenant.slug ?? formTenant.value) as string | undefined
      }
      return undefined
    })()

    const inferredTenant = tenantFromForm ?? custom?.tenantSlug ?? inferTenant()

    // Determine admin language to pass as `locale` to fetch, if not provided
    const adminLang = getAdminLanguage()

    // Normalize fetch options so that even when callers provide an empty object ("{}"),
    // we still ensure `tenantSlug` and `locale` are set to sensible defaults (inferred/form/adminLang).
    const rawFetchOpts =
      custom?.fetchThemeConfigurationOptions ??
      custom?.fetchOptions ??
      (custom?.collectionSlug || typeof custom?.useGlobal !== 'undefined'
        ? ({
            collectionSlug: custom.collectionSlug,
            useGlobal: custom.useGlobal,
            depth: custom.depth,
            locale: custom.locale,
            draft: custom.draft,
            queryParams: custom.queryParams,
          } as unknown as FetchThemeConfigurationOptions)
        : undefined)

    // Always build a fetch options object so we can inject sensible defaults (tenantSlug, locale)
    // even when callers passed an empty object or no options at all.
    const fetchOpts: FetchThemeConfigurationOptions = {
      ...(rawFetchOpts ?? {}),
      tenantSlug: rawFetchOpts?.tenantSlug ?? inferredTenant,
      locale: rawFetchOpts?.locale ?? adminLang,
    }

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
          const fallbackCollection = custom?.collectionSlug || 'appearance-settings'
          const fallbackOpts: FetchThemeConfigurationOptions = {
            useGlobal: true,
            collectionSlug: fallbackCollection,
            tenantSlug: inferredTenant,
            locale: custom?.locale ?? adminLang,
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
  }, [themePresets, field.admin?.custom, formThemeConfiguration, formTenant])

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

  const selectedOption = options.find((opt) => opt.value === selectedValue)
  const selectedColor = selectedOption ? resolveCssColor(selectedOption.color) : ''
  const selectedLabel = selectedOption ? getOptionLabel(selectedOption) : ''

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
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          position: 'relative',
        }}
      >
        {/* Color preview swatch */}
        <div
          aria-hidden
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            border: '2px solid var(--theme-elevation-200)',
            backgroundColor: selectedColor,
            flexShrink: 0,
            transition: 'all 0.2s ease',
            boxShadow: selectedColor
              ? '0 2px 8px rgba(0, 0, 0, 0.1)'
              : 'inset 0 1px 2px rgba(0, 0, 0, 0.05)',
          }}
        />

        {/* Select dropdown */}
        <select
          id={path}
          value={selectedValue}
          onChange={(event) => handleSelect(event.target.value)}
          style={{
            flex: 1,
            padding: '10px 12px',
            borderRadius: '8px',
            border: '1px solid var(--theme-elevation-200)',
            backgroundColor: 'var(--theme-elevation-0)',
            color: 'var(--theme-elevation-900)',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
            appearance: 'none',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M1 4l5 4 5-4'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 10px center',
            paddingRight: '32px',
          }}
          onFocus={(event) => {
            event.target.style.borderColor = 'var(--theme-primary-500)'
            event.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
          }}
          onBlur={(event) => {
            event.target.style.borderColor = 'var(--theme-elevation-200)'
            event.target.style.boxShadow = 'none'
          }}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {getOptionLabel(option)}
            </option>
          ))}
        </select>
      </div>

      {/* Optional: Show selected label and color info */}
      {selectedLabel && (
        <div
          style={{
            marginTop: '10px',
            padding: '8px 12px',
            borderRadius: '6px',
            backgroundColor: 'var(--theme-elevation-50)',
            fontSize: '12px',
            color: 'var(--theme-elevation-700)',
          }}
        >
          <span style={{ fontWeight: 600 }}>
            {adminLang === 'cs' ? 'Vybraná barva:' : 'Selected color:'}
          </span>{' '}
          {selectedLabel}
          {selectedColor && selectedColor !== '' && (
            <span style={{ marginLeft: '8px', fontFamily: 'monospace', opacity: 0.7 }}>
              ({selectedColor})
            </span>
          )}
        </div>
      )}
    </div>
  )
}
