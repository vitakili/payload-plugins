import type { Config } from 'payload'
import {
  THEME_MANAGEMENT_I18N_NAMESPACE,
  availableLanguages,
  deepMerge,
  getTranslations,
  registerTranslations,
  type DeepPartial,
  type PluginTranslations,
} from './translations.js'

/**
 * Additional or overriding translations, keyed by language code.
 * Each entry is deep-merged over the built-in English/Czech translations, so you
 * only need to provide the keys you want to add or change.
 */
export type ThemeManagementI18nTranslations = Record<string, DeepPartial<PluginTranslations>>

export interface ThemeManagementI18nOptions {
  /**
   * Extra languages or per-key overrides for the plugin admin UI strings.
   *
   * @example
   * i18n: {
   *   translations: {
   *     de: { tabLabel: 'Darstellung', ui: { lightMode: 'Heller Modus' } },
   *     en: { tabLabel: 'Theme' }, // override a built-in string
   *   },
   * }
   */
  translations?: ThemeManagementI18nTranslations
  /**
   * Pass-through to `config.i18n.supportedLanguages`. Provide language objects from
   * `@payloadcms/translations/languages/*` when you want the Payload admin to offer a
   * brand-new admin language (beyond the project defaults).
   *
   * @example
   * import { de } from '@payloadcms/translations/languages/de'
   * i18n: { supportedLanguages: { de } }
   */
  supportedLanguages?: Record<string, unknown>
}

type PayloadTranslationsByLang = Record<string, Record<string, unknown>>

/**
 * Build the plugin's translations in Payload's native `config.i18n.translations`
 * shape: `{ [lang]: { 'theme-management': { ...keys } } }`.
 *
 * Every language is filled out via `getTranslations`, so English acts as the
 * fallback for any missing key in another language.
 */
export function getThemeManagementI18nTranslations(): PayloadTranslationsByLang {
  const out: PayloadTranslationsByLang = {}
  for (const lang of availableLanguages()) {
    out[lang] = { [THEME_MANAGEMENT_I18N_NAMESPACE]: getTranslations(lang) }
  }
  return out
}

/**
 * Merge the plugin's translations into an existing `config.i18n`, following the
 * official Payload plugin i18n pattern. Translations already present on the
 * incoming config win over the plugin defaults, so apps can freely override.
 *
 * Any `options.translations` are registered first so they participate in the
 * merge (and are visible to `getTranslations` at runtime), and any
 * `options.supportedLanguages` are passed straight through.
 */
export function mergeThemeManagementI18n(
  existing: Config['i18n'],
  options?: ThemeManagementI18nOptions,
): NonNullable<Config['i18n']> {
  if (options?.translations) {
    registerTranslations(options.translations)
  }

  const pluginTranslations = getThemeManagementI18nTranslations()
  const existingTranslations = (existing?.translations ?? {}) as PayloadTranslationsByLang

  // Start from existing translations to preserve every other namespace/language,
  // then layer the plugin namespace underneath the app's own values.
  const mergedTranslations: PayloadTranslationsByLang = { ...existingTranslations }
  for (const lang of Object.keys(pluginTranslations)) {
    mergedTranslations[lang] = deepMerge(
      pluginTranslations[lang] as Record<string, unknown>,
      (existingTranslations[lang] ?? {}) as Record<string, unknown>,
    )
  }

  const merged = {
    ...(existing ?? {}),
    translations: mergedTranslations,
  } as NonNullable<Config['i18n']>

  if (options?.supportedLanguages) {
    ;(merged as { supportedLanguages?: Record<string, unknown> }).supportedLanguages = {
      ...((existing as { supportedLanguages?: Record<string, unknown> } | undefined)
        ?.supportedLanguages ?? {}),
      ...options.supportedLanguages,
    }
  }

  return merged
}
