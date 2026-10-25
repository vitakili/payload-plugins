import type { Endpoint, PayloadRequest } from 'payload'
import { THEME_FONTS_CSS_PATH, THEME_FONTS_FILE_PATH } from '../constants/themeFonts.js'
import {
  BROWSER_UA,
  BUNDLED_FONT_PATTERN,
  DEFAULT_FONT_SUBSETS,
  FONT_FILE_PATTERN,
  loadThemeFontFaces,
} from '../utils/themeFontFaces.js'

export { rewriteFontUrls } from '../utils/themeFontFaces.js'

/**
 * Self-hosted theme fonts.
 *
 * The visitor's browser never talks to Google: these endpoints fetch the
 * Google Fonts stylesheet and font files on the server and serve them from the
 * site's own origin (GDPR-friendly). Only fonts from FONT_CATALOG are served,
 * and only versioned woff2 files from fonts.gstatic.com are proxied, so the
 * endpoints cannot be used as an open proxy.
 *
 *   GET {api}/theme-fonts/css?f=Inter,Playfair%20Display  → @font-face CSS
 *   GET {api}/theme-fonts/file?p=s/inter/v19/….woff2      → font file
 *
 * `ServerThemeInjector` inlines the same CSS (see `utils/themeFontFaces`); this
 * endpoint serves it to Live Preview and the admin's font picker.
 *
 * Font files are cached on disk (the OS temp directory), not in memory: a
 * server's memory is what a host bills for, and the files are immutable and
 * cached by browsers and CDNs for a year anyway.
 */

const CSS_HEADERS = {
  'Content-Type': 'text/css; charset=utf-8',
  'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
}

const FILE_HEADERS = {
  'Content-Type': 'font/woff2',
  // gstatic paths are versioned, so a file never changes.
  'Cache-Control': 'public, max-age=31536000, immutable',
  'Access-Control-Allow-Origin': '*',
}

/**
 * Node's file system, taken at runtime. This module is reachable from the
 * package root, which client admin code imports too, so a static `node:fs`
 * import would be bundled for the browser (and fail the build). Without
 * `process.getBuiltinModule` (Node < 20.16) the disk cache is simply skipped.
 */
type DiskCache = {
  read: (fontPath: string) => Promise<Uint8Array<ArrayBuffer>>
  write: (fontPath: string, data: Uint8Array) => Promise<void>
}

const diskCache = (() => {
  let cache: DiskCache | null | undefined
  return (): DiskCache | null => {
    if (cache !== undefined) return cache
    const builtin = (globalThis as { process?: { getBuiltinModule?: (id: string) => unknown } })
      .process?.getBuiltinModule
    const fs = builtin?.('node:fs/promises') as typeof import('node:fs/promises') | undefined
    const os = builtin?.('node:os') as typeof import('node:os') | undefined
    const path = builtin?.('node:path') as typeof import('node:path') | undefined
    if (!fs || !os || !path) return (cache = null)
    const dir = path.join(os.tmpdir(), 'payload-theme-fonts')
    // `s/inter/v20/abc.woff2` → a flat, safe file name in the cache directory.
    const fileOf = (fontPath: string) => path.join(dir, fontPath.replace(/\//g, '__'))
    return (cache = {
      read: async (fontPath) => new Uint8Array(await fs.readFile(fileOf(fontPath))),
      write: async (fontPath, data) => {
        await fs.mkdir(dir, { recursive: true })
        await fs.writeFile(fileOf(fontPath), data)
      },
    })
  }
})()

const apiRouteOf = (req: PayloadRequest) => req.payload?.config?.routes?.api ?? '/api'

const queryValue = (req: PayloadRequest, key: string): string | null => {
  const fromSearchParams = req.searchParams?.get?.(key)
  if (fromSearchParams) return fromSearchParams
  const fromQuery = (req.query as Record<string, unknown> | undefined)?.[key]
  return typeof fromQuery === 'string' ? fromQuery : null
}

const cssEndpoint: Endpoint = {
  path: THEME_FONTS_CSS_PATH,
  method: 'get',
  handler: async (req) => {
    const subsets = queryValue(req, 's')?.split(',').filter(Boolean)
    const { css } = await loadThemeFontFaces([queryValue(req, 'f')], {
      apiRoute: apiRouteOf(req),
      subsets: subsets?.length ? subsets : DEFAULT_FONT_SUBSETS,
    })
    return new Response(css || '/* no fonts */', {
      headers: css ? CSS_HEADERS : { ...CSS_HEADERS, 'Cache-Control': 'no-store' },
    })
  },
}

const fileEndpoint: Endpoint = {
  path: THEME_FONTS_FILE_PATH,
  method: 'get',
  handler: async (req) => {
    const fontPath = queryValue(req, 'p')

    const bundled = fontPath ? BUNDLED_FONT_PATTERN.exec(fontPath)?.[1] : undefined
    if (bundled) {
      // Imported on first use: the bytes stay out of memory until a visitor needs them.
      const { BUNDLED_FONT_DATA } = await import('../fonts/bundledFontData.js')
      const data = BUNDLED_FONT_DATA[bundled]
      if (!data) return new Response('Not found', { status: 404 })
      return new Response(Uint8Array.from(atob(data), (c) => c.charCodeAt(0)), {
        headers: FILE_HEADERS,
      })
    }

    if (!fontPath || !FONT_FILE_PATTERN.test(fontPath)) {
      return new Response('Not found', { status: 404 })
    }

    const disk = diskCache()
    if (disk) {
      try {
        return new Response(await disk.read(fontPath), { headers: FILE_HEADERS })
      } catch {
        // Not cached yet.
      }
    }

    try {
      const upstream = await fetch(`https://fonts.gstatic.com/${fontPath}`, {
        headers: { 'User-Agent': BROWSER_UA },
        signal: AbortSignal.timeout(10_000),
      })
      if (!upstream.ok) return new Response('Not found', { status: 404 })
      const data = new Uint8Array(await upstream.arrayBuffer())
      // Best effort: a read-only file system just means fetching again next time.
      await disk?.write(fontPath, data).catch(() => undefined)
      return new Response(data, { headers: FILE_HEADERS })
    } catch {
      return new Response('Font unavailable', { status: 502 })
    }
  },
}

export const themeFontEndpoints: Endpoint[] = [cssEndpoint, fileEndpoint]
