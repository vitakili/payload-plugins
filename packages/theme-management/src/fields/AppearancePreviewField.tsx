'use client'

import { useFormFields } from '@payloadcms/ui'
import { Monitor, Moon, Smartphone, Sparkles, Sun, Tablet, type LucideIcon } from 'lucide-react'
import { useId, useMemo, useState } from 'react'
import {
  DEFAULT_DEVICE_PREVIEW_ID,
  DEVICE_PREVIEWS,
  getDevicePreview,
  type DevicePreviewId,
} from '../constants/devicePreviews.js'
import { useThemeLanguage } from '../hooks/useThemeTranslations.js'
import { borderRadiusPresets } from '../providers/Theme/themeConfig.js'

const DEVICE_ICONS: Record<DevicePreviewId, LucideIcon> = {
  mobile: Smartphone,
  tablet: Tablet,
  desktop: Monitor,
}

/**
 * Live, reactive preview of the Visual Effects + Component Styles + colour
 * choices. Mounted as a `ui` field inside the Appearance Settings tab so editors
 * see the combined result of every control update instantly — mirroring the CSS
 * that `generateThemeCSS` produces on the front-end.
 */

type Mode = 'light' | 'dark'

const SHADOW_MAP: Record<string, string> = {
  none: 'none',
  subtle: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
  medium: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)',
  strong: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)',
  dramatic: '0 25px 50px -12px rgba(0,0,0,0.25)',
}

const BLUR_PX_MAP: Record<string, string> = {
  none: '0px',
  slight: '4px',
  medium: '8px',
  strong: '16px',
  heavy: '24px',
}

const BUTTON_SIZE_MAP: Record<string, { padding: string; fontSize: string }> = {
  small: { padding: '6px 12px', fontSize: '12px' },
  medium: { padding: '8px 16px', fontSize: '13px' },
  large: { padding: '10px 24px', fontSize: '15px' },
  xl: { padding: '14px 32px', fontSize: '17px' },
}

function radiusToPx(token: string | undefined): string {
  const preset = borderRadiusPresets[(token ?? 'medium') as keyof typeof borderRadiusPresets]
  const css = preset?.css as Record<string, string> | undefined
  return css?.['--radius-large'] ?? css?.['--radius-default'] ?? '0.75rem'
}

interface Palette {
  background: string
  foreground: string
  card: string
  cardForeground: string
  primary: string
  primaryForeground: string
  secondary: string
  secondaryForeground: string
  muted: string
  mutedForeground: string
  accent: string
  accentForeground: string
  border: string
  gradientFrom: string
  gradientVia: string
  gradientTo: string
}

interface Choices {
  effectStyle: string
  shadowIntensity: string
  backdropBlur: string
  borderStyle: string
  borderWidth: string
  glassOpacity: number
  buttonVariant: string
  buttonSize: string
  cardStyle: string
  cardHoverEffect: string
  imageStyle: string
  navbarStyle: string
  footerStyle: string
  linkStyle: string
  borderRadius: string
}

function cardSurface(c: Choices, p: Palette, radius: string): React.CSSProperties {
  const base: React.CSSProperties = {
    background: p.card,
    color: p.cardForeground,
    borderRadius: radius,
    border: `${c.borderWidth} ${c.borderStyle === 'none' ? 'solid' : c.borderStyle} ${p.border}`,
    padding: '16px',
    transition: 'transform 200ms ease, box-shadow 200ms ease',
  }

  // Card style takes precedence for the structural look, effect style for depth.
  if (c.cardStyle === 'bordered') {
    return {
      ...base,
      border: `2px solid ${p.foreground}`,
      borderRadius: 0,
      boxShadow: `4px 4px 0 ${p.foreground}`,
    }
  }
  if (c.cardStyle === 'gradient-border') {
    return {
      ...base,
      border: '2px solid transparent',
      borderImage: `linear-gradient(135deg, ${p.gradientFrom}, ${p.gradientVia}, ${p.gradientTo}) 1`,
      boxShadow: SHADOW_MAP[c.shadowIntensity] ?? SHADOW_MAP.medium,
    }
  }

  switch (c.effectStyle) {
    case 'glass':
      return {
        ...base,
        background: `color-mix(in srgb, ${p.card} ${c.glassOpacity}%, transparent)`,
        backdropFilter: `blur(${BLUR_PX_MAP[c.backdropBlur] ?? '8px'}) saturate(150%)`,
        border: `1px solid color-mix(in srgb, ${p.border} 50%, transparent)`,
        boxShadow: '0 4px 24px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.15)',
      }
    case 'neumorphic':
      return {
        ...base,
        background: p.background,
        border: 'none',
        boxShadow: '6px 6px 12px rgba(0,0,0,0.12), -6px -6px 12px rgba(255,255,255,0.7)',
      }
    case 'clay':
      return {
        ...base,
        border: 'none',
        boxShadow: '4px 4px 0 rgba(0,0,0,0.22), 0 8px 20px rgba(0,0,0,0.08)',
      }
    case 'elevated':
      return { ...base, border: 'none', boxShadow: SHADOW_MAP[c.shadowIntensity] ?? SHADOW_MAP.medium }
    case 'flat':
    default:
      return { ...base, boxShadow: 'none' }
  }
}

function buttonStyle(c: Choices, p: Palette, radius: string): React.CSSProperties {
  const size = BUTTON_SIZE_MAP[c.buttonSize] ?? BUTTON_SIZE_MAP.medium!
  const base: React.CSSProperties = {
    ...size,
    fontWeight: 600,
    cursor: 'pointer',
    borderRadius: radius,
    border: 'none',
    transition: 'transform 120ms ease, box-shadow 120ms ease',
    whiteSpace: 'nowrap',
  }
  switch (c.buttonVariant) {
    case 'outlined':
      return { ...base, background: 'transparent', color: p.primary, border: `1.5px solid ${p.primary}` }
    case 'ghost':
      return { ...base, background: 'transparent', color: p.primary }
    case 'gradient':
      return {
        ...base,
        backgroundImage: `linear-gradient(135deg, ${p.gradientFrom}, ${p.gradientVia}, ${p.gradientTo})`,
        color: p.primaryForeground,
      }
    case 'pill':
      return { ...base, background: p.primary, color: p.primaryForeground, borderRadius: '9999px' }
    case 'brutal':
      return {
        ...base,
        background: p.card,
        color: p.foreground,
        border: `2px solid ${p.foreground}`,
        borderRadius: 0,
        boxShadow: `3px 3px 0 ${p.foreground}`,
      }
    case 'filled':
    default:
      return { ...base, background: p.primary, color: p.primaryForeground }
  }
}

function navbarStyle(c: Choices, p: Palette): React.CSSProperties {
  const base: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 14px',
    background: p.background,
    color: p.foreground,
    borderBottom: `1px solid ${p.border}`,
  }
  switch (c.navbarStyle) {
    case 'transparent':
      return { ...base, background: 'transparent', borderBottom: '1px solid transparent' }
    case 'blur':
      return {
        ...base,
        background: `color-mix(in srgb, ${p.background} 70%, transparent)`,
        backdropFilter: 'blur(12px)',
      }
    case 'floating':
      return {
        ...base,
        margin: '8px',
        borderRadius: radiusToPx(c.borderRadius),
        border: `1px solid ${p.border}`,
        boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
      }
    case 'minimal':
      return { ...base, borderBottom: `1px solid ${p.border}`, boxShadow: 'none' }
    case 'solid':
    default:
      return base
  }
}

function linkStyle(c: Choices, p: Palette): React.CSSProperties {
  switch (c.linkStyle) {
    case 'underline':
      return { color: p.primary, textDecoration: 'underline', textUnderlineOffset: '0.15em' }
    case 'none':
      return { color: p.primary, textDecoration: 'none' }
    case 'highlight':
      return {
        color: p.foreground,
        textDecoration: 'none',
        backgroundImage: `linear-gradient(transparent 60%, color-mix(in srgb, ${p.primary} 28%, transparent) 0)`,
      }
    case 'animated':
      return {
        color: p.primary,
        textDecoration: 'none',
        borderBottom: `2px solid ${p.primary}`,
        paddingBottom: '1px',
      }
    case 'underline-hover':
    default:
      return { color: p.primary, textDecoration: 'none' }
  }
}

export default function AppearancePreviewField() {
  const formFields = useFormFields(([state]) => state) as Record<
    string,
    { value?: unknown } | undefined
  >
  const lang = useThemeLanguage() as 'en' | 'cs'
  const [mode, setMode] = useState<Mode>('light')
  const [device, setDevice] = useState<DevicePreviewId>(DEFAULT_DEVICE_PREVIEW_ID)
  const uid = useId().replace(/[:]/g, '')

  const activeDevice = getDevicePreview(device)

  const str = (key: string, fallback: string): string => {
    const v = formFields?.[`themeConfiguration.${key}`]?.value
    return typeof v === 'string' && v.trim().length > 0 ? v : fallback
  }
  const num = (key: string, fallback: number): number => {
    const v = formFields?.[`themeConfiguration.${key}`]?.value
    return typeof v === 'number' ? v : fallback
  }

  const choices: Choices = {
    effectStyle: str('visualEffects.effectStyle', 'flat'),
    shadowIntensity: str('visualEffects.shadowIntensity', 'medium'),
    backdropBlur: str('visualEffects.backdropBlur', 'none'),
    borderStyle: str('visualEffects.borderStyle', 'solid'),
    borderWidth: str('visualEffects.borderWidth', '1px'),
    glassOpacity: num('visualEffects.glassOpacity', 60),
    buttonVariant: str('componentStyles.buttonVariant', 'filled'),
    buttonSize: str('componentStyles.buttonSize', 'medium'),
    cardStyle: str('componentStyles.cardStyle', 'elevated'),
    cardHoverEffect: str('componentStyles.cardHoverEffect', 'lift'),
    imageStyle: str('componentStyles.imageStyle', 'default'),
    navbarStyle: str('componentStyles.navbarStyle', 'solid'),
    footerStyle: str('componentStyles.footerStyle', 'standard'),
    linkStyle: str('componentStyles.linkStyle', 'underline-hover'),
    borderRadius: str('borderRadius', 'medium'),
  }

  const modeKey = mode === 'light' ? 'lightMode' : 'darkMode'
  const fallback: Palette =
    mode === 'light'
      ? {
          background: '#ffffff',
          foreground: '#0a0a0a',
          card: '#ffffff',
          cardForeground: '#0a0a0a',
          primary: '#9372f7',
          primaryForeground: '#fafafa',
          secondary: '#f4f4f5',
          secondaryForeground: '#18181b',
          muted: '#f4f4f5',
          mutedForeground: '#71717a',
          accent: '#f4f4f5',
          accentForeground: '#18181b',
          border: '#e4e4e7',
          gradientFrom: '#9372f7',
          gradientVia: '#7c6ff0',
          gradientTo: '#22d3ee',
        }
      : {
          background: '#0a0a0a',
          foreground: '#fafafa',
          card: '#09090b',
          cardForeground: '#fafafa',
          primary: '#9372f7',
          primaryForeground: '#09090b',
          secondary: '#27272a',
          secondaryForeground: '#fafafa',
          muted: '#27272a',
          mutedForeground: '#a1a1aa',
          accent: '#27272a',
          accentForeground: '#fafafa',
          border: '#27272a',
          gradientFrom: '#9372f7',
          gradientVia: '#7c6ff0',
          gradientTo: '#22d3ee',
        }

  const palette: Palette = useMemo(() => {
    const p = { ...fallback }
    ;(Object.keys(fallback) as (keyof Palette)[]).forEach((key) => {
      p[key] = str(`${modeKey}.${key}`, fallback[key])
    })
    return p
  }, [formFields, mode])

  const radius = radiusToPx(choices.borderRadius)
  const card = cardSurface(choices, palette, radius)
  const btn = buttonStyle(choices, palette, radius)
  const nav = navbarStyle(choices, palette)

  // Hover effects can't be expressed inline, so emit a scoped style block.
  const hoverCSS = (() => {
    const sel = `.${uid} .tm-prev-card`
    switch (choices.cardHoverEffect) {
      case 'lift':
        return `${sel}:hover{transform:translateY(-6px);box-shadow:0 20px 40px rgba(0,0,0,0.14)}`
      case 'scale':
        return `${sel}:hover{transform:scale(1.02)}`
      case 'glow':
        return `${sel}:hover{box-shadow:0 0 0 3px color-mix(in srgb, ${palette.primary} 25%, transparent),0 8px 32px rgba(0,0,0,0.12)}`
      case 'shadow':
        return `${sel}:hover{box-shadow:0 24px 50px -12px rgba(0,0,0,0.35)}`
      case 'tilt':
        return `${sel}:hover{transform:perspective(800px) rotateX(3deg) rotateY(-3deg)}`
      default:
        return ''
    }
  })()
  const btnHoverCSS = `.${uid} .tm-prev-btn:hover{filter:brightness(1.05)}${
    choices.buttonVariant === 'brutal'
      ? `.${uid} .tm-prev-btn:hover{transform:translate(-2px,-2px);box-shadow:5px 5px 0 ${palette.foreground}}`
      : ''
  }`

  const t = {
    title: lang === 'cs' ? 'Efekty & komponenty' : 'Effects & components',
    subtitle:
      lang === 'cs'
        ? 'Náhled povrchů, tlačítek, navbaru a patičky. Barvy a typografie se vybírají u motivu výše.'
        : 'Preview of surfaces, buttons, navbar and footer. Colours & typography are chosen at the theme above.',
    light: lang === 'cs' ? 'Světlý' : 'Light',
    dark: lang === 'cs' ? 'Tmavý' : 'Dark',
    heading: lang === 'cs' ? 'Ukázkový nadpis' : 'Sample heading',
    body:
      lang === 'cs'
        ? 'Příliš žluťoučký kůň úpěl ďábelské ódy. Tady je '
        : 'The quick brown fox jumps over the lazy dog. Here is an ',
    link: lang === 'cs' ? 'odkaz' : 'inline link',
    primary: lang === 'cs' ? 'Primární' : 'Primary',
    secondary: lang === 'cs' ? 'Sekundární' : 'Secondary',
    footer: lang === 'cs' ? 'Patička' : 'Footer',
    viewport: lang === 'cs' ? 'Náhled zařízení' : 'Device preview',
  }

  const chips: Array<[string, string]> = [
    ['effect', choices.effectStyle],
    ['shadow', choices.shadowIntensity],
    ['card', choices.cardStyle],
    ['hover', choices.cardHoverEffect],
    ['button', `${choices.buttonVariant}/${choices.buttonSize}`],
    ['navbar', choices.navbarStyle],
    ['footer', choices.footerStyle],
    ['link', choices.linkStyle],
    ['image', choices.imageStyle],
    ['radius', choices.borderRadius],
  ]

  const footerStyleCss: React.CSSProperties =
    choices.footerStyle === 'dark'
      ? { background: palette.foreground, color: palette.background }
      : choices.footerStyle === 'full-color'
        ? { background: palette.primary, color: palette.primaryForeground }
        : choices.footerStyle === 'gradient-top'
          ? {
              background: palette.background,
              color: palette.mutedForeground,
              borderTop: '3px solid transparent',
              borderImage: `linear-gradient(135deg, ${palette.gradientFrom}, ${palette.gradientVia}, ${palette.gradientTo}) 1`,
            }
          : choices.footerStyle === 'minimal'
            ? { background: 'transparent', color: palette.mutedForeground, borderTop: `1px solid ${palette.border}` }
            : { background: palette.muted, color: palette.mutedForeground, borderTop: `1px solid ${palette.border}` }

  return (
    <div className={uid} style={{ marginBottom: '20px' }}>
      <style dangerouslySetInnerHTML={{ __html: hoverCSS + btnHoverCSS }} />

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '8px',
          gap: '8px',
          flexWrap: 'wrap',
        }}
      >
        <div>
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
            <Sparkles size={14} aria-hidden />
            {t.title}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--theme-elevation-500)' }}>{t.subtitle}</div>
        </div>
        <div style={{ display: 'inline-flex', gap: '8px', flexWrap: 'wrap' }}>
          {/* Device / viewport switcher */}
          <div
            role="group"
            aria-label={t.viewport}
            style={{ display: 'inline-flex', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--theme-elevation-200)' }}
          >
            {DEVICE_PREVIEWS.map((d) => {
              const Icon = DEVICE_ICONS[d.id]
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDevice(d.id)}
                  title={`${lang === 'cs' ? d.labelCs : d.label} — ${d.width}×${d.height}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '5px 10px',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: 'none',
                    background: device === d.id ? 'var(--theme-elevation-800)' : 'transparent',
                    color: device === d.id ? 'var(--theme-elevation-0)' : 'var(--theme-elevation-600)',
                  }}
                >
                  <Icon size={13} aria-hidden />
                  {lang === 'cs' ? d.labelCs : d.label}
                </button>
              )
            })}
          </div>
          {/* Light / dark switcher */}
          <div style={{ display: 'inline-flex', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--theme-elevation-200)' }}>
            {(['light', 'dark'] as Mode[]).map((m) => {
              const Icon = m === 'light' ? Sun : Moon
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '5px 12px',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: 'none',
                    background: mode === m ? 'var(--theme-elevation-800)' : 'transparent',
                    color: mode === m ? 'var(--theme-elevation-0)' : 'var(--theme-elevation-600)',
                  }}
                >
                  <Icon size={13} aria-hidden />
                  {m === 'light' ? t.light : t.dark}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Viewport wrapper — constrains the frame to the active device width */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          background: 'var(--theme-elevation-50)',
          borderRadius: '14px',
          padding: device === 'desktop' ? '0' : '16px',
          transition: 'padding 0.25s ease',
        }}
      >
      {/* Browser-like frame */}
      <div
        style={{
          width: '100%',
          maxWidth: device === 'desktop' ? '100%' : `${activeDevice.width}px`,
          borderRadius: '14px',
          overflow: 'hidden',
          border: '1px solid var(--theme-elevation-200)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
          background: palette.background,
          color: palette.foreground,
          transition: 'max-width 0.25s ease',
        }}
      >
        <nav style={nav}>
          <span style={{ fontWeight: 700, fontSize: '13px' }}>Acme</span>
          <span style={{ display: 'flex', gap: '14px', fontSize: '12px', opacity: 0.85 }}>
            <span>Home</span>
            <span>About</span>
            <span style={{ ...linkStyle(choices, palette) }}>Services</span>
          </span>
        </nav>

        <div style={{ padding: '20px', display: 'grid', gap: '14px' }}>
          <div>
            <div style={{ fontSize: '20px', fontWeight: 700, lineHeight: 1.2 }}>{t.heading}</div>
            <p style={{ margin: '6px 0 0', fontSize: '13px', lineHeight: 1.6, color: palette.mutedForeground }}>
              {t.body}
              <a style={linkStyle(choices, palette)}>{t.link}</a>.
            </p>
          </div>

          <div className="tm-prev-card" style={card}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <button type="button" className="tm-prev-btn" style={btn}>
                {t.primary}
              </button>
              <button
                type="button"
                style={{
                  ...BUTTON_SIZE_MAP[choices.buttonSize] ?? BUTTON_SIZE_MAP.medium,
                  fontWeight: 600,
                  cursor: 'pointer',
                  borderRadius: radius,
                  background: palette.secondary,
                  color: palette.secondaryForeground,
                  border: 'none',
                }}
              >
                {t.secondary}
              </button>
              <span
                aria-hidden
                title="brand gradient"
                style={{
                  marginLeft: 'auto',
                  width: '54px',
                  height: '22px',
                  borderRadius: '6px',
                  backgroundImage: `linear-gradient(135deg, ${palette.gradientFrom}, ${palette.gradientVia}, ${palette.gradientTo})`,
                  boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.08)',
                }}
              />
            </div>
          </div>
        </div>

        <div style={{ padding: '12px 16px', fontSize: '11px', ...footerStyleCss }}>
          © {new Date().getFullYear()} Acme — {t.footer}
        </div>
      </div>
      </div>

      {/* Active spec chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '10px' }}>
        {chips.map(([k, v]) => (
          <span
            key={k}
            style={{
              fontSize: '10px',
              padding: '2px 7px',
              borderRadius: '999px',
              background: 'var(--theme-elevation-50)',
              border: '1px solid var(--theme-elevation-150)',
              color: 'var(--theme-elevation-600)',
            }}
          >
            <span style={{ opacity: 0.6 }}>{k}:</span> <strong style={{ fontWeight: 600 }}>{v}</strong>
          </span>
        ))}
      </div>
    </div>
  )
}
