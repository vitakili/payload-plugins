import {
  buildGoogleFontsHref,
  parseFontFamilies,
  THEME_FONTS_FILE_PATH,
} from '../constants/themeFonts.js'

/**
 * The `@font-face` rules for a set of catalog fonts, self-hosted and trimmed.
 *
 * Google's stylesheet for two fonts is ~23 KiB: one rule per weight per script
 * (Cyrillic, Greek, Vietnamese …), most of them for scripts a site never
 * renders. This keeps the scripts a site asks for (Latin + Latin Extended by
 * default, which covers Czech, Slovak, Polish, German …), folds a variable
 * font's identical per-weight rules into one rule with a weight range, and
 * points every file at the plugin's own endpoint — about 1–2 KiB, small enough
 * for `ServerThemeInjector` to inline, so there is no stylesheet request for
 * the first paint to wait on.
 *
 * Nothing here runs at build time. The CSS text is cached in memory (a few KiB
 * per font combination); font files are cached on disk by the file endpoint.
 */

export const DEFAULT_FONT_SUBSETS: readonly string[] = ['latin', 'latin-ext']

// A current desktop browser UA makes Google return woff2 with unicode-range subsets.
export const BROWSER_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'

/** Only versioned woff2 files from fonts.gstatic.com are served (no open proxy). */
export const FONT_FILE_PATTERN = /^s\/[a-z0-9]+\/v\d+\/[A-Za-z0-9_\-.]+\.woff2$/

/** Files shipped inside the plugin (`src/fonts`), served by the same endpoint. */
export const BUNDLED_FONT_PATTERN = /^bundled\/([a-z0-9-]+\.woff2)$/

/**
 * Scripts Google serves from an outdated build of a font. Google's Lato is
 * still version 1, whose Latin Extended file has no ě š č ř ž ů ť ď ň — a Czech
 * page set in Lato drew every háček in a fallback font. These replace that one
 * subset with Lato 2.0 (OFL, from the `lato-font` package), cut down to the
 * Central European letters: ~9 KiB per weight, against ~180 KiB for the whole
 * Lato 2.0 file. Sources in `assets/fonts`; regenerate with `scripts/build-bundled-fonts.mjs`.
 */
const BUNDLED_SUBSETS: Record<
  string,
  { subset: string; unicodeRange: string; files: Record<string, string> }
> = {
  Lato: {
    subset: 'latin-ext',
    unicodeRange: 'U+0100-017F, U+0218-021B, U+02C6-02C7, U+02D8-02DD',
    files: {
      '300': 'lato-latin-ext-300.woff2',
      '400': 'lato-latin-ext-400.woff2',
      '700': 'lato-latin-ext-700.woff2',
      '900': 'lato-latin-ext-900.woff2',
    },
  },
}

const bundledFontUrl = (file: string, fileEndpoint: string) =>
  `${fileEndpoint}?p=${encodeURIComponent(`bundled/${file}`)}`

/** Swaps the subsets listed in BUNDLED_SUBSETS for the plugin's own files. */
export function withBundledSubsets(
  faces: CompactFontFace[],
  fileEndpoint: string,
  subsets: readonly string[] = DEFAULT_FONT_SUBSETS,
): CompactFontFace[] {
  return faces.flatMap((face) => {
    const bundled = BUNDLED_SUBSETS[face.family]
    if (!bundled || !subsets.includes(bundled.subset)) return [face]
    if (face.subset === bundled.subset) return []
    // Add the bundled file next to the face it complements, weight for weight.
    const file = face.subset === 'latin' && face.style === 'normal' && bundled.files[face.weight]
    return file
      ? [
          face,
          {
            ...face,
            subset: bundled.subset,
            src: bundledFontUrl(file, fileEndpoint),
            unicodeRange: bundled.unicodeRange,
          },
        ]
      : [face]
  })
}

export interface ParsedFontFace {
  subset: string
  family: string
  style: string
  weight: string
  src: string
  unicodeRange?: string
}

const BLOCK_PATTERN = /\/\*\s*([\w-]+)\s*\*\/\s*@font-face\s*\{([^}]*)\}/g

const declaration = (body: string, name: string): string | undefined =>
  new RegExp(`${name}\\s*:\\s*([^;]+);`).exec(body)?.[1]?.trim()

/** Google's css2 response → one entry per `@font-face`, with the script it covers. */
export function parseGoogleFontFaces(css: string): ParsedFontFace[] {
  const faces: ParsedFontFace[] = []
  for (const [, subset, body] of css.matchAll(BLOCK_PATTERN)) {
    const family = declaration(body!, 'font-family')
    const src = /url\(([^)]+)\)/.exec(declaration(body!, 'src') ?? '')?.[1]
    if (!subset || !family || !src) continue
    faces.push({
      subset,
      family: family.replace(/^['"]|['"]$/g, ''),
      style: declaration(body!, 'font-style') ?? 'normal',
      weight: declaration(body!, 'font-weight') ?? '400',
      src,
      unicodeRange: declaration(body!, 'unicode-range'),
    })
  }
  return faces
}

/** `https://fonts.gstatic.com/s/inter/…woff2` → the plugin's file endpoint (anything else unchanged). */
export const selfHostedFontUrl = (url: string, fileEndpoint: string): string => {
  const path = /^https:\/\/fonts\.gstatic\.com\/(.+)$/.exec(url)?.[1]
  return path && FONT_FILE_PATTERN.test(path) ? `${fileEndpoint}?p=${encodeURIComponent(path)}` : url
}

/** Rewrites fonts.gstatic.com URLs in Google's CSS to the self-hosted file endpoint. */
export function rewriteFontUrls(css: string, fileEndpoint: string): string {
  return css.replace(/https:\/\/fonts\.gstatic\.com\/[^)\s'"]+/g, (match) =>
    selfHostedFontUrl(match, fileEndpoint),
  )
}

export interface CompactFontFace extends Omit<ParsedFontFace, 'weight'> {
  /** `400`, or a range `300 800` when one variable file serves several weights. */
  weight: string
}

/** Keeps the wanted scripts and folds identical files (a variable font's weights) into one rule. */
export function compactFontFaces(
  faces: ParsedFontFace[],
  subsets: readonly string[] = DEFAULT_FONT_SUBSETS,
): CompactFontFace[] {
  const wanted = new Set(subsets)
  const groups = new Map<string, { face: ParsedFontFace; weights: number[] }>()
  for (const face of faces) {
    if (!wanted.has(face.subset)) continue
    const key = [face.family, face.style, face.subset, face.src].join('|')
    const group = groups.get(key) ?? { face, weights: [] }
    group.weights.push(...face.weight.split(/\s+/).map(Number).filter(Number.isFinite))
    groups.set(key, group)
  }
  return [...groups.values()].map(({ face, weights }) => {
    const min = Math.min(...weights)
    const max = Math.max(...weights)
    return { ...face, weight: min === max ? String(min) : `${min} ${max}` }
  })
}

export function renderFontFaces(faces: CompactFontFace[], fileEndpoint: string): string {
  return faces
    .map((face) =>
      [
        '@font-face{',
        `font-family:'${face.family}';`,
        `font-style:${face.style};`,
        `font-weight:${face.weight};`,
        'font-display:swap;',
        `src:url(${selfHostedFontUrl(face.src, fileEndpoint)}) format('woff2');`,
        face.unicodeRange ? `unicode-range:${face.unicodeRange};` : '',
        '}',
      ].join(''),
    )
    .join('\n')
}

export interface ThemeFontFaces {
  /** The `@font-face` rules, ready to inline (empty when nothing loads or Google is unreachable). */
  css: string
  /** Per family, the self-hosted URL of its first-subset file (Latin by default) — the preload candidate. */
  primaryFiles: Record<string, string>
}

export interface LoadThemeFontFacesOptions {
  /** Payload `routes.api` (default `/api`). */
  apiRoute?: string
  /** Google Fonts subsets (scripts) to keep. Default: Latin + Latin Extended. */
  subsets?: readonly string[]
  /** Catalog fonts the site already loads itself. */
  exclude?: Iterable<string>
}

const SUCCESS_TTL_MS = 24 * 60 * 60 * 1000
// A failed fetch is retried after a minute, not on every render.
const FAILURE_TTL_MS = 60 * 1000
const FETCH_TIMEOUT_MS = 2500
const MAX_CACHED = 64

const cache = new Map<string, { value: ThemeFontFaces; expires: number }>()
const EMPTY: ThemeFontFaces = { css: '', primaryFiles: {} }

function remember(key: string, value: ThemeFontFaces, ttl: number) {
  if (cache.size >= MAX_CACHED) {
    const oldest = cache.keys().next().value
    if (oldest !== undefined) cache.delete(oldest)
  }
  cache.set(key, { value, expires: Date.now() + ttl })
}

/**
 * The trimmed, self-hosted `@font-face` CSS for catalog fonts. Never throws:
 * when Google cannot be reached the site renders with its fallback stacks.
 */
export async function loadThemeFontFaces(
  values: ReadonlyArray<string | null | undefined>,
  { apiRoute = '/api', subsets = DEFAULT_FONT_SUBSETS, exclude }: LoadThemeFontFacesOptions = {},
): Promise<ThemeFontFaces> {
  const excluded = new Set(exclude ?? [])
  const families = parseFontFamilies(values.filter(Boolean).join(',')).filter(
    (family) => !excluded.has(family),
  )
  const href = buildGoogleFontsHref(families)
  if (!href) return EMPTY

  const fileEndpoint = `${apiRoute}${THEME_FONTS_FILE_PATH}`
  const key = [families.join(','), subsets.join(','), fileEndpoint].join('|')
  const cached = cache.get(key)
  if (cached && cached.expires > Date.now()) return cached.value

  try {
    const response = await fetch(href, {
      headers: { 'User-Agent': BROWSER_UA },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    })
    if (!response.ok) throw new Error(`Google Fonts responded ${response.status}`)
    const faces = withBundledSubsets(
      compactFontFaces(parseGoogleFontFaces(await response.text()), subsets),
      fileEndpoint,
      subsets,
    )

    const primaryFiles: Record<string, string> = {}
    for (const subset of subsets) {
      for (const face of faces) {
        if (face.subset === subset && !primaryFiles[face.family]) {
          primaryFiles[face.family] = selfHostedFontUrl(face.src, fileEndpoint)
        }
      }
    }

    const value = { css: renderFontFaces(faces, fileEndpoint), primaryFiles }
    remember(key, value, SUCCESS_TTL_MS)
    return value
  } catch (error) {
    console.warn(`Theme Management Plugin: could not load fonts (${families.join(', ')}): ${String(error)}`)
    remember(key, EMPTY, FAILURE_TTL_MS)
    return EMPTY
  }
}

/** Test hook: forget cached stylesheets. */
export function clearThemeFontFacesCache() {
  cache.clear()
}
