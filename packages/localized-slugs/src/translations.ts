export type Language = string

export interface PluginTranslations {
  pluginName: string
  errors: {
    noLocalesProvided: string
  }
  ui?: {
    label?: string
    description?: string
  }
}

const translations: Record<Language, PluginTranslations> = {
  en: {
    pluginName: 'Localized Slugs',
    errors: {
      noLocalesProvided:
        '🌐 Localized Slugs Plugin: No locales provided. Please specify at least one locale.',
    },
    ui: {
      label: 'Localized Slugs',
      description: 'Automatically manages localized slugs and paths',
    },
  },
  cs: {
    pluginName: 'Lokalizované Slugy',
    errors: {
      noLocalesProvided:
        '🌐 Localized Slugs Plugin: Nebyly zadány žádné lokality. Prosím, uveďte alespoň jednu lokalitu.',
    },
    ui: {
      label: 'Lokalizované Slugy',
      description: 'Automaticky spravuje lokalizované slugy a cesty',
    },
  },
}

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

function deepMerge<T extends object>(base: T, partial: DeepPartial<T>): T {
  const out: Record<string, unknown> = { ...(base as Record<string, unknown>) }
  for (const key of Object.keys(partial)) {
    const val = (partial as Record<string, unknown>)[key]
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      const baseVal = (base as Record<string, unknown>)[key] as Record<string, unknown> | undefined
      out[key] = deepMerge(baseVal ?? {}, val as DeepPartial<Record<string, unknown>>) as unknown
    } else {
      out[key] = val
    }
  }
  return out as T
}

export function getTranslations(lang: Language = 'en'): PluginTranslations {
  const en = translations['en']
  if (!lang || lang === 'en') return en
  const localized = (translations[lang] as Partial<PluginTranslations>) || {}
  return deepMerge(en, localized as DeepPartial<PluginTranslations>)
}

export function registerTranslations(
  newTranslations: Record<Language, Partial<PluginTranslations>>,
) {
  for (const lang of Object.keys(newTranslations)) {
    const existing = (translations[lang] as PluginTranslations) || ({} as PluginTranslations)
    translations[lang] = deepMerge(
      existing,
      newTranslations[lang] as DeepPartial<PluginTranslations>,
    )
  }
}

export function availableLanguages() {
  return Object.keys(translations)
}

export { translations }
