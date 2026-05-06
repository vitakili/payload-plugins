'use client'

import { useField, useForm } from '@payloadcms/ui'
import type { TextFieldClientProps } from 'payload'
import { useCallback, useMemo } from 'react'
import { allStylePresets, stylePresetCategories } from '../style-presets.js'
import type { StylePreset } from '../style-presets.js'
import { getAdminLanguage } from '../utils/getAdminLanguage.js'

const VF_KEYS = [
  'effectStyle',
  'shadowIntensity',
  'backdropBlur',
  'borderStyle',
  'borderWidth',
  'glassOpacity',
] as const

const CS_KEYS = ['buttonVariant', 'cardStyle', 'cardHoverEffect', 'navbarStyle'] as const

// Visual preview config for each effect style
const EFFECT_PREVIEW: Record<
  string,
  { containerBg: string; bg: string; border: string; shadow: string; radius: string; label: string }
> = {
  glass: {
    containerBg: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #db2777 100%)',
    bg: 'rgba(255,255,255,0.22)',
    border: '1px solid rgba(255,255,255,0.5)',
    shadow: '0 4px 14px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.3)',
    radius: '10px',
    label: 'glass',
  },
  neumorphic: {
    containerBg: '#dde1e7',
    bg: '#dde1e7',
    border: 'none',
    shadow: '5px 5px 10px rgba(0,0,0,0.18), -4px -4px 9px rgba(255,255,255,0.88)',
    radius: '10px',
    label: 'soft',
  },
  clay: {
    containerBg: 'linear-gradient(135deg, #bfdbfe 0%, #bbf7d0 100%)',
    bg: 'linear-gradient(135deg, #818cf8 0%, #22d3ee 100%)',
    border: 'none',
    shadow: '4px 4px 0 rgba(0,0,0,0.28), 0 6px 16px rgba(0,0,0,0.12)',
    radius: '16px',
    label: 'clay',
  },
  elevated: {
    containerBg: '#f1f5f9',
    bg: '#ffffff',
    border: '1px solid #e2e8f0',
    shadow: '0 6px 18px rgba(0,0,0,0.12)',
    radius: '8px',
    label: 'lift',
  },
  flat: {
    containerBg: '#f8fafc',
    bg: '#f1f5f9',
    border: '1px solid #94a3b8',
    shadow: 'none',
    radius: '3px',
    label: 'flat',
  },
}

// Map preset → preview style
function getPreviewStyle(preset: StylePreset): React.CSSProperties {
  const effect = preset.visualEffects?.effectStyle ?? 'elevated'
  const config = EFFECT_PREVIEW[effect] ?? EFFECT_PREVIEW.elevated!

  // brutalism: hard offset border
  if (preset.componentStyles?.cardStyle === 'bordered') {
    return {
      background: '#fff',
      border: `${preset.visualEffects?.borderWidth ?? '2px'} solid #0f172a`,
      boxShadow: `3px 3px 0 #0f172a`,
      borderRadius: 0,
    }
  }
  // gradient-border preset
  if (preset.componentStyles?.cardStyle === 'gradient-border') {
    return {
      background: 'linear-gradient(135deg, #f0abfc, #818cf8, #38bdf8)',
      border: 'none',
      boxShadow: '0 0 14px rgba(129,140,248,0.45)',
      borderRadius: '8px',
    }
  }
  return {
    background: config.bg,
    border: config.border,
    boxShadow: config.shadow,
    borderRadius:
      preset.borderRadius === 'none' ? 0 : preset.borderRadius === 'xl' ? '18px' : config.radius,
  }
}

// Container background for the swatch area — matches the effect's visual context
function getContainerBg(preset: StylePreset): string {
  if (preset.componentStyles?.cardStyle === 'bordered') return '#f8fafc'
  if (preset.componentStyles?.cardStyle === 'gradient-border') {
    return 'linear-gradient(135deg, #f0abfc 0%, #818cf8 50%, #38bdf8 100%)'
  }
  const effect = preset.visualEffects?.effectStyle ?? 'elevated'
  return EFFECT_PREVIEW[effect]?.containerBg ?? '#f1f5f9'
}

// Category accent colors
const CATEGORY_ACCENT: Record<string, string> = {
  classic: '#64748b',
  effect: '#6366f1',
}

export default function StylePresetField(props: TextFieldClientProps) {
  const { path } = props
  const { value: selectedPreset, setValue } = useField<string>({ path })
  const { dispatchFields } = useForm()
  const lang = getAdminLanguage() as 'en' | 'cs'

  const applyStylePreset = useCallback(
    (preset: StylePreset) => {
      const basePath = path.substring(0, path.lastIndexOf('.'))

      if (preset.borderRadius !== undefined)
        dispatchFields({
          type: 'UPDATE',
          path: `${basePath}.borderRadius`,
          value: preset.borderRadius,
        })

      if (preset.animationLevel !== undefined)
        dispatchFields({
          type: 'UPDATE',
          path: `${basePath}.animationLevel`,
          value: preset.animationLevel,
        })

      if (preset.visualEffects) {
        VF_KEYS.forEach((key) => {
          const value = preset.visualEffects?.[key]
          if (value !== undefined)
            dispatchFields({ type: 'UPDATE', path: `${basePath}.visualEffects.${key}`, value })
        })
      }

      if (preset.componentStyles) {
        CS_KEYS.forEach((key) => {
          const value = preset.componentStyles?.[key]
          if (value !== undefined)
            dispatchFields({ type: 'UPDATE', path: `${basePath}.componentStyles.${key}`, value })
        })
      }
    },
    [dispatchFields, path],
  )

  const handleSelect = useCallback(
    (preset: StylePreset) => {
      setValue(preset.name)
      applyStylePreset(preset)
    },
    [setValue, applyStylePreset],
  )

  const groupedPresets = useMemo(
    () =>
      stylePresetCategories.map((cat) => ({
        ...cat,
        presets: allStylePresets.filter((p) => p.category === cat.name),
      })),
    [],
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      {/* Header */}
      <p
        style={{
          margin: '0 0 16px',
          fontSize: '12px',
          color: 'var(--theme-elevation-500, #64748b)',
          lineHeight: 1.6,
        }}
      >
        {lang === 'cs'
          ? 'Vyberte vizuální styl. Nastaví efekty, stíny a styly komponent — barvy zůstanou nezměněny.'
          : 'Pick a visual style — sets effects, shadows and component styles. Colours stay unchanged.'}
      </p>

      {groupedPresets.map((category) => {
        const accent = CATEGORY_ACCENT[category.name] ?? '#64748b'
        const catLabel = typeof category.label === 'object' ? category.label[lang] : category.label
        return (
          <div key={category.name} style={{ marginBottom: '20px' }}>
            {/* Category header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '10px',
              }}
            >
              <div
                style={{
                  width: '3px',
                  height: '16px',
                  borderRadius: '2px',
                  background: accent,
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: accent,
                }}
              >
                {catLabel}
              </span>
            </div>

            {/* Preset grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: '8px',
              }}
            >
              {category.presets.map((preset) => {
                const isSelected = selectedPreset === preset.name
                const labelText =
                  typeof preset.label === 'object' ? preset.label[lang] : preset.label
                const descText =
                  typeof preset.description === 'object'
                    ? preset.description[lang]
                    : preset.description
                const previewStyle = getPreviewStyle(preset)
                const containerBg = getContainerBg(preset)

                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handleSelect(preset)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0',
                      padding: '0',
                      borderRadius: '10px',
                      border: isSelected ? `2px solid ${accent}` : '2px solid transparent',
                      outline: isSelected ? `3px solid ${accent}22` : 'none',
                      outlineOffset: '2px',
                      background: 'var(--theme-elevation-50, #f8fafc)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      overflow: 'hidden',
                      transition:
                        'border-color 140ms ease, outline 140ms ease, box-shadow 140ms ease',
                      boxShadow: isSelected
                        ? `0 0 0 1px ${accent}33, 0 4px 12px rgba(0,0,0,0.08)`
                        : '0 1px 3px rgba(0,0,0,0.06)',
                    }}
                  >
                    {/* Visual preview swatch */}
                    <div
                      style={{
                        height: '52px',
                        background: containerBg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '10px',
                        gap: '6px',
                        position: 'relative',
                      }}
                    >
                      {/* Mini card preview */}
                      <div
                        style={{
                          width: '52px',
                          height: '32px',
                          ...previewStyle,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {/* Tiny inner content lines */}
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '3px',
                            padding: '4px',
                          }}
                        >
                          <div
                            style={{
                              width: '30px',
                              height: '3px',
                              borderRadius: '2px',
                              background: 'rgba(0,0,0,0.18)',
                            }}
                          />
                          <div
                            style={{
                              width: '22px',
                              height: '2px',
                              borderRadius: '2px',
                              background: 'rgba(0,0,0,0.10)',
                            }}
                          />
                        </div>
                      </div>

                      {/* Mini button preview */}
                      <div
                        style={{
                          padding: '3px 8px',
                          borderRadius:
                            preset.borderRadius === 'none'
                              ? 0
                              : preset.componentStyles?.buttonVariant === 'pill'
                                ? '999px'
                                : '5px',
                          background:
                            preset.componentStyles?.buttonVariant === 'brutal'
                              ? 'transparent'
                              : accent,
                          border:
                            preset.componentStyles?.buttonVariant === 'brutal'
                              ? `2px solid #0f172a`
                              : 'none',
                          boxShadow:
                            preset.componentStyles?.buttonVariant === 'brutal'
                              ? '2px 2px 0 #0f172a'
                              : 'none',
                          fontSize: '8px',
                          fontWeight: 700,
                          color:
                            preset.componentStyles?.buttonVariant === 'brutal' ? '#0f172a' : '#fff',
                          letterSpacing: '0.03em',
                          flexShrink: 0,
                        }}
                      >
                        BTN
                      </div>

                      {/* Selected checkmark */}
                      {isSelected && (
                        <div
                          style={{
                            position: 'absolute',
                            top: '6px',
                            right: '6px',
                            width: '16px',
                            height: '16px',
                            borderRadius: '50%',
                            background: accent,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                            <path
                              d="M1.5 4.5L3.5 6.5L7.5 2.5"
                              stroke="white"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Text content */}
                    <div style={{ padding: '8px 10px 10px' }}>
                      <div
                        style={{
                          fontSize: '12px',
                          fontWeight: 600,
                          color: isSelected ? accent : 'var(--theme-elevation-800, #1e293b)',
                          marginBottom: '2px',
                          lineHeight: 1.3,
                        }}
                      >
                        {labelText}
                      </div>
                      {descText && (
                        <div
                          style={{
                            fontSize: '10px',
                            color: 'var(--theme-elevation-500, #64748b)',
                            lineHeight: 1.4,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical' as const,
                            overflow: 'hidden',
                          }}
                        >
                          {descText}
                        </div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}

      {/* Clear button */}
      {selectedPreset && (
        <button
          type="button"
          onClick={() => setValue('')}
          style={{
            alignSelf: 'flex-start',
            marginTop: '4px',
            padding: '5px 12px',
            fontSize: '11px',
            borderRadius: '6px',
            border: '1px solid var(--theme-elevation-200, #e2e8f0)',
            background: 'transparent',
            color: 'var(--theme-elevation-500, #64748b)',
            cursor: 'pointer',
            transition: 'background 120ms ease',
          }}
        >
          {lang === 'cs' ? '✕ Zrušit výběr' : '✕ Clear selection'}
        </button>
      )}
    </div>
  )
}
