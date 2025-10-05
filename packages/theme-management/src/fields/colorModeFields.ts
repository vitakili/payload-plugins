import type { Field } from 'payload'

const themeColorPickerComponentPath = '@/plugins/theme-management/fields/ThemeColorPickerField'

type LocalizedText = Record<string, string>

const colorFieldKeys = [
  'background',
  'foreground',
  'primary',
  'primaryForeground',
  'card',
  'cardForeground',
  'popover',
  'popoverForeground',
  'secondary',
  'secondaryForeground',
  'muted',
  'mutedForeground',
  'accent',
  'accentForeground',
  'destructive',
  'destructiveForeground',
  'border',
  'input',
  'ring',
] as const

type ColorToken = (typeof colorFieldKeys)[number]

interface ColorFieldDefinition {
  name: ColorToken
  label: LocalizedText
  description: LocalizedText
}

type ColorPalette = Record<ColorToken, string>

const colorFieldDefinitions: ColorFieldDefinition[] = [
  {
    name: 'background',
    label: { en: 'Background', cs: 'Pozadí' },
    description: { en: 'Main background color', cs: 'Hlavní barva pozadí' },
  },
  {
    name: 'foreground',
    label: { en: 'Foreground', cs: 'Popředí' },
    description: { en: 'Main text color', cs: 'Hlavní barva textu' },
  },
  {
    name: 'primary',
    label: { en: 'Primary', cs: 'Primární' },
    description: {
      en: 'Primary brand color for buttons, links',
      cs: 'Primární barva značky pro tlačítka, odkazy',
    },
  },
  {
    name: 'primaryForeground',
    label: { en: 'Primary Foreground', cs: 'Primární popředí' },
    description: {
      en: 'Text color on primary background',
      cs: 'Barva textu na primárním pozadí',
    },
  },
  {
    name: 'card',
    label: { en: 'Card', cs: 'Karta' },
    description: { en: 'Card background color', cs: 'Barva pozadí karty' },
  },
  {
    name: 'cardForeground',
    label: { en: 'Card Foreground', cs: 'Karta popředí' },
    description: {
      en: 'Text color on card background',
      cs: 'Barva textu na pozadí karty',
    },
  },
  {
    name: 'popover',
    label: { en: 'Popover', cs: 'Popover' },
    description: { en: 'Popover background color', cs: 'Barva pozadí popoveru' },
  },
  {
    name: 'popoverForeground',
    label: { en: 'Popover Foreground', cs: 'Popover popředí' },
    description: {
      en: 'Text color on popover background',
      cs: 'Barva textu na pozadí popoveru',
    },
  },
  {
    name: 'secondary',
    label: { en: 'Secondary', cs: 'Sekundární' },
    description: { en: 'Secondary UI elements', cs: 'Sekundární UI prvky' },
  },
  {
    name: 'secondaryForeground',
    label: { en: 'Secondary Foreground', cs: 'Sekundární popředí' },
    description: {
      en: 'Text color on secondary background',
      cs: 'Barva textu na sekundárním pozadí',
    },
  },
  {
    name: 'muted',
    label: { en: 'Muted', cs: 'Ztlumený' },
    description: { en: 'Muted backgrounds', cs: 'Ztlumená pozadí' },
  },
  {
    name: 'mutedForeground',
    label: { en: 'Muted Foreground', cs: 'Ztlumené popředí' },
    description: { en: 'Muted text color', cs: 'Ztlumená barva textu' },
  },
  {
    name: 'accent',
    label: { en: 'Accent', cs: 'Akcent' },
    description: { en: 'Accent color for highlights', cs: 'Akcentová barva pro zvýraznění' },
  },
  {
    name: 'accentForeground',
    label: { en: 'Accent Foreground', cs: 'Akcent popředí' },
    description: {
      en: 'Text color on accent background',
      cs: 'Barva textu na akcentovém pozadí',
    },
  },
  {
    name: 'destructive',
    label: { en: 'Destructive', cs: 'Destruktivní' },
    description: { en: 'Error and destructive actions', cs: 'Chyby a destruktivní akce' },
  },
  {
    name: 'destructiveForeground',
    label: { en: 'Destructive Foreground', cs: 'Destruktivní popředí' },
    description: {
      en: 'Text color on destructive background',
      cs: 'Barva textu na destruktivním pozadí',
    },
  },
  {
    name: 'border',
    label: { en: 'Border', cs: 'Okraj' },
    description: { en: 'Border color', cs: 'Barva okraje' },
  },
  {
    name: 'input',
    label: { en: 'Input', cs: 'Vstup' },
    description: { en: 'Input border color', cs: 'Barva okraje vstupů' },
  },
  {
    name: 'ring',
    label: { en: 'Ring', cs: 'Prstenec' },
    description: { en: 'Focus ring color', cs: 'Barva focus prstence' },
  },
]

// Light Mode Default Colors (Shadcn UI inspired defaults)
export const lightModeDefaults: ColorPalette = {
  background: '#ffffff',
  foreground: '#0a0a0a',
  card: '#ffffff',
  cardForeground: '#0a0a0a',
  popover: '#ffffff',
  popoverForeground: '#0a0a0a',
  primary: '#9372f7',
  primaryForeground: '#fafafa',
  secondary: '#f4f4f5',
  secondaryForeground: '#18181b',
  muted: '#f4f4f5',
  mutedForeground: '#71717a',
  accent: '#f4f4f5',
  accentForeground: '#18181b',
  destructive: '#ef4444',
  destructiveForeground: '#fafafa',
  border: '#e4e4e7',
  input: '#e4e4e7',
  ring: '#18181b',
}

// Dark Mode Default Colors (Shadcn UI inspired defaults)
export const darkModeDefaults: ColorPalette = {
  background: '#0a0a0a',
  foreground: '#fafafa',
  card: '#09090b',
  cardForeground: '#fafafa',
  popover: '#09090b',
  popoverForeground: '#fafafa',
  primary: '#9372f7',
  primaryForeground: '#09090b',
  secondary: '#27272a',
  secondaryForeground: '#fafafa',
  muted: '#27272a',
  mutedForeground: '#a1a1aa',
  accent: '#27272a',
  accentForeground: '#fafafa',
  destructive: '#7f1d1d',
  destructiveForeground: '#fafafa',
  border: '#27272a',
  input: '#27272a',
  ring: '#d4d4d8',
}

function createColorFields(defaults: ColorPalette): Field[] {
  return colorFieldDefinitions.map(({ name, label, description }) => ({
    name,
    type: 'text',
    label,
    defaultValue: defaults[name],
    admin: {
      components: {
        Field: themeColorPickerComponentPath,
      },
      description,
    },
  }))
}

export const lightModeField: Field = {
  type: 'collapsible',
  label: {
    en: '☀️ Light Mode Colors',
    cs: '☀️ Barvy světlého režimu',
  },
  admin: {
    initCollapsed: true,
    description: {
      en: 'Configure colors for light mode',
      cs: 'Nakonfigurujte barvy pro světlý režim',
    },
  },
  fields: [
    {
      name: 'lightMode',
      type: 'group',
      fields: createColorFields(lightModeDefaults),
    },
  ],
}

export const darkModeField: Field = {
  type: 'collapsible',
  label: {
    en: '🌙 Dark Mode Colors',
    cs: '🌙 Barvy tmavého režimu',
  },
  admin: {
    initCollapsed: true,
    description: {
      en: 'Configure colors for dark mode',
      cs: 'Nakonfigurujte barvy pro tmavý režim',
    },
  },
  fields: [
    {
      name: 'darkMode',
      type: 'group',
      fields: createColorFields(darkModeDefaults),
    },
  ],
}
