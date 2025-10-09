import type { Field } from 'payload'
import { extendedThemePresets } from '../extended-presets.js'

/**
 * Extended Theme Configuration Fields
 * Provides advanced color token configuration using OKLCH format
 * Compatible with shadcn/ui and TweakCN theme editors
 */

const extendedThemeOptions = Object.values(extendedThemePresets).map((preset) => ({
  label: preset.label,
  value: preset.value,
}))

/**
 * Creates OKLCH color input field
 */
function createOKLCHColorField(
  name: string,
  label: { en: string; cs: string },
  description?: { en: string; cs: string },
): Field {
  return {
    name,
    type: 'text',
    label,
    admin: {
      description,
      placeholder: 'oklch(0.5 0.2 250)',
      components: {
        Field: '@kilivi/payloadcms-theme-management/fields/ThemeColorPickerField',
      },
    },
  }
}

/**
 * Extended Theme Color Fields for Light Mode
 */
export const extendedLightModeFields: Field[] = [
  createOKLCHColorField(
    'background',
    { en: 'Background', cs: 'Pozadí' },
    { en: 'Main background color', cs: 'Hlavní barva pozadí' },
  ),
  createOKLCHColorField(
    'foreground',
    { en: 'Foreground', cs: 'Popředí' },
    { en: 'Main text color', cs: 'Hlavní barva textu' },
  ),
  createOKLCHColorField(
    'card',
    { en: 'Card', cs: 'Karta' },
    { en: 'Card background', cs: 'Pozadí karty' },
  ),
  createOKLCHColorField(
    'cardForeground',
    { en: 'Card Foreground', cs: 'Popředí karty' },
    { en: 'Card text color', cs: 'Barva textu karty' },
  ),
  createOKLCHColorField(
    'popover',
    { en: 'Popover', cs: 'Vyskakovací okno' },
    { en: 'Popover background', cs: 'Pozadí vyskakovacího okna' },
  ),
  createOKLCHColorField(
    'popoverForeground',
    { en: 'Popover Foreground', cs: 'Popředí vyskakovacího okna' },
    { en: 'Popover text color', cs: 'Barva textu vyskakovacího okna' },
  ),
  createOKLCHColorField(
    'primary',
    { en: 'Primary', cs: 'Primární' },
    { en: 'Primary brand color', cs: 'Primární značková barva' },
  ),
  createOKLCHColorField(
    'primaryForeground',
    { en: 'Primary Foreground', cs: 'Popředí primární' },
    { en: 'Text on primary color', cs: 'Text na primární barvě' },
  ),
  createOKLCHColorField(
    'secondary',
    { en: 'Secondary', cs: 'Sekundární' },
    { en: 'Secondary accent color', cs: 'Sekundární akcentová barva' },
  ),
  createOKLCHColorField(
    'secondaryForeground',
    { en: 'Secondary Foreground', cs: 'Popředí sekundární' },
    { en: 'Text on secondary color', cs: 'Text na sekundární barvě' },
  ),
  createOKLCHColorField(
    'muted',
    { en: 'Muted', cs: 'Tlumená' },
    { en: 'Muted background color', cs: 'Tlumená barva pozadí' },
  ),
  createOKLCHColorField(
    'mutedForeground',
    { en: 'Muted Foreground', cs: 'Popředí tlumené' },
    { en: 'Muted text color', cs: 'Tlumená barva textu' },
  ),
  createOKLCHColorField(
    'accent',
    { en: 'Accent', cs: 'Akcentová' },
    { en: 'Accent color', cs: 'Akcentová barva' },
  ),
  createOKLCHColorField(
    'accentForeground',
    { en: 'Accent Foreground', cs: 'Popředí akcentové' },
    { en: 'Text on accent color', cs: 'Text na akcentové barvě' },
  ),
  createOKLCHColorField(
    'destructive',
    { en: 'Destructive', cs: 'Destruktivní' },
    { en: 'Error/danger color', cs: 'Barva chyby/nebezpečí' },
  ),
  createOKLCHColorField(
    'destructiveForeground',
    { en: 'Destructive Foreground', cs: 'Popředí destruktivní' },
    { en: 'Text on destructive color', cs: 'Text na destruktivní barvě' },
  ),
  createOKLCHColorField(
    'border',
    { en: 'Border', cs: 'Okraj' },
    { en: 'Border color', cs: 'Barva okraje' },
  ),
  createOKLCHColorField(
    'input',
    { en: 'Input', cs: 'Vstup' },
    { en: 'Input border color', cs: 'Barva okraje vstupu' },
  ),
  createOKLCHColorField(
    'ring',
    { en: 'Ring', cs: 'Zvýraznění' },
    { en: 'Focus ring color', cs: 'Barva zvýraznění focus' },
  ),
]

/**
 * Chart color fields (for data visualization)
 */
export const chartColorFields: Field[] = [
  createOKLCHColorField(
    'chart1',
    { en: 'Chart Color 1', cs: 'Barva grafu 1' },
    { en: 'First chart color', cs: 'První barva grafu' },
  ),
  createOKLCHColorField(
    'chart2',
    { en: 'Chart Color 2', cs: 'Barva grafu 2' },
    { en: 'Second chart color', cs: 'Druhá barva grafu' },
  ),
  createOKLCHColorField(
    'chart3',
    { en: 'Chart Color 3', cs: 'Barva grafu 3' },
    { en: 'Third chart color', cs: 'Třetí barva grafu' },
  ),
  createOKLCHColorField(
    'chart4',
    { en: 'Chart Color 4', cs: 'Barva grafu 4' },
    { en: 'Fourth chart color', cs: 'Čtvrtá barva grafu' },
  ),
  createOKLCHColorField(
    'chart5',
    { en: 'Chart Color 5', cs: 'Barva grafu 5' },
    { en: 'Fifth chart color', cs: 'Pátá barva grafu' },
  ),
]

/**
 * Extended Theme Selection Field
 */
export const extendedThemeSelectionField: Field = {
  name: 'extendedTheme',
  type: 'select',
  label: {
    en: '🎨 Extended Theme',
    cs: '🎨 Rozšířené téma',
  },
  defaultValue: 'cool-extended',
  options: extendedThemeOptions,
  admin: {
    description: {
      en: 'Select an extended theme with full OKLCH color support. Compatible with shadcn/ui.',
      cs: 'Vyberte rozšířené téma s plnou podporou OKLCH barev. Kompatibilní s shadcn/ui.',
    },
  },
}

/**
 * Extended Light Mode Configuration
 */
export const extendedLightModeField: Field = {
  type: 'collapsible',
  label: {
    en: '☀️ Extended Light Mode',
    cs: '☀️ Rozšířený světlý režim',
  },
  admin: {
    initCollapsed: true,
    description: {
      en: 'Advanced color configuration for light mode using OKLCH format',
      cs: 'Pokročilá konfigurace barev pro světlý režim pomocí formátu OKLCH',
    },
  },
  fields: [
    {
      name: 'extendedLightMode',
      type: 'group',
      fields: extendedLightModeFields,
    },
  ],
}

/**
 * Extended Dark Mode Configuration
 */
export const extendedDarkModeField: Field = {
  type: 'collapsible',
  label: {
    en: '🌙 Extended Dark Mode',
    cs: '🌙 Rozšířený tmavý režim',
  },
  admin: {
    initCollapsed: true,
    description: {
      en: 'Advanced color configuration for dark mode using OKLCH format',
      cs: 'Pokročilá konfigurace barev pro tmavý režim pomocí formátu OKLCH',
    },
  },
  fields: [
    {
      name: 'extendedDarkMode',
      type: 'group',
      fields: extendedLightModeFields, // Same structure, different values
    },
  ],
}

/**
 * Chart Colors Configuration
 */
export const chartColorsField: Field = {
  type: 'collapsible',
  label: {
    en: '📊 Chart Colors',
    cs: '📊 Barvy grafů',
  },
  admin: {
    initCollapsed: true,
    description: {
      en: 'Configure colors for data visualization and charts',
      cs: 'Nakonfigurujte barvy pro vizualizaci dat a grafy',
    },
  },
  fields: [
    {
      name: 'chartColors',
      type: 'group',
      fields: chartColorFields,
    },
  ],
}
