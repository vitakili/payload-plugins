'use client'

import { useFormFields } from '@payloadcms/ui'
import { Braces, Copy, Download, FileCode } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useThemeLanguage } from '../hooks/useThemeTranslations.js'
import {
  generateDesignTokensJson,
  generateTailwindV3Theme,
  generateTailwindV4Theme,
} from '../utils/exportTokens.js'

const COLOR_KEYS = [
  'background',
  'foreground',
  'card',
  'cardForeground',
  'popover',
  'popoverForeground',
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
  'border',
  'input',
  'ring',
]

/**
 * Admin tool to export the current theme as portable design tokens (W3C JSON) or
 * Tailwind theme config (v4 `@theme inline` / v3 `theme.extend`).
 */
export default function ThemeExportField() {
  const formFields = useFormFields(([state]) => state) as Record<
    string,
    { value?: unknown } | undefined
  >
  const lang = useThemeLanguage() as 'en' | 'cs'
  const [copied, setCopied] = useState(false)

  const buildConfig = useCallback(() => {
    const read = (path: string) => {
      const v = formFields?.[`themeConfiguration.${path}`]?.value
      return typeof v === 'string' ? v : undefined
    }
    const mode = (modeName: 'lightMode' | 'darkMode') => {
      const colors: Record<string, string> = {}
      for (const key of COLOR_KEYS) {
        const value = read(`${modeName}.${key}`)
        if (value) colors[key] = value
      }
      return colors
    }
    return {
      theme: read('theme'),
      borderRadius: read('borderRadius'),
      lightMode: mode('lightMode'),
      darkMode: mode('darkMode'),
    }
  }, [formFields])

  const download = useCallback((filename: string, content: string, type: string) => {
    if (typeof document === 'undefined') return
    const blob = new Blob([content], { type })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }, [])

  const t = {
    title: lang === 'cs' ? 'Export tématu' : 'Export theme',
    subtitle:
      lang === 'cs'
        ? 'Stáhni barvy jako design tokeny nebo Tailwind konfiguraci.'
        : 'Download colours as design tokens or Tailwind config.',
    tokens: lang === 'cs' ? 'Design tokeny (JSON)' : 'Design tokens (JSON)',
    tw4: 'Tailwind v4 (@theme)',
    tw3: 'Tailwind v3 config',
    copy: copied ? (lang === 'cs' ? 'Zkopírováno!' : 'Copied!') : lang === 'cs' ? 'Kopírovat v4' : 'Copy v4',
  }

  const onCopyV4 = useCallback(async () => {
    const css = generateTailwindV4Theme(buildConfig())
    try {
      await navigator.clipboard.writeText(css)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* clipboard may be unavailable */
    }
  }, [buildConfig])

  const btnStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid var(--theme-elevation-200)',
    cursor: 'pointer',
    background: 'var(--theme-elevation-50)',
    color: 'var(--theme-elevation-700)',
    fontWeight: 600,
    fontSize: '12px',
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
        <FileCode size={14} aria-hidden />
        {t.title}
      </div>
      <div style={{ fontSize: '11px', color: 'var(--theme-elevation-500)', marginBottom: '12px' }}>
        {t.subtitle}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        <button
          type="button"
          style={btnStyle}
          onClick={() =>
            download('theme.tokens.json', generateDesignTokensJson(buildConfig()), 'application/json')
          }
        >
          <Braces size={14} aria-hidden />
          {t.tokens}
        </button>
        <button
          type="button"
          style={btnStyle}
          onClick={() =>
            download('theme.tailwind.css', generateTailwindV4Theme(buildConfig()), 'text/css')
          }
        >
          <Download size={14} aria-hidden />
          {t.tw4}
        </button>
        <button type="button" style={btnStyle} onClick={onCopyV4}>
          <Copy size={14} aria-hidden />
          {t.copy}
        </button>
        <button
          type="button"
          style={btnStyle}
          onClick={() =>
            download(
              'tailwind.config.js',
              generateTailwindV3Theme(buildConfig()),
              'text/javascript',
            )
          }
        >
          <Download size={14} aria-hidden />
          {t.tw3}
        </button>
      </div>
    </div>
  )
}
