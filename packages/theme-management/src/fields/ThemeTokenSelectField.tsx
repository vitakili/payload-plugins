'use client'

import { useField } from '@payloadcms/ui'
import type { SelectFieldClientProps } from 'payload'
import { Check, ChevronDown } from 'lucide-react'
import { useCallback, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { allThemePresets, fetchThemeConfiguration } from '../index.js'
import type { SiteThemeConfiguration } from '../payload-types.js'
import type { ThemePreset } from '../presets.js'
import type { FetchThemeConfigurationOptions } from '../types.js'
import { useThemeLanguage, useThemeTranslations } from '../hooks/useThemeTranslations.js'
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
    label: { en: 'Theme background', cs: 'Pozadí motivu' },
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
        background: { en: 'Theme background', cs: 'Pozadí motivu' },
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
  // Active Payload admin language (reactive via Payload's i18n context).
  const adminLang = useThemeLanguage()
  const t = useThemeTranslations()

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

    const controller = new AbortController()

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
      queryParams?: Record<string, string | number | boolean>
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
      signal: controller.signal,
    }

    fetchThemeConfiguration(fetchOpts).then(async (configuration) => {
      if (controller.signal.aborted) return
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
            signal: controller.signal,
          }
          const fallbackConfig = await fetchThemeConfiguration(fallbackOpts)
          if (controller.signal.aborted) return
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
      controller.abort()
    }
  }, [themePresets, field.admin?.custom, formThemeConfiguration, formTenant, adminLang])

  const handleSelect = useCallback(
    (nextValue: string) => {
      setValue(nextValue)
    },
    [setValue],
  )

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

  const selectedIndex = options.findIndex((opt) => opt.value === selectedValue)
  const selectedOption = selectedIndex >= 0 ? options[selectedIndex] : undefined
  const selectedColor = selectedOption ? resolveCssColor(selectedOption.color) : ''
  const selectedLabel = selectedOption ? getOptionLabel(selectedOption) : ''
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const baseId = useId()
  const labelId = `${baseId}-label`
  const listboxId = `${baseId}-listbox`
  const optionId = (index: number) => `${baseId}-option-${index}`
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const listboxRef = useRef<HTMLDivElement>(null)

  const openList = (index = selectedIndex >= 0 ? selectedIndex : 0) => {
    setActiveIndex(index)
    setIsOpen(true)
  }

  const closeList = useCallback((restoreFocus: boolean) => {
    setIsOpen(false)
    if (restoreFocus) triggerRef.current?.focus()
  }, [])

  const chooseOption = (index: number) => {
    const option = options[index]
    if (!option) return
    handleSelect(option.value)
    closeList(true)
  }

  useEffect(() => {
    if (!isOpen) return
    listboxRef.current?.focus()
    const handlePointerOutside = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) closeList(false)
    }
    document.addEventListener('pointerdown', handlePointerOutside)
    return () => document.removeEventListener('pointerdown', handlePointerOutside)
  }, [isOpen, closeList])

  useEffect(() => {
    if (!isOpen || activeIndex < 0) return
    listboxRef.current
      ?.querySelector<HTMLElement>(`#${CSS.escape(optionId(activeIndex))}`)
      ?.scrollIntoView({ block: 'nearest' })
  }, [isOpen, activeIndex])

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
      event.preventDefault()
      openList()
    }
  }

  const handleListboxKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const last = options.length - 1
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        setActiveIndex((i) => Math.min(last, i + 1))
        break
      case 'ArrowUp':
        event.preventDefault()
        setActiveIndex((i) => Math.max(0, i - 1))
        break
      case 'Home':
        event.preventDefault()
        setActiveIndex(0)
        break
      case 'End':
        event.preventDefault()
        setActiveIndex(last)
        break
      case 'Enter':
      case ' ':
        event.preventDefault()
        chooseOption(activeIndex)
        break
      case 'Escape':
        event.preventDefault()
        event.stopPropagation()
        closeList(true)
        break
      case 'Tab':
        closeList(false)
        break
    }
  }

  return (
    <div className="field-type theme-token-select">
      {label && (
        <div className="field-label" id={labelId} style={{ display: 'block', marginBottom: '8px' }}>
          {label}
          {field.required && <span className="required">*</span>}
        </div>
      )}

      {description && (
        <div
          className="field-description"
          style={{ marginBottom: '12px', fontSize: '13px', color: 'var(--theme-elevation-600)' }}
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
            boxShadow: selectedColor
              ? '0 2px 8px rgba(0, 0, 0, 0.1)'
              : 'inset 0 1px 2px rgba(0, 0, 0, 0.05)',
          }}
        />

        {/* Select-only combobox (WAI-ARIA): button trigger + keyboard listbox */}
        <div ref={containerRef} style={{ flex: 1, minWidth: 0, position: 'relative' }}>
          <button
            ref={triggerRef}
            id={path}
            type="button"
            role="combobox"
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            aria-controls={isOpen ? listboxId : undefined}
            aria-labelledby={label ? `${labelId} ${baseId}-value` : undefined}
            onClick={() => (isOpen ? closeList(false) : openList())}
            onKeyDown={handleTriggerKeyDown}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px',
              padding: '10px 12px',
              borderRadius: '8px',
              border: '1px solid var(--theme-elevation-200)',
              backgroundColor: 'var(--theme-input-bg, var(--theme-elevation-0))',
              color: 'var(--theme-elevation-900)',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <span id={`${baseId}-value`} style={{ minWidth: 0 }}>
              {selectedLabel}
            </span>
            <ChevronDown
              size={14}
              aria-hidden
              style={{ flexShrink: 0, transform: isOpen ? 'rotate(180deg)' : undefined }}
            />
          </button>

          {isOpen && (
            <div
              ref={listboxRef}
              id={listboxId}
              role="listbox"
              tabIndex={-1}
              aria-labelledby={label ? labelId : undefined}
              aria-activedescendant={activeIndex >= 0 ? optionId(activeIndex) : undefined}
              onKeyDown={handleListboxKeyDown}
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                marginTop: '4px',
                backgroundColor: 'var(--theme-elevation-0)',
                border: '1px solid var(--theme-elevation-200)',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                zIndex: 1000,
                maxHeight: '300px',
                overflowY: 'auto',
              }}
            >
              {options.map((option, index) => {
                const isSelected = option.value === selectedValue
                const isActive = index === activeIndex
                const optionColor = resolveCssColor(option.color)
                return (
                  <div
                    key={option.value}
                    id={optionId(index)}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => chooseOption(index)}
                    onPointerMove={() => setActiveIndex(index)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 12px',
                      backgroundColor: isActive
                        ? 'var(--theme-elevation-100)'
                        : isSelected
                          ? 'var(--theme-elevation-50)'
                          : 'transparent',
                      outline: isActive ? '2px solid var(--theme-elevation-800)' : undefined,
                      outlineOffset: '-2px',
                      color: 'var(--theme-elevation-900)',
                      fontSize: '14px',
                      fontWeight: isSelected ? 600 : 500,
                      cursor: 'pointer',
                    }}
                  >
                    <span
                      aria-hidden
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '6px',
                        border: '1px solid var(--theme-elevation-150)',
                        backgroundColor: optionColor,
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ flex: 1 }}>{getOptionLabel(option)}</span>
                    {isSelected && <Check size={14} aria-hidden />}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

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
          <span style={{ fontWeight: 600 }}>{t.ui.selectedColor}</span> {selectedLabel}
          {selectedColor && selectedColor !== '' && (
            <span style={{ marginLeft: '8px', fontFamily: 'monospace', color: 'var(--theme-elevation-600)' }}>
              ({selectedColor})
            </span>
          )}
        </div>
      )}
    </div>
  )
}

