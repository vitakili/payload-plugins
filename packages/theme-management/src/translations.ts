export type Language = string

export interface PluginTranslations {
  tabLabel: string
  standaloneCollectionLabel: string
  livePreview: {
    smallTitle: string
    largeTitle: string
  }
  ui: {
    primaryAction: string
    secondaryAction: string
    lightMode: string
    darkMode: string
    selectFontPlaceholder: string
    usePreset: string
    specifyCustom: string
    sampleSentence: string
  }
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    foreground: string
    muted: string
    card: string
    popover: string
  }
  preview: {
    siteTitle: string
    nav: {
      home: string
      about: string
      services: string
      contact: string
    }
    welcomeTitle: string
    welcomeCopy: string
    sampleCardTitle: string
    customPalette: string
    footer: string
  }
}

// Mutable translations object to allow runtime registration/extension
const translations: Record<Language, PluginTranslations> = {
  en: {
    tabLabel: '🎨 Appearance Settings',
    standaloneCollectionLabel: 'Appearance Settings',
    livePreview: {
      smallTitle: '🎨 Live Preview',
      largeTitle: '🎨 Live Theme Preview',
    },
    ui: {
      primaryAction: 'Primary Action',
      secondaryAction: 'Secondary',
      lightMode: 'Light Mode',
      darkMode: 'Dark Mode',
      selectFontPlaceholder: 'Select font...',
      usePreset: 'Use theme preset font',
      specifyCustom: 'Specify custom font below',
      sampleSentence: 'The quick brown fox jumps over the lazy dog',
    },
    colors: {
      primary: 'Primary',
      secondary: 'Secondary',
      accent: 'Accent',
      background: 'Background',
      foreground: 'Foreground',
      muted: 'Muted',
      card: 'Card',
      popover: 'Popover',
    },
    preview: {
      siteTitle: 'Your Website',
      nav: {
        home: 'Home',
        about: 'About',
        services: 'Services',
        contact: 'Contact',
      },
      welcomeTitle: 'Welcome to Your Site',
      welcomeCopy:
        'This is how your content will look with the selected theme. The colors and styling will be applied across your entire website.',
      sampleCardTitle: 'Sample Card',
      customPalette: 'Custom palette',
      footer: '© 2025 Your Website. Powered by PayloadCMS.',
    },
  },
  cs: {
    tabLabel: '🎨 Nastavení vzhledu',
    standaloneCollectionLabel: 'Nastavení vzhledu',
    livePreview: {
      smallTitle: '🎨 Náhled',
      largeTitle: '🎨 Náhled motivu',
    },
    ui: {
      primaryAction: 'Primární akce',
      secondaryAction: 'Sekundární',
      lightMode: 'Světlý režim',
      darkMode: 'Tmavý režim',
      selectFontPlaceholder: 'Vyberte písmo...',
      usePreset: 'Použít písmo motivu',
      specifyCustom: 'Zadejte vlastní písmo níže',
      sampleSentence: 'Rychlá hnědá liška přeskočila líného psa',
    },
    colors: {
      primary: 'Primární',
      secondary: 'Sekundární',
      accent: 'Akcent',
      background: 'Pozadí',
      foreground: 'Popředí',
      muted: 'Ztlumený',
      card: 'Karta',
      popover: 'Popover',
    },
    preview: {
      siteTitle: 'Váš web',
      nav: {
        home: 'Domů',
        about: 'O nás',
        services: 'Služby',
        contact: 'Kontakt',
      },
      welcomeTitle: 'Vítejte na svém webu',
      welcomeCopy:
        'Takto bude vypadat váš obsah s vybraným motivem. Barvy a stylování budou aplikovány na celý web.',
      sampleCardTitle: 'Ukázková karta',
      customPalette: 'Vlastní paleta',
      footer: '© 2025 Váš web. Poháněno PayloadCMS.',
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
  // Always merge with English defaults so missing keys fall back
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
