import { describe, expect, it } from '@jest/globals'
import { themeManagementPlugin } from '../../src/index.js'
import {
  getThemeManagementI18nTranslations,
  mergeThemeManagementI18n,
} from '../../src/i18n.js'
import { THEME_MANAGEMENT_I18N_NAMESPACE } from '../../src/translations.js'

const NS = THEME_MANAGEMENT_I18N_NAMESPACE

describe('Theme Management - native Payload i18n', () => {
  it('exposes built-in en + cs translations under the plugin namespace', () => {
    const translations = getThemeManagementI18nTranslations()

    expect(Object.keys(translations)).toEqual(expect.arrayContaining(['en', 'cs']))
    expect((translations.en[NS] as any).tabLabel).toBe('Appearance Settings')
    expect((translations.cs[NS] as any).tabLabel).toBe('Nastavení vzhledu')
  })

  it('merges plugin translations into an existing config.i18n while preserving other namespaces', () => {
    const existing = {
      translations: {
        en: { general: { cancel: 'Cancel' } },
      },
    } as any

    const merged = mergeThemeManagementI18n(existing) as any

    // Existing namespace is preserved
    expect(merged.translations.en.general.cancel).toBe('Cancel')
    // Plugin namespace is added
    expect(merged.translations.en[NS].tabLabel).toBe('Appearance Settings')
    // New language from the plugin is added
    expect(merged.translations.cs[NS].tabLabel).toBe('Nastavení vzhledu')
  })

  it('lets the incoming config override plugin defaults on conflict', () => {
    const existing = {
      translations: {
        en: { [NS]: { tabLabel: 'My Custom Label' } },
      },
    } as any

    const merged = mergeThemeManagementI18n(existing) as any

    expect(merged.translations.en[NS].tabLabel).toBe('My Custom Label')
    // Untouched keys still fall back to the plugin defaults
    expect(merged.translations.en[NS].ui.lightMode).toBe('Light Mode')
  })

  it('passes supportedLanguages through to config.i18n', () => {
    const fakeDe = { __lang: 'de' }
    const merged = mergeThemeManagementI18n(
      { supportedLanguages: { en: { __lang: 'en' } } } as any,
      { supportedLanguages: { de: fakeDe } },
    ) as any

    expect(merged.supportedLanguages.de).toBe(fakeDe)
    expect(merged.supportedLanguages.en).toEqual({ __lang: 'en' })
  })

  it('registers the namespace on config.i18n when the plugin runs', () => {
    const mockConfig: any = {
      collections: [{ slug: 'site-settings', fields: [] }],
      globals: [],
    }

    const result = themeManagementPlugin({ enableLogging: false })(mockConfig) as any

    expect(result.i18n.translations.en[NS].tabLabel).toBe('Appearance Settings')
    expect(result.i18n.translations.cs[NS].tabLabel).toBe('Nastavení vzhledu')
  })

  it('applies the plugin i18n option end-to-end', () => {
    const mockConfig: any = {
      collections: [{ slug: 'site-settings', fields: [] }],
      globals: [],
    }

    const result = themeManagementPlugin({
      enableLogging: false,
      i18n: {
        translations: {
          fr: { tabLabel: 'Apparence' },
        },
      },
    })(mockConfig) as any

    expect(result.i18n.translations.fr[NS].tabLabel).toBe('Apparence')
    // English fallback for untranslated keys in the new language
    expect(result.i18n.translations.fr[NS].ui.darkMode).toBe('Dark Mode')
  })

  // NOTE: kept last — `registerTranslations` mutates the shared runtime registry,
  // so overriding a built-in language here would otherwise leak into other tests.
  it('accepts extra languages and per-key overrides via the i18n option', () => {
    const merged = mergeThemeManagementI18n(undefined, {
      translations: {
        de: { tabLabel: 'Darstellung', ui: { lightMode: 'Heller Modus' } },
        en: { tabLabel: 'Theme' },
      },
    }) as any

    // Brand-new language
    expect(merged.translations.de[NS].tabLabel).toBe('Darstellung')
    expect(merged.translations.de[NS].ui.lightMode).toBe('Heller Modus')
    // Missing keys in the new language fall back to English
    expect(merged.translations.de[NS].ui.darkMode).toBe('Dark Mode')
    // Override of a built-in string
    expect(merged.translations.en[NS].tabLabel).toBe('Theme')
  })
})
