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
    themePresets: string
    choosePreset: string
    presetCount: string
    mutedSample: string
    accentSample: string
    headingSample: string
    bodySample: string
    bodyFontLabel: string
    headingFontLabel: string
    baseSizeLabel: string
    lineHeightLabel: string
    selectThemeError: string
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
    seedLabel: string
    useColor: string
    imageError: string
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
    copyFailed: string
  }
  colorPicker: {
    openPicker: string
    close: string
    title: string
    quickColors: string
    placeholder: string
    contrast: string
    onWhite: string
    onBlack: string
    selectColor: string
    levelAA: string
    levelAALarge: string
    levelLow: string
    pairContrast: string
    pairContrastTitle: string
    presetsTitle: string
    themeColors: string
    commonColors: string
    neutralTones: string
    customColor: string
    formats: string
    currentColor: string
  }
  appearance: {
    locksLabel: string
    locksHint: string
    colors: string
    fonts: string
    style: string
    lockedState: string
    unlockedState: string
    applied: string
    undo: string
    undone: string
    dismiss: string
    colorsLocked: string
    styleLocked: string
    generatedPalette: string
  }
  presetImport: {
    none: string
    summary: string
    importButton: string
    clearButton: string
    drawerTitle: string
    drawerIntro: string
    uploadButton: string
    applyButton: string
    cleared: string
    imported: string
    invalid: string
    readError: string
    textareaLabel: string
  }
  fontGuide: {
    usageTitle: string
    usageIntro: string
    optionNextFont: string
    optionCssLink: string
    strategyTitle: string
    preImportedTitle: string
    preImportedCopy: string
    dynamicTitle: string
    dynamicCopy: string
    exampleTitle: string
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
    chips: {
      effect: string
      shadow: string
      card: string
      hover: string
      button: string
      navbar: string
      footer: string
      link: string
      image: string
      radius: string
    }
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
      clearSelection: 'Unselect style (settings stay as they are)',
      selectedColor: 'Selected color:',
      themePresets: 'Theme presets',
      choosePreset: 'Choose a preset',
      presetCount: 'presets',
      mutedSample: 'Muted surface',
      accentSample: 'Accent tag',
      headingSample: 'Heading preview',
      bodySample: 'Sphinx of black quartz, judge my vow. The quick brown fox jumps over the lazy dog.',
      bodyFontLabel: 'Body',
      headingFontLabel: 'Headings',
      baseSizeLabel: 'Base size',
      lineHeightLabel: 'Line height',
      selectThemeError: 'Select a theme',
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
      pick: 'Pick a colour from the logo, then click Generate palette:',
      hint: 'Overwrites light & dark mode colours.',
      seedLabel: 'Brand colour',
      useColor: 'Use colour',
      imageError: 'This image could not be read. Try a PNG, JPG or SVG file.',
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
      copyFailed: 'Copy failed. Download the file instead.',
    },
    colorPicker: {
      openPicker: 'Open colour picker',
      close: 'Close colour picker',
      title: 'Colour picker',
      quickColors: 'Quick colours',
      placeholder: 'oklch(…) or #hex',
      contrast: 'WCAG contrast',
      onWhite: 'on white',
      onBlack: 'on black',
      selectColor: 'Use colour',
      levelAA: 'AA',
      levelAALarge: 'AA large text',
      levelLow: 'Low',
      pairContrast: 'Text contrast',
      pairContrastTitle: 'Contrast between {foreground} and {background}',
      presetsTitle: 'Colour presets',
      themeColors: 'Theme colours',
      commonColors: 'Common colours',
      neutralTones: 'Neutral tones',
      customColor: 'Custom colour',
      formats: 'Accepts HEX, RGB, HSL, OKLCH or a CSS variable.',
      currentColor: 'Current colour',
    },
    appearance: {
      locksLabel: 'Keep my',
      locksHint: 'Locked parts stay as they are when you pick a theme, a style or generate a palette.',
      colors: 'Colours',
      fonts: 'Fonts',
      style: 'Style',
      lockedState: 'locked',
      unlockedState: 'unlocked',
      applied: 'Applied: {name}',
      undo: 'Undo',
      undone: 'Change reverted',
      dismiss: 'Dismiss',
      colorsLocked: 'Colours are locked. Unlock them to generate a palette.',
      styleLocked: 'Style and fonts are locked. Unlock one of them to apply a style.',
      generatedPalette: 'generated palette',
    },
    presetImport: {
      none: 'No custom presets imported yet',
      summary: 'Imported presets ({count}): {names}',
      importButton: 'Import presets',
      clearButton: 'Remove imported presets',
      drawerTitle: 'Import theme presets',
      drawerIntro:
        'Paste JSON or upload a .json file with preset definitions. Imported presets appear in Theme selection straight away.',
      uploadButton: 'Upload JSON file',
      applyButton: 'Import',
      cleared: 'Imported presets removed',
      imported: 'Imported presets: {count}',
      invalid: 'No valid presets found. Each entry needs at least a "name" and a "label".',
      readError: 'The file could not be read: {message}',
      textareaLabel: 'Preset JSON',
    },
    fontGuide: {
      usageTitle: 'How to use the selected font',
      usageIntro:
        'After you pick a font, your website’s frontend has to load it. A developer can use either of these approaches:',
      optionNextFont: 'Option 1: next/font/google (recommended)',
      optionCssLink: 'Option 2: Google Fonts CSS link',
      strategyTitle: 'Font loading strategy',
      preImportedTitle: 'Pre-imported fonts (optimised)',
      preImportedCopy:
        'These 8 popular fonts are pre-optimised through next/font/google, so they load with no extra runtime request:',
      dynamicTitle: 'Dynamic fonts (Google Fonts CSS)',
      dynamicCopy:
        'Any other font is loaded at runtime through a Google Fonts CSS link. This gives access to 1400+ fonts at the cost of an extra request.',
      exampleTitle: 'Implementation example',
    },
    appearancePreview: {
      title: 'Live preview',
      subtitle: 'Colours, fonts and component styles together, updated as you edit.',
      light: 'Light',
      dark: 'Dark',
      heading: 'Sample heading',
      body: 'The quick brown fox jumps over the lazy dog. Here is an ',
      link: 'inline link',
      primary: 'Primary',
      secondary: 'Secondary',
      footer: 'Footer',
      viewport: 'Device preview',
      chips: {
        effect: 'Effect',
        shadow: 'Shadow',
        card: 'Card',
        hover: 'Hover',
        button: 'Button',
        navbar: 'Navbar',
        footer: 'Footer',
        link: 'Links',
        image: 'Images',
        radius: 'Corners',
      },
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
      clearSelection: 'Zrušit výběr stylu (nastavení zůstane)',
      selectedColor: 'Vybraná barva:',
      themePresets: 'Motivy',
      choosePreset: 'Vyberte motiv',
      presetCount: 'motivů',
      mutedSample: 'Tlumená plocha',
      accentSample: 'Akcentový štítek',
      headingSample: 'Ukázka nadpisu',
      bodySample: 'Příliš žluťoučký kůň úpěl ďábelské ódy. Nechť již hříšné saxofony ďáblů rozezvučí síň.',
      bodyFontLabel: 'Text',
      headingFontLabel: 'Nadpisy',
      baseSizeLabel: 'Základní velikost',
      lineHeightLabel: 'Výška řádku',
      selectThemeError: 'Vyberte motiv',
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
      pick: 'Vyberte barvu z loga a pak klikněte na Vygenerovat paletu:',
      hint: 'Přepíše barvy ve světlém i tmavém režimu.',
      seedLabel: 'Barva značky',
      useColor: 'Použít barvu',
      imageError: 'Obrázek se nepodařilo načíst. Zkuste soubor PNG, JPG nebo SVG.',
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
      title: 'Export motivu',
      subtitle: 'Stáhněte barvy jako design tokeny nebo konfiguraci pro Tailwind.',
      designTokens: 'Design tokeny (JSON)',
      tailwindV4: 'Tailwind v4 (@theme)',
      tailwindV3: 'Tailwind v3 konfigurace',
      copyV4: 'Kopírovat v4',
      copied: 'Zkopírováno!',
      copyFailed: 'Kopírování selhalo. Stáhněte si raději soubor.',
    },
    colorPicker: {
      openPicker: 'Otevřít výběr barvy',
      close: 'Zavřít výběr barvy',
      title: 'Výběr barvy',
      quickColors: 'Rychlé barvy',
      placeholder: 'oklch(…) nebo #hex',
      contrast: 'WCAG kontrast',
      onWhite: 'na bílé',
      onBlack: 'na černé',
      selectColor: 'Použít barvu',
      levelAA: 'AA',
      levelAALarge: 'AA velký text',
      levelLow: 'Nízký',
      pairContrast: 'Kontrast textu',
      pairContrastTitle: 'Kontrast mezi {foreground} a {background}',
      presetsTitle: 'Předvolby barev',
      themeColors: 'Barvy motivu',
      commonColors: 'Běžné barvy',
      neutralTones: 'Neutrální odstíny',
      customColor: 'Vlastní barva',
      formats: 'Přijímá HEX, RGB, HSL, OKLCH nebo CSS proměnnou.',
      currentColor: 'Aktuální barva',
    },
    appearance: {
      locksLabel: 'Ponechat moje',
      locksHint: 'Zamčené části zůstanou beze změny, když vyberete motiv, styl nebo vygenerujete paletu.',
      colors: 'Barvy',
      fonts: 'Písma',
      style: 'Styl',
      lockedState: 'zamčeno',
      unlockedState: 'odemčeno',
      applied: 'Použito: {name}',
      undo: 'Zpět',
      undone: 'Změna vrácena',
      dismiss: 'Zavřít',
      colorsLocked: 'Barvy jsou zamčené. Pro vygenerování palety je odemkněte.',
      styleLocked: 'Styl i písma jsou zamčené. Pro použití stylu jedno z nich odemkněte.',
      generatedPalette: 'vygenerovaná paleta',
    },
    presetImport: {
      none: 'Zatím nejsou importované žádné vlastní motivy',
      summary: 'Importované motivy ({count}): {names}',
      importButton: 'Importovat motivy',
      clearButton: 'Odebrat importované motivy',
      drawerTitle: 'Import motivů',
      drawerIntro:
        'Vložte JSON nebo nahrajte soubor .json s definicemi motivů. Importované motivy se hned objeví ve výběru motivu.',
      uploadButton: 'Nahrát soubor JSON',
      applyButton: 'Importovat',
      cleared: 'Importované motivy odebrány',
      imported: 'Importované motivy: {count}',
      invalid: 'Nenašel se žádný platný motiv. Každá položka potřebuje alespoň „name“ a „label“.',
      readError: 'Soubor se nepodařilo načíst: {message}',
      textareaLabel: 'JSON s motivy',
    },
    fontGuide: {
      usageTitle: 'Jak použít vybrané písmo',
      usageIntro:
        'Po výběru písma ho musí web ve frontendu načíst. Vývojář může použít jeden z těchto postupů:',
      optionNextFont: 'Možnost 1: next/font/google (doporučeno)',
      optionCssLink: 'Možnost 2: odkaz na CSS Google Fonts',
      strategyTitle: 'Strategie načítání písem',
      preImportedTitle: 'Předem importovaná písma (optimalizovaná)',
      preImportedCopy:
        'Těchto 8 oblíbených písem je předem optimalizovaných přes next/font/google, takže se načtou bez dalšího požadavku:',
      dynamicTitle: 'Dynamická písma (Google Fonts CSS)',
      dynamicCopy:
        'Ostatní písma se načítají za běhu přes odkaz na CSS Google Fonts. Získáte tak přístup k více než 1400 písmům za cenu dalšího požadavku.',
      exampleTitle: 'Ukázka implementace',
    },
    appearancePreview: {
      title: 'Živý náhled',
      subtitle: 'Barvy, písma a styly komponent pohromadě, mění se hned při úpravách.',
      light: 'Světlý',
      dark: 'Tmavý',
      heading: 'Ukázkový nadpis',
      body: 'Příliš žluťoučký kůň úpěl ďábelské ódy. Tady je ',
      link: 'odkaz',
      primary: 'Primární',
      secondary: 'Sekundární',
      footer: 'Patička',
      viewport: 'Náhled zařízení',
      chips: {
        effect: 'Efekt',
        shadow: 'Stín',
        card: 'Karta',
        hover: 'Hover',
        button: 'Tlačítko',
        navbar: 'Navigace',
        footer: 'Patička',
        link: 'Odkazy',
        image: 'Obrázky',
        radius: 'Rohy',
      },
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
