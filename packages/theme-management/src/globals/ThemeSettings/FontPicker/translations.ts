export type Language = 'en' | 'cs'

export interface Translations {
  search: string
  category: string
  subset: string
  viewMode: string
  favorites: string
  allCategories: string
  allLanguages: string
  loading: string
  noFonts: string
  loadError: string
  retry: string
  addFavorite: string
  removeFavorite: string
  fontList: string
  previewModes: string
  loadMore: string
  selectFont: string
  previewTabs: {
    typography: string
    blog: string
    landing: string
    ui: string
  }
  categories: {
    all: string
    'sans-serif': string
    serif: string
    display: string
    handwriting: string
    monospace: string
  }
  subsets: {
    all: string
    vietnamese: string
    latin: string
    'latin-ext': string
    cyrillic: string
    'cyrillic-ext': string
    greek: string
    'greek-ext': string
    arabic: string
    hebrew: string
    thai: string
    japanese: string
    korean: string
    chinese: string
  }
  viewModes: {
    row: string
    grid: string
  }
  typography: {
    h1: string
    h2: string
    h3: string
    body: string
    small: string
  }
  blog: {
    title: string
    subtitle: string
    body: string
  }
  landing: {
    hero: string
    subheading: string
    cta: string
  }
  ui: {
    button: string
    input: string
    link: string
  }
}

export const translations: Record<Language, Translations> = {
  en: {
    search: 'Search fonts...',
    category: 'Category',
    subset: 'Language',
    viewMode: 'View',
    favorites: 'Favorites',
    allCategories: 'All Categories',
    allLanguages: 'All Languages',
    loading: 'Loading fonts...',
    noFonts: 'No fonts match these filters',
    loadError: 'Fonts could not be loaded. Check the connection and try again.',
    retry: 'Try again',
    addFavorite: 'Add to favorites',
    removeFavorite: 'Remove from favorites',
    fontList: 'Fonts',
    previewModes: 'Preview mode',
    loadMore: 'Load more',
    selectFont: 'Select Font',
    previewTabs: {
      typography: 'Typography',
      blog: 'Blog Post',
      landing: 'Landing Page',
      ui: 'UI Elements',
    },
    categories: {
      all: 'All',
      'sans-serif': 'Sans Serif',
      serif: 'Serif',
      display: 'Display',
      handwriting: 'Handwriting',
      monospace: 'Monospace',
    },
    subsets: {
      all: 'All Languages',
      vietnamese: '🇻🇳 Vietnamese',
      latin: 'Latin',
      'latin-ext': 'Latin Extended',
      cyrillic: '🇷🇺 Cyrillic',
      'cyrillic-ext': 'Cyrillic Extended',
      greek: '🇬🇷 Greek',
      'greek-ext': 'Greek Extended',
      arabic: '🇸🇦 Arabic',
      hebrew: '🇮🇱 Hebrew',
      thai: '🇹🇭 Thai',
      japanese: '🇯🇵 Japanese',
      korean: '🇰🇷 Korean',
      chinese: '🇨🇳 Chinese',
    },
    viewModes: {
      row: 'Row',
      grid: 'Grid',
    },
    typography: {
      h1: 'The quick brown fox jumps over the lazy dog',
      h2: 'Sphinx of black quartz, judge my vow',
      h3: 'Pack my box with five dozen liquor jugs',
      body: 'The five boxing wizards jump quickly. A mad boxer shot a quick, gloved jab to the jaw of his dizzy opponent.',
      small: 'How vexingly quick daft zebras jump!',
    },
    blog: {
      title: 'The Art of Typography in Modern Web Design',
      subtitle:
        'Typography is one of the most important aspects of web design. It affects readability, user experience, and the overall aesthetic of your website.',
      body: 'Good typography makes reading effortless and enjoyable. It guides the reader through your content, creating hierarchy and emphasis where needed. When choosing fonts for your website, consider not just how they look, but how they perform across different devices and screen sizes.',
    },
    landing: {
      hero: 'Transform Your Digital Experience',
      subheading: 'Create stunning websites with beautiful typography',
      cta: 'Get Started',
    },
    ui: {
      button: 'Click Me',
      input: 'Enter text here...',
      link: 'Learn More →',
    },
  },
  cs: {
    search: 'Hledat fonty...',
    category: 'Kategorie',
    subset: 'Jazyk',
    viewMode: 'Zobrazení',
    favorites: 'Oblíbené',
    allCategories: 'Všechny kategorie',
    allLanguages: 'Všechny jazyky',
    loading: 'Načítání fontů...',
    noFonts: 'Filtrům neodpovídá žádný font',
    loadError: 'Fonty se nepodařilo načíst. Zkontrolujte připojení a zkuste to znovu.',
    retry: 'Zkusit znovu',
    addFavorite: 'Přidat do oblíbených',
    removeFavorite: 'Odebrat z oblíbených',
    fontList: 'Fonty',
    previewModes: 'Režim náhledu',
    loadMore: 'Načíst další',
    selectFont: 'Vybrat font',
    previewTabs: {
      typography: 'Typografie',
      blog: 'Blogový příspěvek',
      landing: 'Landing Page',
      ui: 'UI prvky',
    },
    categories: {
      all: 'Vše',
      'sans-serif': 'Sans Serif',
      serif: 'Serif',
      display: 'Display',
      handwriting: 'Ručně psané',
      monospace: 'Monospace',
    },
    subsets: {
      all: 'Všechny jazyky',
      vietnamese: '🇻🇳 Vietnamština',
      latin: 'Latinka',
      'latin-ext': 'Latinka rozšířená',
      cyrillic: '🇷🇺 Cyrilice',
      'cyrillic-ext': 'Cyrilice rozšířená',
      greek: '🇬🇷 Řečtina',
      'greek-ext': 'Řečtina rozšířená',
      arabic: '🇸🇦 Arabština',
      hebrew: '🇮🇱 Hebrejština',
      thai: '🇹🇭 Thajština',
      japanese: '🇯🇵 Japonština',
      korean: '🇰🇷 Korejština',
      chinese: '🇨🇳 Čínština',
    },
    viewModes: {
      row: 'Řádky',
      grid: 'Mřížka',
    },
    typography: {
      h1: 'Příliš žluťoučký kůň úpěl ďábelské ódy',
      h2: 'Nechť již hříšné saxofony ďáblů rozzvučí síň úděsnými tóny waltzu',
      h3: 'Zvlášť zákeřný učeň s ďolíčky běží podél zóny úlů',
      body: 'Typografie je umění a technika uspořádání písma tak, aby byl text čitelný, srozumitelný a vizuálně přitažlivý. Dobrá typografie vytváří hierarchii a vede čtenáře obsahem přirozeným způsobem.',
      small: 'Dobrá typografie je neviditelná, špatná typografie je nezapomenutelná.',
    },
    blog: {
      title: 'Umění typografie v moderním webdesignu',
      subtitle:
        'Typografie je jedním z nejdůležitějších aspektů webdesignu. Ovlivňuje čitelnost, uživatelskou zkušenost a celkovou estetiku vašich webových stránek.',
      body: 'Dobrá typografie dělá čtení snadným a příjemným. Vede čtenáře vaším obsahem a vytváří hierarchii a důraz tam, kde je to potřeba. Při výběru fontů pro vaše webové stránky zvažte nejen to, jak vypadají, ale také jak fungují na různých zařízeních a velikostech obrazovky.',
    },
    landing: {
      hero: 'Transformujte svůj digitální zážitek',
      subheading: 'Vytvářejte úchvatné webové stránky s krásnou typografií',
      cta: 'Začít',
    },
    ui: {
      button: 'Klikněte sem',
      input: 'Zadejte text...',
      link: 'Zjistit více →',
    },
  },
}

/**
 * Get translations for a specific language
 */
export function getTranslations(lang: Language = 'en'): Translations {
  return translations[lang] || translations.en
}
