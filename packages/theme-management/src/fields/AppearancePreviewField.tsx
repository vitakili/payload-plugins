'use client'

import { useFormFields } from '@payloadcms/ui'
import {
  ExternalLink,
  Monitor,
  Moon,
  Smartphone,
  Sparkles,
  Sun,
  Tablet,
  type LucideIcon,
} from 'lucide-react'
import { useId, useMemo, useState } from 'react'
import {
  DEFAULT_DEVICE_PREVIEW_ID,
  DEVICE_PREVIEWS,
  getDevicePreview,
  type DevicePreviewId,
} from '../constants/devicePreviews.js'
import { useThemeLanguage, useThemeTranslations } from '../hooks/useThemeTranslations.js'
import { resolveTypographyPreview } from '../components/typographyPreviewUtils.js'
import { useNativeLivePreview } from '../hooks/useNativeLivePreview.js'
import { useThemeFonts } from '../hooks/useThemeFonts.js'
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
  /** Padding / gap multiplier from the spacing scale. */
  space: number
}

const SPACING_SCALE: Record<string, number> = { compact: 0.75, medium: 1, comfortable: 1.5, spacious: 1.5 }
const px = (value: number, c: Choices) => `${Math.round(value * c.space)}px`

function cardSurface(c: Choices, p: Palette, radius: string): React.CSSProperties {
  const base: React.CSSProperties = {
    background: p.card,
    color: p.cardForeground,
    borderRadius: radius,
    border:
      c.borderStyle === 'none' || c.borderWidth === '0px'
        ? 'none'
        : `${c.borderWidth} ${c.borderStyle} ${p.border}`,
    padding: px(16, c),
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
    padding: `${px(10, c)} ${px(14, c)}`,
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
  const translations = useThemeTranslations()
  const t = translations.appearancePreview
  const site = translations.preview
  const [mode, setMode] = useState<Mode>('light')
  const [device, setDevice] = useState<DevicePreviewId>(DEFAULT_DEVICE_PREVIEW_ID)
  const uid = useId().replace(/[:]/g, '')
  const nativePreview = useNativeLivePreview()

  const activeDevice = getDevicePreview(device)

  // Fonts follow the Typography section (or the theme preset when set to "Use theme preset"),
  // so this single preview shows colours, type and component styles together.
  const typographyValue = (key: string) =>
    formFields?.[`themeConfiguration.typography.${key}`]?.value as string | undefined
  const typography = resolveTypographyPreview(
    {
      bodyFont: typographyValue('bodyFont'),
      headingFont: typographyValue('headingFont'),
      bodyFontCustom: typographyValue('bodyFontCustom'),
      headingFontCustom: typographyValue('headingFontCustom'),
      baseFontSize: typographyValue('baseFontSize'),
      lineHeight: typographyValue('lineHeight'),
      headingWeight: typographyValue('headingWeight'),
      letterSpacing: typographyValue('letterSpacing'),
    },
    formFields?.['themeConfiguration.theme']?.value as string | undefined,
  )
  useThemeFonts([typographyValue('bodyFont'), typographyValue('headingFont')])

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
    space: SPACING_SCALE[str('spacing', 'medium')] ?? 1,
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
    // Same fallback as the site's --gradient-brand: primary → accent when no stops are set.
    p.gradientFrom = str(`${modeKey}.gradientFrom`, p.primary)
    p.gradientTo = str(`${modeKey}.gradientTo`, p.accent)
    p.gradientVia = str(`${modeKey}.gradientVia`, p.gradientFrom)
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
  // Movement-based hover effects only run for users who haven't asked for reduced motion.
  const previewCSS = `@media (prefers-reduced-motion: no-preference){${hoverCSS}${btnHoverCSS}}`

  // Content image treatment, mirroring the site's [data-img] rules.
  const imageCss: React.CSSProperties = (() => {
    const base: React.CSSProperties = {
      aspectRatio: '4 / 3',
      borderRadius: 0,
      backgroundImage: `radial-gradient(circle at 70% 30%, ${palette.accent} 0 18%, transparent 19%), linear-gradient(160deg, ${palette.gradientFrom}, ${palette.gradientTo})`,
    }
    switch (choices.imageStyle) {
      case 'rounded':
        return { ...base, borderRadius: radius }
      case 'circle':
        return { ...base, aspectRatio: '1 / 1', borderRadius: '9999px' }
      case 'grayscale':
        return { ...base, filter: 'grayscale(1)' }
      case 'duotone':
        return { ...base, filter: 'grayscale(1) contrast(1.05)', mixBlendMode: 'luminosity' }
      case 'vignette':
        return { ...base, boxShadow: 'inset 0 0 40px rgba(0,0,0,0.45)' }
      case 'polaroid':
        return {
          ...base,
          border: '8px solid #fff',
          borderBottomWidth: '24px',
          boxShadow: '0 6px 16px rgba(0,0,0,0.18)',
          borderRadius: '2px',
        }
      default:
        return base
    }
  })()

  const headingStyle: React.CSSProperties = {
    fontFamily: typography.headingFont,
    fontWeight: Number(typography.headingWeight) || 700,
    letterSpacing: typography.headingLetterSpacing,
    textTransform: typography.headingTransform,
    lineHeight: 1.15,
    margin: 0,
  }

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

  // With Payload's native Live Preview the real site is the preview: no mock.
  if (nativePreview.isEnabled) {
    if (nativePreview.isOpen) return null
    return (
      <div className="tm-native-preview-hint">
        <div className="tm-native-preview-hint__text">
          <span className="tm-native-preview-hint__title">
            <Sparkles size={14} aria-hidden />
            {t.nativeTitle}
          </span>
          <span className="tm-native-preview-hint__body">{t.nativeBody}</span>
        </div>
        <button type="button" className="tm-native-preview-hint__action" onClick={nativePreview.open}>
          <ExternalLink size={14} aria-hidden />
          {t.nativeOpen}
        </button>
      </div>
    )
  }

  return (
    // The slot spans the whole right column of the Appearance tab on wide admins;
    // its inner panel is sticky so the preview stays in view while editing.
    <div className={`tm-live-preview-slot ${uid}`}>
      <div className="tm-live-preview">
      <style dangerouslySetInnerHTML={{ __html: previewCSS }} />

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
          <div style={{ fontSize: '12px', color: 'var(--theme-elevation-600)' }}>{t.subtitle}</div>
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
                  aria-pressed={device === d.id}
                  onClick={() => setDevice(d.id)}
                  title={`${lang === 'cs' ? d.labelCs : d.label} — ${d.width}×${d.height}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    minHeight: '28px',
                    padding: '5px 10px',
                    fontSize: '12px',
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
          <div
            role="group"
            aria-label={`${t.light} / ${t.dark}`}
            style={{ display: 'inline-flex', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--theme-elevation-200)' }}
          >
            {(['light', 'dark'] as Mode[]).map((m) => {
              const Icon = m === 'light' ? Sun : Moon
              return (
                <button
                  key={m}
                  type="button"
                  aria-pressed={mode === m}
                  onClick={() => setMode(m)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    minHeight: '28px',
                    padding: '5px 12px',
                    fontSize: '12px',
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
        }}
      >
      {/* Browser-like frame. It is a picture of the site, so it is inert: its
          sample buttons and links must not become dead tab stops. */}
      <div
        ref={(el) => el?.setAttribute('inert', '')}
        style={{
          width: '100%',
          maxWidth: device === 'desktop' ? '100%' : `${activeDevice.width}px`,
          borderRadius: '14px',
          overflow: 'hidden',
          border: '1px solid var(--theme-elevation-200)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
          background: palette.background,
          color: palette.foreground,
          fontFamily: typography.bodyFont,
          lineHeight: typography.lineHeight,
        }}
      >
        <nav style={nav}>
          <span style={{ fontWeight: 700, fontSize: '13px' }}>{site.siteTitle}</span>
          <span style={{ display: 'flex', gap: '14px', fontSize: '12px', opacity: 0.85 }}>
            <span>{site.nav.home}</span>
            <span>{site.nav.about}</span>
            <span style={{ ...linkStyle(choices, palette) }}>{site.nav.services}</span>
          </span>
        </nav>

        <div style={{ padding: px(20, choices), display: 'grid', gap: px(14, choices) }}>
          <div>
            <div style={{ ...headingStyle, fontSize: '24px' }}>{t.heading}</div>
            <p
              style={{
                margin: `${px(6, choices)} 0 0`,
                fontSize: `calc(${typography.baseFontSize} * 0.8125)`,
                lineHeight: typography.lineHeight,
                color: palette.mutedForeground,
                maxWidth: '60ch',
              }}
            >
              {t.body}
              <a style={linkStyle(choices, palette)}>{t.link}</a>.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: device === 'mobile' ? '1fr' : 'minmax(0, 3fr) minmax(0, 2fr)',
              gap: px(12, choices),
              alignItems: 'start',
            }}
          >
            <div className="tm-prev-card" style={card}>
              <div style={{ ...headingStyle, fontSize: '15px', marginBottom: px(6, choices) }}>
                {t.cardTitle}
              </div>
              <p
                style={{
                  margin: `0 0 ${px(12, choices)}`,
                  fontSize: `calc(${typography.baseFontSize} * 0.75)`,
                  lineHeight: typography.lineHeight,
                  color: palette.cardForeground,
                  opacity: 0.8,
                }}
              >
                {t.cardBody}
              </p>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <button type="button" className="tm-prev-btn" style={btn}>
                  {t.primary}
                </button>
                <button
                  type="button"
                  style={{
                    ...(BUTTON_SIZE_MAP[choices.buttonSize] ?? BUTTON_SIZE_MAP.medium),
                    fontWeight: 600,
                    cursor: 'pointer',
                    borderRadius: choices.buttonVariant === 'pill' ? '9999px' : radius,
                    background: palette.secondary,
                    color: palette.secondaryForeground,
                    border: 'none',
                  }}
                >
                  {t.secondary}
                </button>
              </div>
            </div>
            <div aria-hidden style={imageCss} />
          </div>
        </div>

        <div style={{ padding: `${px(12, choices)} ${px(16, choices)}`, fontSize: '11px', ...footerStyleCss }}>
          © {new Date().getFullYear()} {site.siteTitle} — {t.footer}
        </div>
      </div>
      </div>

      </div>
    </div>
  )
}
