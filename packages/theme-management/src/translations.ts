export type Language = string

/**
 * i18n namespace under which all plugin translations are registered inside
 * Payload's `config.i18n.translations`. Consumers can reference keys via
 * `t('theme-management:...')` and override them by merging into the same namespace.
 */
export const THEME_MANAGEMENT_I18N_NAMESPACE = 'theme-management' as const

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
    showPreview: string
    hidePreview: string
    colorsAndTypography: string
    clearSelection: string
    selectedColor: string
  }
  stylePreset: {
    description: string
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
  paletteGenerator: {
    title: string
    subtitle: string
    generate: string
    fromImage: string
    pick: string
    hint: string
  }
  accessibility: {
    title: string
    subtitle: string
    fix: string
    allGood: string
    noData: string
    pairs: {
      bodyText: string
      mutedText: string
      primaryButton: string
      secondaryButton: string
      accent: string
      cardText: string
      destructive: string
    }
  }
  themeExport: {
    title: string
    subtitle: string
    designTokens: string
    tailwindV4: string
    tailwindV3: string
    copyV4: string
    copied: string
  }
  appearancePreview: {
    title: string
    subtitle: string
    light: string
    dark: string
    heading: string
    body: string
    link: string
    primary: string
    secondary: string
    footer: string
    viewport: string
  }
}

// Mutable translations object to allow runtime registration/extension
const translations: Record<Language, PluginTranslations> = {
  en: {
    tabLabel: 'Appearance Settings',
    standaloneCollectionLabel: 'Appearance Settings',
    livePreview: {
      smallTitle: 'Live Preview',
      largeTitle: 'Live Theme Preview',
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
      showPreview: 'Preview',
      hidePreview: 'Hide preview',
      colorsAndTypography: 'Colours & typography',
      clearSelection: 'Clear selection',
      selectedColor: 'Selected color:',
    },
    stylePreset: {
      description:
        'Pick a visual style — sets effects, shadows and component styles. Colours stay unchanged.',
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
    paletteGenerator: {
      title: 'Palette generator',
      subtitle: 'Builds a complete light & dark palette from one brand colour (or a logo).',
      generate: 'Generate palette',
      fromImage: 'Extract from image',
      pick: 'Pick a colour from the logo:',
      hint: 'Overwrites light & dark mode colours.',
    },
    accessibility: {
      title: 'Accessibility (WCAG contrast)',
      subtitle: 'Readability check of colour pairs in both modes. AA = 4.5:1.',
      fix: 'Fix',
      allGood: 'All pairs pass AA',
      noData: 'No colours to evaluate.',
      pairs: {
        bodyText: 'Body text',
        mutedText: 'Muted text',
        primaryButton: 'Primary button',
        secondaryButton: 'Secondary button',
        accent: 'Accent',
        cardText: 'Card text',
        destructive: 'Destructive',
      },
    },
    themeExport: {
      title: 'Export theme',
      subtitle: 'Download colours as design tokens or Tailwind config.',
      designTokens: 'Design tokens (JSON)',
      tailwindV4: 'Tailwind v4 (@theme)',
      tailwindV3: 'Tailwind v3 config',
      copyV4: 'Copy v4',
      copied: 'Copied!',
    },
    appearancePreview: {
      title: 'Effects & components',
      subtitle:
        'Preview of surfaces, buttons, navbar and footer. Colours & typography are chosen at the theme above.',
      light: 'Light',
      dark: 'Dark',
      heading: 'Sample heading',
      body: 'The quick brown fox jumps over the lazy dog. Here is an ',
      link: 'inline link',
      primary: 'Primary',
      secondary: 'Secondary',
      footer: 'Footer',
      viewport: 'Device preview',
    },
  },
  cs: {
    tabLabel: 'Nastavení vzhledu',
    standaloneCollectionLabel: 'Nastavení vzhledu',
    livePreview: {
      smallTitle: 'Náhled',
      largeTitle: 'Náhled motivu',
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
      showPreview: 'Náhled',
      hidePreview: 'Skrýt náhled',
      colorsAndTypography: 'Barvy & typografie',
      clearSelection: 'Zrušit výběr',
      selectedColor: 'Vybraná barva:',
    },
    stylePreset: {
      description:
        'Vyberte vizuální styl. Nastaví efekty, stíny a styly komponent — barvy zůstanou nezměněny.',
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
    paletteGenerator: {
      title: 'Generátor palety',
      subtitle: 'Z jedné značkové barvy (nebo z loga) vytvoří kompletní světlou i tmavou paletu.',
      generate: 'Vygenerovat paletu',
      fromImage: 'Extrahovat z obrázku',
      pick: 'Vyber barvu z loga:',
      hint: 'Přepíše barvy ve světlém i tmavém režimu.',
    },
    accessibility: {
      title: 'Přístupnost (WCAG kontrast)',
      subtitle: 'Kontrola čitelnosti barevných párů v obou režimech. AA = 4.5:1.',
      fix: 'Opravit',
      allGood: 'Vše vyhovuje AA',
      noData: 'Žádné barvy k vyhodnocení.',
      pairs: {
        bodyText: 'Tělo textu',
        mutedText: 'Tlumený text',
        primaryButton: 'Primární tlačítko',
        secondaryButton: 'Sekundární tlačítko',
        accent: 'Akcent',
        cardText: 'Text karty',
        destructive: 'Destruktivní',
      },
    },
    themeExport: {
      title: 'Export tématu',
      subtitle: 'Stáhni barvy jako design tokeny nebo Tailwind konfiguraci.',
      designTokens: 'Design tokeny (JSON)',
      tailwindV4: 'Tailwind v4 (@theme)',
      tailwindV3: 'Tailwind v3 konfigurace',
      copyV4: 'Kopírovat v4',
      copied: 'Zkopírováno!',
    },
    appearancePreview: {
      title: 'Efekty & komponenty',
      subtitle:
        'Náhled povrchů, tlačítek, navbaru a patičky. Barvy a typografie se vybírají u motivu výše.',
      light: 'Světlý',
      dark: 'Tmavý',
      heading: 'Ukázkový nadpis',
      body: 'Příliš žluťoučký kůň úpěl ďábelské ódy. Tady je ',
      link: 'odkaz',
      primary: 'Primární',
      secondary: 'Sekundární',
      footer: 'Patička',
      viewport: 'Náhled zařízení',
    },
  },
}

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export function deepMerge<T extends object>(base: T, partial: DeepPartial<T>): T {
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
  newTranslations: Record<Language, DeepPartial<PluginTranslations>>,
) {
  for (const lang of Object.keys(newTranslations)) {
    const existing = (translations[lang] as PluginTranslations) || ({} as PluginTranslations)
    translations[lang] = deepMerge(existing, newTranslations[lang])
  }
}

export function availableLanguages() {
  return Object.keys(translations)
}

export { translations }
