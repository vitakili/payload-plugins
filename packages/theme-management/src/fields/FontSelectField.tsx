'use client'

import { useField } from '@payloadcms/ui'
import { Check, ChevronDown } from 'lucide-react'
import type { SelectFieldClientComponent } from 'payload'
import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { useThemeLanguage, useThemeTranslations } from '../hooks/useThemeTranslations.js'
import { resolveLocalizedText } from '../utils/localizedText.js'

type LocalizedLabel = Record<string, string>

interface FontOption {
  label: string | LocalizedLabel
  value: string
  fontFamily?: string
  category?: 'sans-serif' | 'serif' | 'monospace' | 'display'
}

const NON_GOOGLE_VALUES = ['preset', 'custom', 'system-ui']

function previewFamily(option: FontOption): string {
  if (option.fontFamily) return option.fontFamily
  if (option.category === 'sans-serif') return 'system-ui, sans-serif'
  if (option.category === 'serif') return 'Georgia, serif'
  if (option.category === 'monospace') return 'monospace'
  return 'inherit'
}

/**
 * Font select with live font previews. Implements the WAI-ARIA "select-only
 * combobox" pattern: a button trigger plus a listbox navigated with the arrow
 * keys, Home/End, Enter/Space and Escape. Preview fonts load for whichever option
 * is active, so keyboard users get the same previews as mouse users.
 */
const FontSelectField: SelectFieldClientComponent = ({ field, path }) => {
  const { value, setValue } = useField<string>({ path })
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const lang = useThemeLanguage()
  const t = useThemeTranslations()
  const baseId = useId()
  const labelId = `${baseId}-label`
  const listboxId = `${baseId}-listbox`
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const listboxRef = useRef<HTMLDivElement>(null)
  const loadedFonts = useRef<Set<string>>(new Set())

  const options = (field.options as FontOption[]) || []
  const selectedIndex = options.findIndex((opt) => opt.value === value)
  const selectedOption = selectedIndex >= 0 ? options[selectedIndex] : undefined

  const getOptionLabel = (opt: FontOption) => resolveLocalizedText(opt.label, lang, 'Font')
  const label = resolveLocalizedText(field.label, lang, 'Font')
  const optionId = (index: number) => `${baseId}-option-${index}`

  const ensureFontLoaded = useCallback((fontValue: string | undefined) => {
    if (!fontValue || NON_GOOGLE_VALUES.includes(fontValue)) return
    if (loadedFonts.current.has(fontValue) || typeof document === 'undefined') return
    loadedFonts.current.add(fontValue)

    const linkId = `font-${fontValue.replace(/\s+/g, '-')}`
    if (document.getElementById(linkId)) return

    const link = document.createElement('link')
    link.id = linkId
    link.rel = 'stylesheet'
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontValue)}:wght@400;700&display=swap`
    document.head.appendChild(link)
  }, [])

  const open = useCallback(
    (index = selectedIndex >= 0 ? selectedIndex : 0) => {
      setActiveIndex(index)
      setIsOpen(true)
    },
    [selectedIndex],
  )

  const close = useCallback((restoreFocus: boolean) => {
    setIsOpen(false)
    if (restoreFocus) triggerRef.current?.focus()
  }, [])

  const handleSelect = (index: number) => {
    const option = options[index]
    if (!option) return
    setValue(option.value)
    close(true)
  }

  // Load the preview font for the active option and keep it scrolled into view.
  useEffect(() => {
    if (!isOpen || activeIndex < 0) return
    ensureFontLoaded(options[activeIndex]?.value)
    listboxRef.current
      ?.querySelector<HTMLElement>(`#${CSS.escape(optionId(activeIndex))}`)
      ?.scrollIntoView({ block: 'nearest' })
  }, [isOpen, activeIndex])

  // Focus the listbox when it opens so keyboard navigation works immediately.
  useEffect(() => {
    if (isOpen) listboxRef.current?.focus()
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const handlePointerOutside = (e: PointerEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) close(false)
    }
    document.addEventListener('pointerdown', handlePointerOutside)
    return () => document.removeEventListener('pointerdown', handlePointerOutside)
  }, [isOpen, close])

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
      event.preventDefault()
      open(event.key === 'ArrowUp' && selectedIndex < 0 ? options.length - 1 : undefined)
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
        handleSelect(activeIndex)
        break
      case 'Escape':
        event.preventDefault()
        event.stopPropagation()
        close(true)
        break
      case 'Tab':
        close(false)
        break
      default:
        // Type-ahead: jump to the first option starting with the typed letter.
        if (event.key.length === 1 && /\S/.test(event.key)) {
          const letter = event.key.toLowerCase()
          const start = activeIndex + 1
          const ordered = [...options.slice(start), ...options.slice(0, start)]
          const match = ordered.find((opt) => getOptionLabel(opt).toLowerCase().startsWith(letter))
          if (match) setActiveIndex(options.indexOf(match))
        }
    }
  }

  return (
    <div
      ref={containerRef}
      className="font-select-container"
      style={{ position: 'relative', marginBottom: '12px', maxWidth: '360px' }}
    >
      <div
        id={labelId}
        style={{
          display: 'block',
          marginBottom: '6px',
          fontSize: '13px',
          fontWeight: 600,
          color: 'var(--theme-elevation-800)',
        }}
      >
        {label}
      </div>

      <button
        ref={triggerRef}
        type="button"
        className="font-select-trigger"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={isOpen ? listboxId : undefined}
        aria-labelledby={`${labelId} ${baseId}-value`}
        onClick={() => (isOpen ? close(false) : open())}
        onKeyDown={handleTriggerKeyDown}
        style={{
          width: '100%',
          padding: '10px 14px',
          borderRadius: '6px',
          border: '1px solid var(--theme-elevation-200)',
          backgroundColor: 'var(--theme-input-bg)',
          color: 'var(--theme-elevation-800)',
          textAlign: 'left',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '8px',
          fontSize: '14px',
          fontFamily: selectedOption?.fontFamily || 'inherit',
        }}
      >
        <span id={`${baseId}-value`} style={{ flex: 1, minWidth: 0 }}>
          {selectedOption ? getOptionLabel(selectedOption) : t.ui.selectFontPlaceholder}
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
          aria-labelledby={labelId}
          aria-activedescendant={activeIndex >= 0 ? optionId(activeIndex) : undefined}
          onKeyDown={handleListboxKeyDown}
          className="font-select-listbox"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '4px',
            maxHeight: '280px',
            overflowY: 'auto',
            backgroundColor: 'var(--theme-elevation-0)',
            border: '1px solid var(--theme-elevation-200)',
            borderRadius: '8px',
            boxShadow: '0 8px 24px rgba(15, 23, 42, 0.15)',
            zIndex: 1000,
          }}
        >
          {options.map((option, index) => {
            const isSelected = option.value === value
            const isActive = index === activeIndex

            return (
              <div
                key={option.value}
                id={optionId(index)}
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(index)}
                onPointerMove={() => setActiveIndex(index)}
                style={{
                  padding: '12px 14px',
                  backgroundColor: isActive
                    ? 'var(--theme-elevation-100)'
                    : isSelected
                      ? 'var(--theme-elevation-50)'
                      : 'transparent',
                  // The active option gets an outline so keyboard focus never relies on a subtle fill alone.
                  outline: isActive ? '2px solid var(--theme-elevation-800)' : undefined,
                  outlineOffset: '-2px',
                  color: 'var(--theme-elevation-800)',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontFamily: previewFamily(option),
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}
              >
                <span
                  style={{
                    fontWeight: isSelected ? 600 : 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  {isSelected && <Check size={14} color="var(--theme-elevation-600)" aria-hidden />}
                  {getOptionLabel(option)}
                </span>
                <span
                  aria-hidden
                  style={{
                    fontSize: '16px',
                    color: 'var(--theme-elevation-600)',
                    fontStyle:
                      option.value === 'preset' || option.value === 'custom' ? 'italic' : 'normal',
                    fontFamily: option.fontFamily || undefined,
                  }}
                >
                  {option.value === 'preset'
                    ? t.ui.usePreset
                    : option.value === 'custom'
                      ? t.ui.specifyCustom
                      : t.ui.sampleSentence}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default FontSelectField
