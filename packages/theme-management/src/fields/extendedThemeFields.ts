import type { Field } from 'payload'
import { allExtendedThemePresets } from '../extended-presets.js'

/**
 * Extended Theme Configuration Fields
 * Full TweakCN-compatible theme system with:
 * - All shadcn/ui color tokens (19 base + 5 chart = 24 color tokens)
 * - Shadow controls (6 properties)
 * - Font families (3 families: sans, serif, mono)
 * - Advanced typography (letter-spacing, global spacing)
 * - Professional color picker with live preview
 */

const extendedThemeOptions = Object.values(allExtendedThemePresets).map((preset) => {
  const primaryColor = preset.styles.light.primary
  const bgColor = preset.styles.light.background
  
  return {
    label: preset.label,
    value: preset.value,
    // Add visual preview in the dropdown
    __meta: {
      primary: primaryColor,
      background: bgColor,
    },
  }
})

/**
 * Creates professional OKLCH color field with enhanced UI
 */
function createColorField(
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
      placeholder: 'oklch(0.5 0.2 250) or #rgb or hsl(...)',
      components: {
        Field: '@kilivi/payloadcms-theme-management/fields/ThemeColorPickerField',
      },
    },
  }
}

/**
 * Creates text field for non-color values (fonts, shadows, etc.)
 */
function createTextField(
  name: string,
  label: { en: string; cs: string },
  placeholder: string,
  description?: { en: string; cs: string },
): Field {
  return {
    name,
    type: 'text',
    label,
    admin: {
      description,
      placeholder,
    },
  }
}

/**
 * Base Color Tokens (19 tokens)
 * Required for all themes
 */
export const baseColorFields: Field[] = [
  createColorField(
    'background',
    { en: 'Background', cs: 'Pozadí' },
    { en: 'Main page background', cs: 'Hlavní pozadí stránky' },
  ),
  createColorField(
    'foreground',
    { en: 'Foreground', cs: 'Popředí' },
    { en: 'Primary text color', cs: 'Primární barva textu' },
  ),
  createColorField(
    'card',
    { en: 'Card', cs: 'Karta' },
    { en: 'Card background', cs: 'Pozadí karty' },
  ),
  createColorField(
    'cardForeground',
    { en: 'Card Foreground', cs: 'Popředí karty' },
    { en: 'Text on cards', cs: 'Text na kartách' },
  ),
  createColorField(
    'popover',
    { en: 'Popover', cs: 'Vyskakovací okno' },
    { en: 'Popover/dropdown background', cs: 'Pozadí vyskakovacích oken' },
  ),
  createColorField(
    'popoverForeground',
    { en: 'Popover Foreground', cs: 'Popředí vyskakovacího okna' },
    { en: 'Text in popovers', cs: 'Text ve vyskakovacích oknech' },
  ),
  createColorField(
    'primary',
    { en: 'Primary', cs: 'Primární' },
    { en: 'Primary brand color', cs: 'Primární značková barva' },
  ),
  createColorField(
    'primaryForeground',
    { en: 'Primary Foreground', cs: 'Popředí primární' },
    { en: 'Text on primary', cs: 'Text na primární barvě' },
  ),
  createColorField(
    'secondary',
    { en: 'Secondary', cs: 'Sekundární' },
    { en: 'Secondary accent', cs: 'Sekundární akcent' },
  ),
  createColorField(
    'secondaryForeground',
    { en: 'Secondary Foreground', cs: 'Popředí sekundární' },
    { en: 'Text on secondary', cs: 'Text na sekundární' },
  ),
  createColorField(
    'muted',
    { en: 'Muted', cs: 'Tlumená' },
    { en: 'Muted background', cs: 'Tlumené pozadí' },
  ),
  createColorField(
    'mutedForeground',
    { en: 'Muted Foreground', cs: 'Popředí tlumené' },
    { en: 'Muted text', cs: 'Tlumený text' },
  ),
  createColorField(
    'accent',
    { en: 'Accent', cs: 'Akcentová' },
    { en: 'Accent/hover color', cs: 'Akcentová/hover barva' },
  ),
  createColorField(
    'accentForeground',
    { en: 'Accent Foreground', cs: 'Popředí akcentové' },
    { en: 'Text on accent', cs: 'Text na akcentové' },
  ),
  createColorField(
    'destructive',
    { en: 'Destructive', cs: 'Destruktivní' },
    { en: 'Error/danger color', cs: 'Barva chyby/nebezpečí' },
  ),
  createColorField(
    'destructiveForeground',
    { en: 'Destructive Foreground', cs: 'Popředí destruktivní' },
    { en: 'Text on destructive', cs: 'Text na destruktivní' },
  ),
  createColorField(
    'border',
    { en: 'Border', cs: 'Okraj' },
    { en: 'Default border color', cs: 'Výchozí barva okraje' },
  ),
  createColorField(
    'input',
    { en: 'Input', cs: 'Vstupní pole' },
    { en: 'Input border color', cs: 'Barva okraje vstupu' },
  ),
  createColorField(
    'ring',
    { en: 'Ring', cs: 'Zvýraznění' },
    { en: 'Focus ring color', cs: 'Barva zvýraznění focus' },
  ),
]

/**
 * Chart Colors (5 tokens)
 * For data visualization
 */
export const chartColorFields: Field[] = [
  createColorField(
    'chart1',
    { en: 'Chart 1', cs: 'Graf 1' },
    { en: 'First chart color', cs: 'První barva grafu' },
  ),
  createColorField(
    'chart2',
    { en: 'Chart 2', cs: 'Graf 2' },
    { en: 'Second chart color', cs: 'Druhá barva grafu' },
  ),
  createColorField(
    'chart3',
    { en: 'Chart 3', cs: 'Graf 3' },
    { en: 'Third chart color', cs: 'Třetí barva grafu' },
  ),
  createColorField(
    'chart4',
    { en: 'Chart 4', cs: 'Graf 4' },
    { en: 'Fourth chart color', cs: 'Čtvrtá barva grafu' },
  ),
  createColorField(
    'chart5',
    { en: 'Chart 5', cs: 'Graf 5' },
    { en: 'Fifth chart color', cs: 'Pátá barva grafu' },
  ),
]

/**
 * Shadow Controls (6 properties)
 * TweakCN essential feature
 */
export const shadowFields: Field[] = [
  createColorField(
    'shadowColor',
    { en: 'Shadow Color', cs: 'Barva stínu' },
    { en: 'Base shadow color', cs: 'Základní barva stínu' },
  ),
  createTextField(
    'shadowOpacity',
    { en: 'Shadow Opacity', cs: 'Průhlednost stínu' },
    '0.18',
    { en: 'Shadow opacity (0-1)', cs: 'Průhlednost stínu (0-1)' },
  ),
  createTextField(
    'shadowBlur',
    { en: 'Shadow Blur', cs: 'Rozmazání stínu' },
    '2px',
    { en: 'Blur radius', cs: 'Poloměr rozmazání' },
  ),
  createTextField(
    'shadowSpread',
    { en: 'Shadow Spread', cs: 'Rozprostření stínu' },
    '0px',
    { en: 'Spread radius', cs: 'Poloměr rozprostření' },
  ),
  createTextField(
    'shadowOffsetX',
    { en: 'Shadow Offset X', cs: 'Posun stínu X' },
    '0px',
    { en: 'Horizontal offset', cs: 'Horizontální posun' },
  ),
  createTextField(
    'shadowOffsetY',
    { en: 'Shadow Offset Y', cs: 'Posun stínu Y' },
    '1px',
    { en: 'Vertical offset', cs: 'Vertikální posun' },
  ),
]

/**
 * Font Family Configuration (3 families)
 * TweakCN essential feature
 */
export const fontFamilyFields: Field[] = [
  createTextField(
    'fontSans',
    { en: 'Sans-Serif Font', cs: 'Bezpatkové písmo' },
    'Inter, system-ui, sans-serif',
    { en: 'Primary sans-serif font stack', cs: 'Primární bezpatkové písmo' },
  ),
  createTextField(
    'fontSerif',
    { en: 'Serif Font', cs: 'Patkové písmo' },
    'Georgia, serif',
    { en: 'Serif font stack', cs: 'Patkové písmo' },
  ),
  createTextField(
    'fontMono',
    { en: 'Monospace Font', cs: 'Monospace písmo' },
    'JetBrains Mono, monospace',
    { en: 'Monospace font stack', cs: 'Monospace písmo' },
  ),
]

/**
 * Advanced Typography (2 properties)
 */
export const advancedTypographyFields: Field[] = [
  createTextField(
    'letterSpacing',
    { en: 'Letter Spacing', cs: 'Rozestup písmen' },
    '0em',
    { en: 'Global letter spacing', cs: 'Globální rozestup písmen' },
  ),
  createTextField(
    'spacing',
    { en: 'Spacing Scale', cs: 'Škála rozestupů' },
    '0.25rem',
    { en: 'Base spacing unit', cs: 'Základní jednotka rozestupu' },
  ),
]

/**
 * Border Radius Configuration
 */
export const designSystemFields: Field[] = [
  createTextField(
    'radius',
    { en: 'Border Radius', cs: 'Zaoblení rohů' },
    '0.5rem',
    { en: 'Default border radius', cs: 'Výchozí zaoblení rohů' },
  ),
]

/**
 * Extended Theme Selection Field with Visual Preview
 */
export const extendedThemeSelectionField: Field = {
  name: 'extendedTheme',
  type: 'select',
  label: {
    en: '🎨 Theme Preset',
    cs: '🎨 Přednastavené téma',
  },
  defaultValue: 'cool-extended',
  options: extendedThemeOptions,
  admin: {
    description: {
      en: 'Select a professional theme with full OKLCH color support (TweakCN compatible)',
      cs: 'Vyberte profesionální téma s plnou podporou OKLCH barev (kompatibilní s TweakCN)',
    },
  },
}

/**
 * Unified Light Mode Configuration
 * Combines all color tokens in one place
 */
export const lightModeColorsField: Field = {
  type: 'collapsible',
  label: {
    en: '☀️ Light Mode Colors',
    cs: '☀️ Barvy světlého režimu',
  },
  admin: {
    initCollapsed: true,
    description: {
      en: 'Complete color configuration for light mode',
      cs: 'Kompletní konfigurace barev pro světlý režim',
    },
  },
  fields: [
    {
      name: 'lightMode',
      type: 'group',
      fields: [...baseColorFields, ...chartColorFields],
    },
  ],
}

/**
 * Unified Dark Mode Configuration
 */
export const darkModeColorsField: Field = {
  type: 'collapsible',
  label: {
    en: '🌙 Dark Mode Colors',
    cs: '🌙 Barvy tmavého režimu',
  },
  admin: {
    initCollapsed: true,
    description: {
      en: 'Complete color configuration for dark mode',
      cs: 'Kompletní konfigurace barev pro tmavý režim',
    },
  },
  fields: [
    {
      name: 'darkMode',
      type: 'group',
      fields: [...baseColorFields, ...chartColorFields],
    },
  ],
}

/**
 * Shadow Configuration Section
 */
export const shadowConfigField: Field = {
  type: 'collapsible',
  label: {
    en: '🌓 Shadows & Elevation',
    cs: '🌓 Stíny a výška',
  },
  admin: {
    initCollapsed: true,
    description: {
      en: 'Configure shadow system for depth and elevation',
      cs: 'Nakonfigurujte systém stínů pro hloubku a výšku',
    },
  },
  fields: [
    {
      name: 'shadows',
      type: 'group',
      fields: shadowFields,
    },
  ],
}

/**
 * Typography Configuration Section
 */
export const typographyConfigField: Field = {
  type: 'collapsible',
  label: {
    en: '� Typography',
    cs: '� Typografie',
  },
  admin: {
    initCollapsed: true,
    description: {
      en: 'Font families and advanced typography settings',
      cs: 'Rodiny písem a pokročilá nastavení typografie',
    },
  },
  fields: [
    {
      name: 'typography',
      type: 'group',
      fields: [...fontFamilyFields, ...advancedTypographyFields],
    },
  ],
}

/**
 * Design System Configuration
 */
export const designSystemConfigField: Field = {
  type: 'collapsible',
  label: {
    en: '⚙️ Design System',
    cs: '⚙️ Designový systém',
  },
  admin: {
    initCollapsed: true,
    description: {
      en: 'Global design tokens (radius, spacing, etc.)',
      cs: 'Globální design tokeny (zaoblení, rozestupy, atd.)',
    },
  },
  fields: [
    {
      name: 'designSystem',
      type: 'group',
      fields: designSystemFields,
    },
  ],
}

// DEPRECATED: Old fields kept for backwards compatibility
// TODO: Remove in v1.0.0
export const extendedLightModeField = lightModeColorsField
export const extendedDarkModeField = darkModeColorsField
export const chartColorsField = {
  type: 'group',
  name: 'chartColors',
  fields: chartColorFields,
} as Field
