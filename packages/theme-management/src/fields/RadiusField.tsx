'use client'

import { useField } from '@payloadcms/ui'
import type { SelectFieldClientProps } from 'payload'
import { useMemo } from 'react'
import { borderRadiusPresets } from '@/providers/Theme/themeConfig'

type RadiusPresetKey = Extract<keyof typeof borderRadiusPresets, string>

interface RadiusOptionCard {
  key: RadiusPresetKey
  label: string
  css: Record<string, string>
}

export default function RadiusField({ field, ...props }: SelectFieldClientProps) {
  const { value, setValue } = useField<string>({ path: props.path })
  const label = typeof field.label === 'string' ? field.label : ''

  const radiusOptions = useMemo<RadiusOptionCard[]>(() => {
    const entries = Object.entries(borderRadiusPresets) as Array<
      [RadiusPresetKey, (typeof borderRadiusPresets)[RadiusPresetKey]]
    >
    return entries.map(([key, preset]) => ({
      key,
      label: preset.label,
      css: preset.css,
    }))
  }, [])

  const fallbackKey: RadiusPresetKey = radiusOptions[2]?.key ?? radiusOptions[0]?.key ?? 'medium'
  const currentKey =
    typeof value === 'string' && value in borderRadiusPresets
      ? (value as RadiusPresetKey)
      : fallbackKey

  const description =
    typeof field.admin?.description === 'string'
      ? field.admin.description
      : field.admin?.description?.en || field.admin?.description?.cs || null

  return (
    <div className="field-type">
      <label className="field-label" htmlFor={props.path}>
        {label}
        {field.required && <span className="required">*</span>}
      </label>

      {description && (
        <p
          style={{
            marginTop: '4px',
            fontSize: '12px',
            lineHeight: 1.5,
            color: 'var(--theme-elevation-600)',
          }}
        >
          {description}
        </p>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '16px',
          marginTop: '16px',
        }}
      >
  {radiusOptions.map((option) => {
          const isSelected = option.key === currentKey
          const cardRadius =
            option.css['--radius-large'] ??
            option.css['--radius-default'] ??
            option.css['--radius-medium']
          const chipRadius = option.css['--radius-default'] ?? option.css['--radius-small']
          const pillRadius = option.css['--radius-xl'] ?? option.css['--radius-large'] ?? '999px'

          return (
            <button
              key={option.key}
              type="button"
              onClick={() => setValue(option.key)}
              aria-pressed={isSelected}
              style={{
                border: isSelected
                  ? '2px solid var(--theme-success-500)'
                  : '1px solid var(--theme-elevation-150)',
                borderRadius: '14px',
                backgroundColor: 'var(--theme-elevation-25)',
                padding: '16px',
                display: 'grid',
                gap: '10px',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease, transform 0.15s ease',
                boxShadow: isSelected
                  ? '0 10px 20px rgba(34, 197, 94, 0.18)'
                  : '0 6px 18px rgba(15, 23, 42, 0.08)',
                transform: isSelected ? 'translateY(-2px)' : 'translateY(0)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontWeight: 600,
                  fontSize: '13px',
                  color: 'var(--theme-elevation-800)',
                }}
              >
                <span>{option.label}</span>
                  <span style={{ fontSize: '11px', opacity: 0.7 }}>{option.key}</span>
              </div>

              <div
                style={{
                  display: 'grid',
                  gap: '10px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    gap: '8px',
                    alignItems: 'center',
                  }}
                >
                  <div
                    style={{
                      width: '50px',
                      height: '34px',
                      backgroundColor: 'var(--theme-elevation-100)',
                      border: '1px solid var(--theme-elevation-200)',
                      borderRadius: cardRadius ?? '0',
                    }}
                  />
                  <div
                    style={{
                      flex: 1,
                      height: '14px',
                      backgroundColor: 'var(--theme-primary-500)',
                      borderRadius: pillRadius,
                    }}
                  />
                </div>

                <div
                  style={{
                    display: 'flex',
                    gap: '6px',
                    flexWrap: 'wrap',
                    fontSize: '11px',
                    color: 'var(--theme-elevation-600)',
                  }}
                >
                  <span>Card {cardRadius ?? '—'}</span>
                  <span>Chip {chipRadius ?? '—'}</span>
                  <span>Pill {pillRadius}</span>
                </div>
              </div>
            </button>
          )
        })}
      </div>

  <input type="hidden" id={props.path} value={currentKey} readOnly />
    </div>
  )
}
