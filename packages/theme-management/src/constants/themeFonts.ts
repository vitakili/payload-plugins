// Theme font constants for the plugin.
//
// One catalog drives everything: the body/heading selects, the style presets,
// the admin previews, the CSS emitted for the site and the Google Fonts request
// that loads the chosen faces. A font a style preset refers to must exist here,
// otherwise Payload rejects the saved value.

export type FontCategory = 'sans-serif' | 'serif' | 'display' | 'monospace'

export interface FontCatalogEntry {
  /** Stored value (the Google Fonts family name, or a system keyword). */
  value: string
  category: FontCategory
  /** Full CSS font-family stack. A `--font-*` variable is honoured first so a
   *  site that self-hosts the face with `next/font` keeps using that copy. */
  fontFamily: string
  /** Weights requested from Google Fonts (`null` for system stacks). */
  googleWeights: string | null
  /** Display faces only make sense for headings. */
  headingOnly?: boolean
}

const google = (
  value: string,
  category: FontCategory,
  cssVar: string,
  fallback: string,
  googleWeights: string,
  headingOnly?: boolean,
): FontCatalogEntry => ({
  value,
  category,
  fontFamily: `var(${cssVar}, "${value}"), ${fallback}`,
  googleWeights,
  headingOnly,
})

const SANS = 'system-ui, -apple-system, "Segoe UI", sans-serif'
const SERIF = 'Georgia, "Times New Roman", serif'
const MONO = 'ui-monospace, SFMono-Regular, Menlo, monospace'

export const FONT_CATALOG: readonly FontCatalogEntry[] = [
  {
    value: 'system-ui',
    category: 'sans-serif',
    fontFamily: SANS,
    googleWeights: null,
  },
  {
    value: 'helvetica',
    category: 'sans-serif',
    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    googleWeights: null,
  },
  google('Inter', 'sans-serif', '--font-inter', SANS, '300;400;500;600;700;800'),
  google('Roboto', 'sans-serif', '--font-roboto', SANS, '300;400;500;700;900'),
  google('Open Sans', 'sans-serif', '--font-open-sans', SANS, '300;400;500;600;700;800'),
  google('Lato', 'sans-serif', '--font-lato', SANS, '300;400;700;900'),
  google('Montserrat', 'sans-serif', '--font-montserrat', SANS, '300;400;500;600;700;800'),
  google('Poppins', 'sans-serif', '--font-poppins', SANS, '300;400;500;600;700;800'),
  google('Raleway', 'sans-serif', '--font-raleway', SANS, '300;400;500;600;700;800'),
  google('DM Sans', 'sans-serif', '--font-dm-sans', SANS, '300;400;500;600;700'),
  google('Nunito', 'sans-serif', '--font-nunito', SANS, '300;400;600;700;800'),
  google('Plus Jakarta Sans', 'sans-serif', '--font-plus-jakarta', SANS, '300;400;500;600;700;800'),
  google('Manrope', 'sans-serif', '--font-manrope', SANS, '300;400;500;600;700;800'),
  google('Space Grotesk', 'sans-serif', '--font-space-grotesk', SANS, '300;400;500;600;700'),
  google('Source Sans 3', 'sans-serif', '--font-source-sans', SANS, '300;400;600;700'),
  google('Work Sans', 'sans-serif', '--font-work-sans', SANS, '300;400;500;600;700'),
  google('Archivo', 'sans-serif', '--font-archivo', SANS, '400;500;600;700;800'),
  google('Outfit', 'sans-serif', '--font-outfit', SANS, '300;400;500;600;700'),
  google('Playfair Display', 'serif', '--font-playfair', SERIF, '400;500;600;700;800'),
  google('Merriweather', 'serif', '--font-merriweather', SERIF, '300;400;700;900'),
  google('Lora', 'serif', '--font-lora', SERIF, '400;500;600;700'),
  google('Cormorant Garamond', 'serif', '--font-cormorant', SERIF, '300;400;500;600;700'),
  google('Crimson Pro', 'serif', '--font-crimson', SERIF, '300;400;500;600;700'),
  google('Fraunces', 'serif', '--font-fraunces', SERIF, '300;400;500;600;700'),
  google('Libre Baskerville', 'serif', '--font-libre-baskerville', SERIF, '400;700'),
  google('DM Serif Display', 'display', '--font-dm-serif', SERIF, '400', true),
  google('Bebas Neue', 'display', '--font-bebas', SANS, '400', true),
  google('Archivo Black', 'display', '--font-archivo-black', SANS, '400', true),
  google('Syne', 'display', '--font-syne', SANS, '400;500;600;700;800', true),
  google('Space Mono', 'monospace', '--font-space-mono', MONO, '400;700'),
  google('IBM Plex Mono', 'monospace', '--font-ibm-plex-mono', MONO, '300;400;500;600;700'),
  google('JetBrains Mono', 'monospace', '--font-jetbrains-mono', MONO, '300;400;500;700'),
]

const CATALOG_BY_VALUE = new Map(FONT_CATALOG.map((entry) => [entry.value, entry]))

/** Values stored by earlier versions that now map onto a catalog entry. */
const LEGACY_FONT_ALIASES: Record<string, string> = {
  'Source Sans Pro': 'Source Sans 3',
  'Helvetica Neue': 'helvetica',
}

export function getFontCatalogEntry(value?: string | null): FontCatalogEntry | undefined {
  if (!value) return undefined
  return CATALOG_BY_VALUE.get(LEGACY_FONT_ALIASES[value] ?? value)
}

export const FONT_CATEGORY_LABELS: Record<FontCategory, { en: string; cs: string }> = {
  'sans-serif': { en: 'Sans-serif', cs: 'Bezpatkové' },
  serif: { en: 'Serif', cs: 'Patkové' },
  display: { en: 'Display (headings)', cs: 'Výrazné (nadpisy)' },
  monospace: { en: 'Monospace', cs: 'Neproporcionální' },
}

const fontLabel = (entry: FontCatalogEntry) =>
  entry.value === 'system-ui'
    ? { en: 'System', cs: 'Systémové' }
    : entry.value === 'helvetica'
      ? { en: 'Helvetica (system)', cs: 'Helvetica (systémové)' }
      : { en: entry.value, cs: entry.value }

const toOption = (entry: FontCatalogEntry) => ({
  label: fontLabel(entry),
  value: entry.value,
  fontFamily: entry.fontFamily,
  category: entry.category,
})

const PRESET_OPTION = { label: { en: 'Use theme preset', cs: 'Podle motivu' }, value: 'preset' }
const CUSTOM_OPTION = { label: { en: 'Custom font…', cs: 'Vlastní písmo…' }, value: 'custom' }

export const BODY_FONT_OPTIONS = [
  PRESET_OPTION,
  ...FONT_CATALOG.filter((entry) => !entry.headingOnly).map(toOption),
  CUSTOM_OPTION,
]

export const HEADING_FONT_OPTIONS = [PRESET_OPTION, ...FONT_CATALOG.map(toOption), CUSTOM_OPTION]

export const BASE_FONT_SIZE_OPTIONS = [
  { label: { en: 'Use theme preset', cs: 'Podle motivu' }, value: 'preset' },
  { label: '14px', value: '14' },
  { label: '15px', value: '15' },
  { label: '16px', value: '16' },
  { label: '17px', value: '17' },
  { label: '18px', value: '18' },
  { label: '20px', value: '20' },
]

export const LINE_HEIGHT_OPTIONS = [
  { label: { en: 'Use theme preset', cs: 'Podle motivu' }, value: 'preset' },
  { label: { en: '1.4 — tight', cs: '1,4 — těsné' }, value: '1.4' },
  { label: '1.5', value: '1.5' },
  { label: '1.6', value: '1.6' },
  { label: '1.7', value: '1.7' },
  { label: { en: '1.8 — airy', cs: '1,8 — vzdušné' }, value: '1.8' },
]

export const HEADING_WEIGHT_OPTIONS = [
  { label: { en: 'Use theme preset', cs: 'Podle motivu' }, value: 'preset' },
  { label: { en: 'Light (300)', cs: 'Tenké (300)' }, value: '300' },
  { label: { en: 'Regular (400)', cs: 'Normální (400)' }, value: '400' },
  { label: { en: 'Medium (500)', cs: 'Střední (500)' }, value: '500' },
  { label: { en: 'Semibold (600)', cs: 'Polotučné (600)' }, value: '600' },
  { label: { en: 'Bold (700)', cs: 'Tučné (700)' }, value: '700' },
  { label: { en: 'Extra bold (800)', cs: 'Extra tučné (800)' }, value: '800' },
]

export const LETTER_SPACING_OPTIONS = [
  { label: { en: 'Use theme preset', cs: 'Podle motivu' }, value: 'preset' },
  { label: { en: 'Tight', cs: 'Těsné' }, value: 'tight' },
  { label: { en: 'Normal', cs: 'Normální' }, value: 'normal' },
  { label: { en: 'Wide', cs: 'Široké' }, value: 'wide' },
  { label: { en: 'Extra wide (caps)', cs: 'Velmi široké (verzálky)' }, value: 'wider' },
]

/** Heading tracking for each letter-spacing token. `wider` also sets headings in caps. */
export const LETTER_SPACING_TO_CSS: Record<string, string> = {
  tight: '-0.025em',
  normal: '0',
  wide: '0.02em',
  wider: '0.08em',
}

/** Stored base-font-size values are bare pixel numbers ('16'); CSS needs a unit. */
export function toFontSizeCss(value?: string | null): string | undefined {
  if (!value || value === 'preset') return undefined
  return /^\d+(\.\d+)?$/.test(value.trim()) ? `${value.trim()}px` : value
}

export const FONT_VALUE_TO_CSS: Record<string, string> = Object.fromEntries(
  FONT_CATALOG.map((entry) => [entry.value, entry.fontFamily]),
)

/**
 * Google Fonts stylesheet URL for the given font values (catalog entries only;
 * system stacks and custom stacks are skipped). Returns null when nothing needs loading.
 */
export function buildGoogleFontsHref(values: Array<string | null | undefined>): string | null {
  const families = [...new Set(values.map((value) => getFontCatalogEntry(value)).filter(Boolean))]
    .filter((entry): entry is FontCatalogEntry => Boolean(entry?.googleWeights))
    .map(
      (entry) =>
        `family=${encodeURIComponent(entry.value).replace(/%20/g, '+')}:wght@${entry.googleWeights}`,
    )
  if (families.length === 0) return null
  return `https://fonts.googleapis.com/css2?${families.join('&')}&display=swap`
}

/** Payload endpoints (under `routes.api`) that serve the catalog fonts from the site's own origin. */
export const THEME_FONTS_CSS_PATH = '/theme-fonts/css'
export const THEME_FONTS_FILE_PATH = '/theme-fonts/file'

/** Catalog font values hosted by Google, de-duplicated and sorted (stable cache key). */
export function parseFontFamilies(raw: string | null | undefined): string[] {
  if (!raw) return []
  const values = raw
    .split(',')
    .map((value) => getFontCatalogEntry(value.trim()))
    .filter((entry): entry is FontCatalogEntry => Boolean(entry?.googleWeights))
    .map((entry) => entry.value)
  return [...new Set(values)].sort()
}

export type ThemeFontLoading = 'self-hosted' | 'google' | 'none'

/**
 * Stylesheet URL that loads the given fonts.
 *
 * - `self-hosted` (default): same-origin URL served by the plugin's font
 *   endpoints; the visitor's browser never contacts Google (GDPR-friendly).
 * - `google`: the Google Fonts CDN directly.
 * - `none`: nothing; the site loads the faces itself (e.g. `next/font`).
 */
export function buildThemeFontsHref(
  values: Array<string | null | undefined>,
  options: { mode?: ThemeFontLoading; apiRoute?: string } = {},
): string | null {
  const { mode = 'self-hosted', apiRoute = '/api' } = options
  if (mode === 'none') return null
  const families = parseFontFamilies(values.filter(Boolean).join(','))
  if (families.length === 0) return null
  if (mode === 'google') return buildGoogleFontsHref(families)
  return `${apiRoute}${THEME_FONTS_CSS_PATH}?f=${families.map(encodeURIComponent).join(',')}`
}
