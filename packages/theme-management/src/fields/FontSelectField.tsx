'use client'

import './FontSelectField.css'
import { useField } from '@payloadcms/ui'
import { mergeFieldStyles } from '@payloadcms/ui/shared'
import { Check, ChevronDown } from 'lucide-react'
import type { SelectFieldClientComponent } from 'payload'
import React, { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import {
  FONT_CATEGORY_LABELS,
  getFontCatalogEntry,
  type FontCategory,
} from '../constants/themeFonts.js'
import { useThemeFonts } from '../hooks/useThemeFonts.js'
import { useThemeLanguage, useThemeTranslations } from '../hooks/useThemeTranslations.js'
import { resolveLocalizedText } from '../utils/localizedText.js'

type LocalizedLabel = Record<string, string>

interface FontOption {
  label: string | LocalizedLabel
  value: string
  fontFamily?: string
  category?: FontCategory
}

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
 * keys, Home/End, Enter/Space and Escape. Options are grouped by font category.
 * Preview fonts come from the plugin's self-hosted font endpoint: the selected
 * face always, every face while the list is open.
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

  // Payload strips custom option props on the way to the client, so the face and
  // category come from the font catalog by value.
  const options = ((field.options as FontOption[]) || []).map((option) => {
    const entry = getFontCatalogEntry(option.value)
    return entry ? { ...option, fontFamily: entry.fontFamily, category: entry.category } : option
  })
  const [alignEnd, setAlignEnd] = useState(false)
  const selectedIndex = options.findIndex((opt) => opt.value === value)
  const selectedOption = selectedIndex >= 0 ? options[selectedIndex] : undefined

  const getOptionLabel = (opt: FontOption) => resolveLocalizedText(opt.label, lang, 'Font')
  const label = resolveLocalizedText(field.label, lang, 'Font')
  const optionId = (index: number) => `${baseId}-option-${index}`

  useThemeFonts(isOpen ? options.map((option) => option.value) : [value])

  const open = useCallback(
    (index = selectedIndex >= 0 ? selectedIndex : 0) => {
      // Open towards the side with room, so the list never spills past the form column.
      const trigger = triggerRef.current?.getBoundingClientRect()
      const column = containerRef.current
        ?.closest('.render-fields, .group-field__wrap')
        ?.getBoundingClientRect()
      setAlignEnd(Boolean(trigger && column && trigger.left + 300 > column.right))
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

  // Keep the active option scrolled into view.
  useEffect(() => {
    if (!isOpen || activeIndex < 0) return
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

  const isSpecial = (option: FontOption) => option.value === 'preset' || option.value === 'custom'

  return (
    <div
      ref={containerRef}
      // Payload rows size each field through --field-width on the field root.
      className="field-type tm-font-select"
      style={mergeFieldStyles(field) as React.CSSProperties}
    >
      <div id={labelId} className="field-label tm-font-select__label">
        {label}
      </div>

      <button
        ref={triggerRef}
        type="button"
        className="tm-font-select__trigger"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={isOpen ? listboxId : undefined}
        aria-labelledby={`${labelId} ${baseId}-value`}
        onClick={() => (isOpen ? close(false) : open())}
        onKeyDown={handleTriggerKeyDown}
      >
        <span
          id={`${baseId}-value`}
          className="tm-font-select__value"
          style={{
            fontFamily:
              selectedOption && !isSpecial(selectedOption) ? previewFamily(selectedOption) : undefined,
          }}
        >
          {selectedOption ? getOptionLabel(selectedOption) : t.ui.selectFontPlaceholder}
        </span>
        <ChevronDown
          size={16}
          aria-hidden
          className={`tm-font-select__chevron${isOpen ? ' is-open' : ''}`}
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
          className={`tm-font-select__listbox${alignEnd ? ' is-align-end' : ''}`}
        >
          {options.map((option, index) => {
            const isSelected = option.value === value
            const isActive = index === activeIndex
            const startsGroup =
              option.category !== undefined && option.category !== options[index - 1]?.category
            const special = isSpecial(option)
            const family = special ? undefined : previewFamily(option)

            return (
              <React.Fragment key={option.value}>
                {startsGroup && option.category ? (
                  <div role="presentation" className="tm-font-select__group">
                    {resolveLocalizedText(FONT_CATEGORY_LABELS[option.category], lang, '')}
                  </div>
                ) : null}
                <div
                  id={optionId(index)}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(index)}
                  onPointerMove={() => setActiveIndex(index)}
                  className={`tm-font-select__option${isActive ? ' is-active' : ''}${
                    isSelected ? ' is-selected' : ''
                  }`}
                >
                  <span className="tm-font-select__check" aria-hidden>
                    {isSelected ? <Check size={14} /> : null}
                  </span>
                  <span className="tm-font-select__text">
                    <span className="tm-font-select__name" style={{ fontFamily: family }}>
                      {getOptionLabel(option)}
                    </span>
                    <span
                      aria-hidden
                      className={`tm-font-select__sample${special ? ' is-hint' : ''}`}
                      style={{ fontFamily: family }}
                    >
                      {option.value === 'preset'
                        ? t.ui.usePreset
                        : option.value === 'custom'
                          ? t.ui.specifyCustom
                          : t.ui.sampleSentence}
                    </span>
                  </span>
                </div>
              </React.Fragment>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default FontSelectField
