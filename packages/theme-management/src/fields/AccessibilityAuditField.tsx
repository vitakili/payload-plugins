'use client'

import { useForm, useFormFields } from '@payloadcms/ui'
import { AlertTriangle, Check, ShieldCheck, Wand2 } from 'lucide-react'
import { useMemo } from 'react'
import { useThemeTranslations } from '../hooks/useThemeTranslations.js'
import { auditThemePalette, type AuditColors, type ContrastPairResult } from '../utils/contrast.js'

/**
 * Live WCAG accessibility audit for the configured colour palette. Mounted as a
 * `ui` field inside the Appearance Settings tab; it checks the key
 * foreground/background pairs in both light and dark modes and offers a one-click
 * fix (nearest accessible colour) for any pair that fails AA (4.5:1).
 */

type Mode = 'lightMode' | 'darkMode'

// Payload's semantic status tokens flip with the admin theme, unlike fixed hex pastels.
const STATUS = {
  success: { bg: 'var(--theme-success-100)', fg: 'var(--theme-success-800)' },
  warning: { bg: 'var(--theme-warning-100)', fg: 'var(--theme-warning-800)' },
  error: { bg: 'var(--theme-error-100)', fg: 'var(--theme-error-800)' },
}

const LEVEL_TONE: Record<string, { bg: string; fg: string }> = {
  AAA: STATUS.success,
  AA: STATUS.success,
  'AA Large': STATUS.warning,
  fail: STATUS.error,
}

export default function AccessibilityAuditField() {
  const formFields = useFormFields(([state]) => state) as Record<
    string,
    { value?: unknown } | undefined
  >
  const { dispatchFields, setModified } = useForm()
  const tr = useThemeTranslations()
  const t = tr.accessibility

  const levelLabel = (level: string): string => {
    if (level === 'AA Large') return tr.colorPicker.levelAALarge
    if (level === 'fail') return tr.colorPicker.levelLow
    return level
  }

  const readMode = (mode: Mode): AuditColors => {
    const colors: AuditColors = {}
    for (const key of [
      'background',
      'foreground',
      'card',
      'cardForeground',
      'primary',
      'primaryForeground',
      'secondary',
      'secondaryForeground',
      'muted',
      'mutedForeground',
      'accent',
      'accentForeground',
      'destructive',
      'destructiveForeground',
    ]) {
      const v = formFields?.[`themeConfiguration.${mode}.${key}`]?.value
      if (typeof v === 'string') colors[key] = v
    }
    return colors
  }

  const lightColors = readMode('lightMode')
  const darkColors = readMode('darkMode')

  const lightAudit = useMemo(() => auditThemePalette(lightColors), [JSON.stringify(lightColors)])
  const darkAudit = useMemo(() => auditThemePalette(darkColors), [JSON.stringify(darkColors)])

  // Map each audited pair (by its foreground token) to a localized label.
  const pairLabel = (result: ContrastPairResult): string => {
    const map: Record<string, keyof typeof t.pairs> = {
      foreground: 'bodyText',
      mutedForeground: 'mutedText',
      primaryForeground: 'primaryButton',
      secondaryForeground: 'secondaryButton',
      accentForeground: 'accent',
      cardForeground: 'cardText',
      destructiveForeground: 'destructive',
    }
    const key = map[result.foregroundKey]
    return key ? t.pairs[key] : result.label
  }

  const applyFix = (mode: Mode, result: ContrastPairResult) => {
    if (!result.suggestion) return
    dispatchFields({
      type: 'UPDATE',
      path: `themeConfiguration.${mode}.${result.foregroundKey}`,
      value: result.suggestion,
    })
    // Mark the form dirty so Save stays enabled after an auto-fix.
    setModified(true)
  }

  const renderSection = (title: string, mode: Mode, audit: ContrastPairResult[]) => {
    const failing = audit.filter((r) => !r.passes).length
    return (
      <section aria-label={title} style={{ flex: '1 1 260px', minWidth: 0 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--theme-elevation-800)',
            marginBottom: '8px',
          }}
        >
          {failing === 0 ? (
            <ShieldCheck size={14} color={STATUS.success.fg} aria-hidden />
          ) : (
            <AlertTriangle size={14} color={STATUS.error.fg} aria-hidden />
          )}
          {title}
          <span style={{ fontWeight: 500, color: 'var(--theme-elevation-600)' }}>
            ({audit.length - failing}/{audit.length})
          </span>
        </div>

        {audit.length === 0 ? (
          <div style={{ fontSize: '12px', color: 'var(--theme-elevation-600)' }}>{t.noData}</div>
        ) : failing === 0 ? (
          <div style={{ fontSize: '12px', color: STATUS.success.fg }}>{t.allGood}</div>
        ) : null}

        <div style={{ display: 'grid', gap: '6px' }}>
          {audit.map((r) => {
            const tone = LEVEL_TONE[r.level] ?? LEVEL_TONE.fail
            return (
              <div
                key={`${r.foregroundKey}-${r.backgroundKey}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '12px',
                  padding: '4px 6px',
                  borderRadius: '8px',
                  border: '1px solid var(--theme-elevation-150)',
                  background: 'var(--theme-elevation-50)',
                }}
              >
                {/* Sample */}
                <span
                  aria-hidden
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '34px',
                    height: '22px',
                    borderRadius: '5px',
                    background: r.background,
                    color: r.foreground,
                    fontWeight: 700,
                    border: '1px solid rgba(0,0,0,0.08)',
                    flexShrink: 0,
                  }}
                >
                  Aa
                </span>
                <span style={{ flex: 1, color: 'var(--theme-elevation-700)' }}>{pairLabel(r)}</span>
                <span style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--theme-elevation-600)' }}>
                  {r.ratio}:1
                </span>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px',
                    padding: '1px 6px',
                    borderRadius: '999px',
                    background: tone.bg,
                    color: tone.fg,
                    fontWeight: 600,
                  }}
                >
                  {r.passes ? <Check size={12} aria-hidden /> : null}
                  {levelLabel(r.level)}
                </span>
                {!r.passes && r.suggestion ? (
                  <button
                    type="button"
                    onClick={() => applyFix(mode, r)}
                    title={`${t.fix} → ${r.suggestion}`}
                    aria-label={`${t.fix}: ${pairLabel(r)} (${title}) → ${r.suggestion}`}
                    className="theme-audit__fix"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      minHeight: '26px',
                      padding: '2px 9px',
                      borderRadius: '6px',
                      border: 'none',
                      cursor: 'pointer',
                      background: 'var(--theme-elevation-800)',
                      color: 'var(--theme-elevation-0)',
                      fontWeight: 600,
                    }}
                  >
                    <Wand2 size={12} aria-hidden />
                    {t.fix}
                  </button>
                ) : null}
              </div>
            )
          })}
        </div>
      </section>
    )
  }

  return (
    <div style={{ marginBottom: '20px' }}>
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '13px',
          fontWeight: 600,
          color: 'var(--theme-elevation-800)',
        }}
      >
        <ShieldCheck size={14} aria-hidden />
        {t.title}
      </div>
      <div style={{ fontSize: '12px', color: 'var(--theme-elevation-600)', marginBottom: '12px' }}>
        {t.subtitle}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        {renderSection(tr.ui.lightMode, 'lightMode', lightAudit)}
        {renderSection(tr.ui.darkMode, 'darkMode', darkAudit)}
      </div>
    </div>
  )
}
