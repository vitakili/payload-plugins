'use client'

import { useForm, useFormFields } from '@payloadcms/ui'
import { AlertTriangle, Check, ShieldCheck, Wand2 } from 'lucide-react'
import { useMemo } from 'react'
import { auditThemePalette, type AuditColors, type ContrastPairResult } from '../utils/contrast.js'
import { getAdminLanguage } from '../utils/getAdminLanguage.js'

/**
 * Live WCAG accessibility audit for the configured colour palette. Mounted as a
 * `ui` field inside the Appearance Settings tab; it checks the key
 * foreground/background pairs in both light and dark modes and offers a one-click
 * fix (nearest accessible colour) for any pair that fails AA (4.5:1).
 */

type Mode = 'lightMode' | 'darkMode'

const LEVEL_TONE: Record<string, { bg: string; fg: string }> = {
  AAA: { bg: '#dcfce7', fg: '#166534' },
  AA: { bg: '#dcfce7', fg: '#166534' },
  'AA Large': { bg: '#fef9c3', fg: '#854d0e' },
  fail: { bg: '#fee2e2', fg: '#991b1b' },
}

export default function AccessibilityAuditField() {
  const formFields = useFormFields(([state]) => state) as Record<
    string,
    { value?: unknown } | undefined
  >
  const { dispatchFields } = useForm()
  const lang = getAdminLanguage() as 'en' | 'cs'

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

  const t = {
    title: lang === 'cs' ? 'Přístupnost (WCAG kontrast)' : 'Accessibility (WCAG contrast)',
    subtitle:
      lang === 'cs'
        ? 'Kontrola čitelnosti barevných párů v obou režimech. AA = 4.5:1.'
        : 'Readability check of colour pairs in both modes. AA = 4.5:1.',
    light: lang === 'cs' ? 'Světlý režim' : 'Light mode',
    dark: lang === 'cs' ? 'Tmavý režim' : 'Dark mode',
    pass: lang === 'cs' ? 'v pořádku' : 'pass',
    fail: lang === 'cs' ? 'nevyhovuje' : 'fail',
    fix: lang === 'cs' ? 'Opravit' : 'Fix',
    allGood: lang === 'cs' ? 'Vše vyhovuje AA 👍' : 'All pairs pass AA 👍',
    noData: lang === 'cs' ? 'Žádné barvy k vyhodnocení.' : 'No colours to evaluate.',
  }

  const applyFix = (mode: Mode, result: ContrastPairResult) => {
    if (!result.suggestion) return
    dispatchFields({
      type: 'UPDATE',
      path: `themeConfiguration.${mode}.${result.foregroundKey}`,
      value: result.suggestion,
    })
  }

  const renderSection = (title: string, mode: Mode, audit: ContrastPairResult[]) => {
    const failing = audit.filter((r) => !r.passes).length
    return (
      <div style={{ flex: '1 1 260px', minWidth: '260px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--theme-elevation-700)',
            marginBottom: '8px',
          }}
        >
          {failing === 0 ? (
            <ShieldCheck size={14} color="#166534" aria-hidden />
          ) : (
            <AlertTriangle size={14} color="#991b1b" aria-hidden />
          )}
          {title}
          <span style={{ fontWeight: 500, color: 'var(--theme-elevation-500)' }}>
            ({audit.length - failing}/{audit.length})
          </span>
        </div>

        {audit.length === 0 ? (
          <div style={{ fontSize: '11px', color: 'var(--theme-elevation-400)' }}>{t.noData}</div>
        ) : failing === 0 ? (
          <div style={{ fontSize: '11px', color: '#166534' }}>{t.allGood}</div>
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
                  fontSize: '11px',
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
                <span style={{ flex: 1, color: 'var(--theme-elevation-700)' }}>{r.label}</span>
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
                  {r.passes ? <Check size={11} aria-hidden /> : null}
                  {r.level}
                </span>
                {!r.passes && r.suggestion ? (
                  <button
                    type="button"
                    onClick={() => applyFix(mode, r)}
                    title={`${t.fix} → ${r.suggestion}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '3px',
                      padding: '2px 7px',
                      borderRadius: '6px',
                      border: 'none',
                      cursor: 'pointer',
                      background: 'var(--theme-elevation-800)',
                      color: 'var(--theme-elevation-0)',
                      fontWeight: 600,
                    }}
                  >
                    <Wand2 size={11} aria-hidden />
                    {t.fix}
                  </button>
                ) : null}
              </div>
            )
          })}
        </div>
      </div>
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
      <div style={{ fontSize: '11px', color: 'var(--theme-elevation-500)', marginBottom: '12px' }}>
        {t.subtitle}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        {renderSection(t.light, 'lightMode', lightAudit)}
        {renderSection(t.dark, 'darkMode', darkAudit)}
      </div>
    </div>
  )
}
