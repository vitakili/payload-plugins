'use client'

import { useField } from '@payloadcms/ui'
import type { SelectFieldClientComponent } from 'payload'
import { useEffect, useState } from 'react'

interface FontOption {
  label: string
  value: string
  fontFamily?: string
  category?: 'sans-serif' | 'serif' | 'monospace' | 'display'
}

const FontSelectField: SelectFieldClientComponent = ({ field, path }) => {
  const { value, setValue } = useField<string>({ path })
  const [isOpen, setIsOpen] = useState(false)

  const options = (field.options as FontOption[]) || []
  const selectedOption = options.find((opt) => opt.value === value)

  const handleSelect = (optionValue: string) => {
    setValue(optionValue)
    setIsOpen(false)
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('.font-select-container')) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const label =
    typeof field.label === 'string' ? field.label : field.label?.en || field.label?.cs || 'Font'

  return (
    <div className="font-select-container" style={{ position: 'relative', marginBottom: '12px' }}>
      <label
        style={{
          display: 'block',
          marginBottom: '6px',
          fontSize: '13px',
          fontWeight: 600,
          color: 'var(--theme-elevation-800)',
        }}
      >
        {label}
      </label>

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
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
          fontSize: '14px',
          fontFamily: selectedOption?.fontFamily || 'inherit',
          transition: 'border-color 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--theme-elevation-400)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--theme-elevation-200)'
        }}
      >
        <span style={{ flex: 1 }}>{selectedOption?.label || 'Select font...'}</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          style={{
            transition: 'transform 0.2s ease',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        >
          <path
            d="M3 4.5L6 7.5L9 4.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen && (
        <div
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
          {options.map((option) => {
            const isSelected = option.value === value

            let fontFamily = option.fontFamily
            if (!fontFamily) {
              if (option.category === 'sans-serif') fontFamily = 'system-ui, sans-serif'
              else if (option.category === 'serif') fontFamily = 'Georgia, serif'
              else if (option.category === 'monospace') fontFamily = 'monospace'
              else fontFamily = 'inherit'
            }

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  border: 'none',
                  backgroundColor: isSelected ? 'var(--theme-elevation-100)' : 'transparent',
                  color: 'var(--theme-elevation-800)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontFamily,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  transition: 'background-color 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = 'var(--theme-elevation-50)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }
                }}
              >
                <div
                  style={{
                    fontWeight: isSelected ? 600 : 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  {isSelected && (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path
                        d="M11.6667 3.5L5.25 9.91667L2.33334 7"
                        stroke="var(--theme-elevation-500)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                  {option.label}
                </div>
                <div
                  style={{
                    fontSize: '16px',
                    color: 'var(--theme-elevation-600)',
                    fontStyle:
                      option.value === 'preset' || option.value === 'custom' ? 'italic' : 'normal',
                  }}
                >
                  {(() => {
                    if (option.value === 'preset') return 'Use theme preset font'
                    if (option.value === 'custom') return 'Specify custom font below'
                    return 'The quick brown fox jumps over the lazy dog'
                  })()}
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default FontSelectField
