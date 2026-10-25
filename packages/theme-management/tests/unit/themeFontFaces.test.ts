import {
  catalogFontsInStack,
  fontFamilyFor,
  normalizeFontStack,
} from '../../src/constants/themeFonts'
import { BUNDLED_FONT_DATA } from '../../src/fonts/bundledFontData'
import {
  BUNDLED_FONT_PATTERN,
  withBundledSubsets,
  clearThemeFontFacesCache,
  compactFontFaces,
  loadThemeFontFaces,
  parseGoogleFontFaces,
  renderFontFaces,
} from '../../src/utils/themeFontFaces'
import { resolveThemeConfiguration } from '../../src/utils/resolveThemeConfiguration'

/** What Google returns for a variable font requested at two weights, trimmed to three scripts. */
const GOOGLE_CSS = `
/* cyrillic */
@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url(https://fonts.gstatic.com/s/inter/v20/cyr.woff2) format('woff2');
  unicode-range: U+0301, U+0400-045F;
}
/* latin-ext */
@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url(https://fonts.gstatic.com/s/inter/v20/ext.woff2) format('woff2');
  unicode-range: U+0100-02BA;
}
/* latin */
@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url(https://fonts.gstatic.com/s/inter/v20/lat.woff2) format('woff2');
  unicode-range: U+0000-00FF;
}
/* latin */
@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url(https://fonts.gstatic.com/s/inter/v20/lat.woff2) format('woff2');
  unicode-range: U+0000-00FF;
}
`

describe('trimmed self-hosted @font-face rules', () => {
  it('keeps Latin + Latin Extended and folds a variable font into one rule per script', () => {
    const faces = compactFontFaces(parseGoogleFontFaces(GOOGLE_CSS))
    expect(faces.map((f) => `${f.subset}:${f.weight}`)).toEqual(['latin-ext:400', 'latin:400 700'])
  })

  it('serves every file from the site, never from Google', () => {
    const css = renderFontFaces(compactFontFaces(parseGoogleFontFaces(GOOGLE_CSS)), '/api/theme-fonts/file')
    expect(css).not.toContain('gstatic')
    expect(css).toContain("src:url(/api/theme-fonts/file?p=s%2Finter%2Fv20%2Flat.woff2) format('woff2')")
    expect(css).toContain('font-weight:400 700;')
    expect(css).toContain('font-display:swap;')
  })

  it('loads once per font set, inlines the rules and names the preload file', async () => {
    clearThemeFontFacesCache()
    const fetchMock = jest.fn().mockResolvedValue({ ok: true, text: async () => GOOGLE_CSS })
    const original = global.fetch
    global.fetch = fetchMock as unknown as typeof fetch
    try {
      const first = await loadThemeFontFaces(['Inter'])
      const second = await loadThemeFontFaces(['Inter'])
      expect(fetchMock).toHaveBeenCalledTimes(1)
      expect(second).toBe(first)
      expect(first.primaryFiles.Inter).toBe('/api/theme-fonts/file?p=s%2Finter%2Fv20%2Flat.woff2')
      // Fonts the site hosts itself, or no catalog font at all: nothing to fetch.
      expect((await loadThemeFontFaces(['Inter'], { exclude: ['Inter'] })).css).toBe('')
      expect((await loadThemeFontFaces(['system-ui', 'custom'])).css).toBe('')
      expect(fetchMock).toHaveBeenCalledTimes(1)
    } finally {
      global.fetch = original
    }
  })

  it('serves Lato’s Central European letters from Lato 2.0, which Google lacks', async () => {
    const lato = GOOGLE_CSS.replace(/Inter/g, 'Lato').replace(/inter/g, 'lato')
    const faces = withBundledSubsets(compactFontFaces(parseGoogleFontFaces(lato)), '/api/theme-fonts/file')
    expect(faces.map((f) => `${f.subset}:${f.weight}:${f.src}`)).toEqual([
      'latin:400 700:https://fonts.gstatic.com/s/lato/v20/lat.woff2',
    ])
    // A weight range is a variable font, which Lato is not: one bundled file per static weight.
    const staticLato = lato.replace(/font-weight: 700;\n  font-display: swap;\n  src: url\(https:\/\/fonts.gstatic.com\/s\/lato\/v20\/lat/, 'font-weight: 700;\n  font-display: swap;\n  src: url(https://fonts.gstatic.com/s/lato/v20/bold')
    const perWeight = withBundledSubsets(compactFontFaces(parseGoogleFontFaces(staticLato)), '/f')
    expect(perWeight.filter((f) => f.subset === 'latin-ext').map((f) => f.src)).toEqual([
      '/f?p=bundled%2Flato-latin-ext-400.woff2',
      '/f?p=bundled%2Flato-latin-ext-700.woff2',
    ])
    expect(BUNDLED_FONT_PATTERN.exec('bundled/lato-latin-ext-400.woff2')?.[1]).toBe('lato-latin-ext-400.woff2')
    expect(BUNDLED_FONT_PATTERN.test('bundled/../secret')).toBe(false)
    expect(Object.keys(BUNDLED_FONT_DATA)).toEqual(
      expect.arrayContaining(perWeight.filter((f) => f.subset === 'latin-ext').map((f) => decodeURIComponent(f.src.split('p=')[1]!).slice(8))),
    )
  })

  it('renders with fallback fonts, never an error, when Google is unreachable', async () => {
    clearThemeFontFacesCache()
    const original = global.fetch
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined)
    global.fetch = jest.fn().mockRejectedValue(new Error('offline')) as unknown as typeof fetch
    try {
      expect(await loadThemeFontFaces(['Lora'])).toEqual({ css: '', primaryFiles: {} })
    } finally {
      global.fetch = original
      warn.mockRestore()
    }
  })
})

describe('font stacks without site-defined variables', () => {
  it('finds the catalog fonts a stack uses, including the Next.js starter variables', () => {
    expect(catalogFontsInStack('var(--font-outfit)')).toEqual(['Outfit'])
    expect(catalogFontsInStack('var(--font-geist-sans)')).toEqual(['Inter'])
    expect(catalogFontsInStack('var(--font-geist-mono)')).toEqual(['JetBrains Mono'])
    expect(catalogFontsInStack(fontFamilyFor('Lora'))).toEqual(['Lora'])
    expect(catalogFontsInStack('"My Brand Font", sans-serif')).toEqual([])
  })

  it('gives a variable-only stack its family name, so it renders without next/font', () => {
    expect(normalizeFontStack('var(--font-outfit)')).toBe(fontFamilyFor('Outfit'))
    expect(normalizeFontStack('var(--font-geist-sans)')).toBe(fontFamilyFor('Inter'))
    // Already complete, or a custom stack: left alone.
    expect(normalizeFontStack(fontFamilyFor('Lora'))).toBe(fontFamilyFor('Lora'))
    expect(normalizeFontStack('"My Brand Font", sans-serif')).toBe('"My Brand Font", sans-serif')
  })

  it('loads the fonts a preset uses, not only the ones an editor picked', () => {
    const resolved = resolveThemeConfiguration({ theme: 'cool' })
    expect(resolved.fontsInUse?.length).toBeGreaterThan(0)
    expect(resolved.typography?.fontFamily).toContain(`"${resolved.fontsInUse?.[0]}"`)

    const picked = resolveThemeConfiguration({
      theme: 'cool',
      typography: { bodyFont: 'Lato', headingFont: 'Playfair Display' },
    })
    expect(picked.fontsInUse).toEqual(['Lato', 'Playfair Display'])
  })
})
