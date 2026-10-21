import type { Field } from 'payload'
import { buildThemeFontsHref, parseFontFamilies } from '../../src/constants/themeFonts'
import { rewriteFontUrls } from '../../src/endpoints/themeFonts'
import { createThemeConfigurationField } from '../../src/fields/themeConfigurationField'
import { allStylePresets } from '../../src/style-presets'
import { resolveThemeConfiguration } from '../../src/utils/resolveThemeConfiguration'
import { generateThemeCSS } from '../../src/utils/themeUtils'

type SelectLike = { name?: string; type?: string; options?: Array<{ value: string } | string> }

/** Collect every select field's allowed values, keyed by its path inside themeConfiguration. */
function collectSelectOptions(fields: Field[], prefix = ''): Map<string, Set<string>> {
  const result = new Map<string, Set<string>>()
  for (const field of fields as Array<SelectLike & { fields?: Field[] }>) {
    const path = field.name ? `${prefix}${field.name}` : prefix.replace(/\.$/, '')
    if (field.type === 'select' && field.name) {
      result.set(
        path,
        new Set((field.options ?? []).map((o) => (typeof o === 'string' ? o : o.value))),
      )
    }
    if (field.fields) {
      const nested = collectSelectOptions(
        field.fields,
        field.name && field.type === 'group' ? `${path}.` : prefix,
      )
      nested.forEach((value, key) => result.set(key, value))
    }
  }
  return result
}

const tab = createThemeConfigurationField({
  themePresets: [],
  defaultTheme: 'cool',
  includeColorModeToggle: true,
  includeCustomCSS: true,
  includeBrandIdentity: false,
})
const group = (tab.fields[0] as { fields: Field[] }).fields
const options = collectSelectOptions(group)

describe('style presets', () => {
  it('only write values the admin fields accept (otherwise Save fails)', () => {
    const problems: string[] = []
    const check = (preset: string, path: string, value: unknown) => {
      if (value === undefined) return
      const allowed = options.get(path)
      if (!allowed) problems.push(`${preset}: no select field "${path}"`)
      else if (!allowed.has(String(value))) problems.push(`${preset}: ${path}="${value}"`)
    }

    for (const preset of allStylePresets) {
      check(preset.name, 'borderRadius', preset.borderRadius)
      check(preset.name, 'spacing', preset.spacing)
      check(preset.name, 'animationLevel', preset.animationLevel)
      Object.entries(preset.typography ?? {}).forEach(([key, value]) =>
        check(preset.name, `typography.${key}`, value),
      )
      Object.entries(preset.visualEffects ?? {}).forEach(([key, value]) => {
        if (key !== 'glassOpacity') check(preset.name, `visualEffects.${key}`, value)
      })
      Object.entries(preset.componentStyles ?? {}).forEach(([key, value]) =>
        check(preset.name, `componentStyles.${key}`, value),
      )
    }

    expect(problems).toEqual([])
  })

  it('produce distinct looks', () => {
    const signatures = allStylePresets.map((preset) =>
      JSON.stringify([preset.typography, preset.componentStyles, preset.visualEffects]),
    )
    expect(new Set(signatures).size).toBe(allStylePresets.length)
  })
})

describe('typography output', () => {
  it('turns a stored font choice into CSS the site uses', () => {
    const resolved = resolveThemeConfiguration({
      theme: 'cool',
      spacing: 'comfortable',
      typography: {
        bodyFont: 'Lora',
        headingFont: 'Playfair Display',
        baseFontSize: '18',
        headingWeight: '800',
        letterSpacing: 'wider',
      },
    })

    expect(resolved.spacing).toBe('spacious')
    expect(resolved.typography?.baseFontSize).toBe('18px')
    expect(resolved.typography?.fontFamily).toContain('"Lora"')
    expect(resolved.fontSelections).toEqual(['Lora', 'Playfair Display'])

    const css = generateThemeCSS(resolved)
    expect(css).toContain('--typography-headingWeight: 800;')
    expect(css).toContain('--typography-headingTransform: uppercase;')
    expect(css).toContain(':where(html[data-theme]) :where(h1, h2, h3, h4, h5, h6)')
  })

  it('leaves untouched sites unchanged (no base rules, no extra border rule)', () => {
    const css = generateThemeCSS(
      resolveThemeConfiguration({
        theme: 'cool',
        typography: { bodyFont: 'preset', headingFont: 'preset', baseFontSize: 'preset' },
        visualEffects: { borderStyle: 'solid', borderWidth: '1px' },
      }),
    )
    expect(css).not.toContain(':where(html[data-theme])')
    expect(css).not.toContain('html[data-border-style] [data-card]')
  })

  it('maps legacy style-preset values onto current options', () => {
    const { normalizeStylePresetValue } = jest.requireActual('../../src/style-presets')
    expect(normalizeStylePresetValue('spacing', 'spacious')).toBe('comfortable')
    expect(normalizeStylePresetValue('typography.baseFontSize', 'large')).toBe('18')
    expect(normalizeStylePresetValue('typography.bodyFont', 'Source Sans Pro')).toBe('Source Sans 3')
    expect(normalizeStylePresetValue('typography.bodyFont', 'Lora')).toBe('Lora')
  })

  it('is idempotent when given an already-resolved configuration', () => {
    const once = resolveThemeConfiguration({ theme: 'cool', typography: { bodyFont: 'Lora' } })
    const twice = resolveThemeConfiguration(once)
    expect(twice.typography).toEqual(once.typography)
    expect(twice.fontSelections).toEqual(['Lora'])
    expect(twice.typographyOverridden).toBe(true)
  })
})

describe('self-hosted fonts', () => {
  it('builds a same-origin stylesheet URL for catalog fonts only', () => {
    expect(buildThemeFontsHref(['Lora', 'preset', 'helvetica', 'Nope', 'Inter'])).toBe(
      '/api/theme-fonts/css?f=Inter,Lora',
    )
    expect(buildThemeFontsHref(['Lora'], { mode: 'none' })).toBeNull()
    expect(buildThemeFontsHref(['Lora'], { mode: 'google' })).toContain('fonts.googleapis.com')
    expect(parseFontFamilies('Source Sans Pro, Lora, Lora')).toEqual(['Lora', 'Source Sans 3'])
  })

  it('rewrites gstatic font URLs and leaves anything else alone', () => {
    const css =
      'src: url(https://fonts.gstatic.com/s/lora/v35/abc-DEF_1.woff2) format("woff2");' +
      'src: url(https://fonts.gstatic.com/../evil.woff2);'
    const out = rewriteFontUrls(css, '/api/theme-fonts/file')
    expect(out).toContain('url(/api/theme-fonts/file?p=s%2Flora%2Fv35%2Fabc-DEF_1.woff2)')
    expect(out).toContain('https://fonts.gstatic.com/../evil.woff2')
  })
})
