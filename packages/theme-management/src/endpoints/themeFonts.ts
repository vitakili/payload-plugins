import type { Endpoint, PayloadRequest } from 'payload'
import {
  buildGoogleFontsHref,
  parseFontFamilies,
  THEME_FONTS_CSS_PATH,
  THEME_FONTS_FILE_PATH,
} from '../constants/themeFonts.js'

/**
 * Self-hosted theme fonts.
 *
 * The visitor's browser never talks to Google: these endpoints fetch the
 * Google Fonts stylesheet and font files on the server, cache them in memory and
 * serve them from the site's own origin (GDPR-friendly). Only fonts from
 * FONT_CATALOG are served, and only files from fonts.gstatic.com are proxied, so
 * the endpoints cannot be used as an open proxy.
 *
 *   GET {api}/theme-fonts/css?f=Inter,Playfair%20Display  → @font-face CSS
 *   GET {api}/theme-fonts/file?p=s/inter/v19/….woff2      → font file
 */

// A current desktop browser UA makes Google return woff2 with unicode-range subsets.
const BROWSER_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'
const CSS_TTL_MS = 24 * 60 * 60 * 1000
const MAX_CACHED_FILES = 300
const FONT_FILE_PATTERN = /^s\/[a-z0-9]+\/v\d+\/[A-Za-z0-9_\-.]+\.woff2$/

const cssCache = new Map<string, { css: string; expires: number }>()
const fileCache = new Map<string, ArrayBuffer>()

function rememberFile(key: string, data: ArrayBuffer) {
  if (fileCache.size >= MAX_CACHED_FILES) {
    const oldest = fileCache.keys().next().value
    if (oldest !== undefined) fileCache.delete(oldest)
  }
  fileCache.set(key, data)
}

const apiRouteOf = (req: PayloadRequest) => req.payload?.config?.routes?.api ?? '/api'

const queryValue = (req: PayloadRequest, key: string): string | null => {
  const fromSearchParams = req.searchParams?.get?.(key)
  if (fromSearchParams) return fromSearchParams
  const fromQuery = (req.query as Record<string, unknown> | undefined)?.[key]
  return typeof fromQuery === 'string' ? fromQuery : null
}

/** Rewrites fonts.gstatic.com URLs in Google's CSS to the self-hosted file endpoint. */
export function rewriteFontUrls(css: string, fileEndpoint: string): string {
  return css.replace(/https:\/\/fonts\.gstatic\.com\/([^)\s'"]+)/g, (match, path: string) =>
    FONT_FILE_PATTERN.test(path) ? `${fileEndpoint}?p=${encodeURIComponent(path)}` : match,
  )
}

const cssEndpoint: Endpoint = {
  path: THEME_FONTS_CSS_PATH,
  method: 'get',
  handler: async (req) => {
    const families = parseFontFamilies(queryValue(req, 'f'))
    const href = buildGoogleFontsHref(families)
    if (!href) {
      return new Response('/* no fonts requested */', {
        status: 200,
        headers: { 'Content-Type': 'text/css; charset=utf-8' },
      })
    }

    const cacheKey = families.join(',')
    const cached = cssCache.get(cacheKey)
    if (cached && cached.expires > Date.now()) {
      return new Response(cached.css, {
        headers: {
          'Content-Type': 'text/css; charset=utf-8',
          'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
        },
      })
    }

    try {
      const upstream = await fetch(href, { headers: { 'User-Agent': BROWSER_UA } })
      if (!upstream.ok) throw new Error(`Google Fonts responded ${upstream.status}`)
      const css = rewriteFontUrls(await upstream.text(), `${apiRouteOf(req)}${THEME_FONTS_FILE_PATH}`)
      cssCache.set(cacheKey, { css, expires: Date.now() + CSS_TTL_MS })
      return new Response(css, {
        headers: {
          'Content-Type': 'text/css; charset=utf-8',
          'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
        },
      })
    } catch (error) {
      req.payload?.logger?.warn?.(
        `Theme Management Plugin: could not load fonts (${cacheKey}): ${String(error)}`,
      )
      // Fall back to the CSS font stacks; never break the page over a font.
      return new Response('/* fonts unavailable — falling back to system fonts */', {
        status: 200,
        headers: { 'Content-Type': 'text/css; charset=utf-8', 'Cache-Control': 'no-store' },
      })
    }
  },
}

const fileEndpoint: Endpoint = {
  path: THEME_FONTS_FILE_PATH,
  method: 'get',
  handler: async (req) => {
    const path = queryValue(req, 'p')
    if (!path || !FONT_FILE_PATTERN.test(path)) {
      return new Response('Not found', { status: 404 })
    }

    const headers = {
      'Content-Type': 'font/woff2',
      // gstatic paths are versioned, so a file never changes.
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Access-Control-Allow-Origin': '*',
    }

    const cached = fileCache.get(path)
    if (cached) return new Response(cached, { headers })

    try {
      const upstream = await fetch(`https://fonts.gstatic.com/${path}`, {
        headers: { 'User-Agent': BROWSER_UA },
      })
      if (!upstream.ok) return new Response('Not found', { status: 404 })
      const data = await upstream.arrayBuffer()
      rememberFile(path, data)
      return new Response(data, { headers })
    } catch {
      return new Response('Font unavailable', { status: 502 })
    }
  },
}

export const themeFontEndpoints: Endpoint[] = [cssEndpoint, fileEndpoint]
