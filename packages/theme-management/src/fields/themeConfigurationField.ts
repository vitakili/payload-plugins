import type { Field, TabsField } from 'payload'
import {
  BASE_FONT_SIZE_OPTIONS,
  BODY_FONT_OPTIONS,
  HEADING_FONT_OPTIONS,
  HEADING_WEIGHT_OPTIONS,
  LETTER_SPACING_OPTIONS,
  LINE_HEIGHT_OPTIONS,
} from '../constants/themeFonts.js'
import type { ThemePreset } from '../index.js'
import { getTranslations } from '../translations.js'
import { darkModeField, lightModeField } from './colorModeFields.js'

interface ThemeConfigurationFieldOptions {
  themePresets: ThemePreset[]
  defaultTheme: string
  includeColorModeToggle: boolean
  includeCustomCSS: boolean
  includeBrandIdentity: boolean
  enableAdvancedFeatures?: boolean
  useThemePreviewField?: boolean
  customThemeConfigurationFields?: Field[]
  customThemeConfigurationSections?: Array<{
    label: string | Record<string, string>
    fields: Field[]
    initCollapsed?: boolean
    description?: string | Record<string, string>
  }>
}

// Type for admin.custom property to avoid ts-expect-error
interface ThemeAdminCustom {
  themePresets?: ThemePreset[]
  useThemePreviewField?: boolean
}

// Type for a single tab (not the full TabsField)
export type ThemeTab = NonNullable<TabsField['tabs']>[number]

/**
 * Theme Configuration Field with Theme Selection as default value setter
 * Theme Selection populates lightMode/darkMode colors automatically
 */
export function createThemeConfigurationField(options: ThemeConfigurationFieldOptions): ThemeTab {
  const {
    themePresets,
    defaultTheme,
    includeColorModeToggle,
    includeCustomCSS,
    enableAdvancedFeatures = true,
    useThemePreviewField = true,
    customThemeConfigurationFields,
    customThemeConfigurationSections,
  } = options

  // The tab is split into sub-tabs (Colours · Typography · Style & effects ·
  // Components · Advanced) instead of one long column of collapsibles. The tabs
  // are *unnamed*, so they are purely presentational: every value keeps its
  // `themeConfiguration.*` path and no stored document changes shape.
  const colorsTab: Field[] = [
    // NOTE: the palette generator is rendered *inside* ThemePreviewField (in the
    // preset column, above the preset list) — it is not a separate UI field.
    {
      name: 'theme',
      type: 'text',
      required: true,
      defaultValue: defaultTheme,
      label: {
        en: 'Theme Selection',
        cs: 'Výběr motivu',
      },
      validate: (value: unknown, options?: { req?: { i18n?: { language?: string } } }) => {
        if (typeof value === 'string' && value.trim().length > 0) {
          return true
        }
        return getTranslations(options?.req?.i18n?.language ?? 'en').ui.selectThemeError
      },
      admin: {
        description: {
          en: 'Pick a theme to fill in the colours. You can fine-tune them afterwards.',
          cs: 'Vyberte motiv a barvy se předvyplní. Potom je můžete dál upravovat.',
        },
        components: {
          Field: '@kilivi/payloadcms-theme-management/fields/ThemePreviewField',
        },
        custom: {
          themePresets,
          useThemePreviewField,
        } as ThemeAdminCustom,
      },
    },
  ]

  // Live preview: colours, fonts and component styles in one place. It sits
  // *outside* the sub-tabs, so on wide admins it stays in a sticky right-hand
  // column whichever tab is open (see ThemePreviewField.css, `.tm-appearance`);
  // on narrow ones it comes first, above the tabs.
  const previewField: Field = {
    name: 'appearancePreview',
    type: 'ui',
    admin: {
      components: {
        Field: '@kilivi/payloadcms-theme-management/fields/AppearancePreviewField',
      },
    },
  }

  // Style & effects tab: a whole-site style preset first, then the shape and
  // effect knobs it sets.
  const styleTab: Field[] = [
    {
      name: 'stylePreset',
      type: 'text',
      label: {
        en: 'Style preset',
        cs: 'Styl vzhledu',
      },
      defaultValue: '',
      admin: {
        components: {
          Field: '@kilivi/payloadcms-theme-management/fields/StylePresetField',
        },
      },
    },
  ]

  const typographyTab: Field[] = [
      {
        name: 'typography',
        type: 'group',
        // The tab already carries the heading.
        label: false,
        admin: { hideGutter: true },
        fields: [
          {
            type: 'row',
            fields: [
              {
                name: 'bodyFont',
                type: 'select',
                label: {
                  en: 'Body font',
                  cs: 'Písmo pro text',
                },
                defaultValue: 'preset',
                options: [...BODY_FONT_OPTIONS],
                admin: {
                  width: '50%',
                  components: {
                    Field: '@kilivi/payloadcms-theme-management/fields/FontSelectField',
                  },
                },
                dbName: 'body_font',
              },
              {
                name: 'headingFont',
                type: 'select',
                label: {
                  en: 'Heading font',
                  cs: 'Písmo pro nadpisy',
                },
                defaultValue: 'preset',
                options: [...HEADING_FONT_OPTIONS],
                admin: {
                  width: '50%',
                  components: {
                    Field: '@kilivi/payloadcms-theme-management/fields/FontSelectField',
                  },
                },
                dbName: 'heading_font',
              },
            ],
          },
          {
            type: 'row',
            fields: [
              {
                name: 'bodyFontCustom',
                type: 'text',
                label: {
                  en: 'Custom body font stack',
                  cs: 'Vlastní písmo pro text',
                },
                admin: {
                  width: '50%',
                  placeholder: '"IBM Plex Sans", sans-serif',
                  description: {
                    en: 'Provide full CSS font-family stack when using a custom font.',
                    cs: 'Při volbě vlastního písma zadejte celý CSS zápis font-family.',
                  },
                  condition: (_, siblingData) => siblingData?.bodyFont === 'custom',
                },
              },
              {
                name: 'headingFontCustom',
                type: 'text',
                label: {
                  en: 'Custom heading font stack',
                  cs: 'Vlastní písmo pro nadpisy',
                },
                admin: {
                  width: '50%',
                  placeholder: '"Cormorant Garamond", serif',
                  description: {
                    en: 'Provide full CSS font-family stack when using a custom heading font.',
                    cs: 'Při volbě vlastního nadpisového písma zadejte celý CSS zápis font-family.',
                  },
                  condition: (_, siblingData) => siblingData?.headingFont === 'custom',
                },
              },
            ],
          },
          {
            type: 'row',
            fields: [
              {
                name: 'baseFontSize',
                type: 'select',
                label: {
                  en: 'Base font size',
                  cs: 'Základní velikost písma',
                },
                defaultValue: 'preset',
                options: BASE_FONT_SIZE_OPTIONS,
                admin: {
                  width: '50%',
                },
                dbName: 'base_font_size',
              },
              {
                name: 'lineHeight',
                type: 'select',
                label: {
                  en: 'Line height',
                  cs: 'Řádkování',
                },
                defaultValue: 'preset',
                options: LINE_HEIGHT_OPTIONS,
                admin: {
                  width: '50%',
                },
                dbName: 'line_height',
              },
            ],
          },
          {
            type: 'row',
            fields: [
              {
                name: 'headingWeight',
                type: 'select',
                label: {
                  en: 'Heading weight',
                  cs: 'Tloušťka nadpisů',
                },
                defaultValue: 'preset',
                options: HEADING_WEIGHT_OPTIONS,
                admin: {
                  width: '50%',
                },
                dbName: 'heading_weight',
              },
              {
                name: 'letterSpacing',
                type: 'select',
                label: {
                  en: 'Heading letter spacing',
                  cs: 'Prostrkání nadpisů',
                },
                defaultValue: 'preset',
                options: LETTER_SPACING_OPTIONS,
                admin: {
                  width: '50%',
                  description: {
                    en: '"Extra wide" also sets headings in capitals.',
                    cs: '„Velmi široké“ zároveň převede nadpisy na verzálky.',
                  },
                },
                dbName: 'letter_spacing',
              },
            ],
          },
        ],
      },
  ]

  // Shape & rhythm — corner rounding and spacing scale
  styleTab.push({
    type: 'row',
    fields: [
      {
        name: 'borderRadius',
        type: 'select',
        label: {
          en: 'Border Radius',
          cs: 'Zaoblení rohů',
        },
        defaultValue: 'medium',
        options: [
          { label: { en: 'None (0px)', cs: 'Žádné (0px)' }, value: 'none' },
          { label: { en: 'Small (0.25rem)', cs: 'Malé (0.25rem)' }, value: 'small' },
          { label: { en: 'Medium (0.5rem)', cs: 'Střední (0.5rem)' }, value: 'medium' },
          { label: { en: 'Large (0.75rem)', cs: 'Velké (0.75rem)' }, value: 'large' },
          { label: { en: 'XL (1rem)', cs: 'XL (1rem)' }, value: 'xl' },
        ],
        admin: {
          description: {
            en: 'Default corner rounding for UI elements',
            cs: 'Výchozí zaoblení rohů pro UI prvky',
          },
          width: '50%',
        },
        dbName: 'border_radius',
      },
      {
        name: 'spacing',
        type: 'select',
        label: {
          en: 'Spacing Scale',
          cs: 'Škála rozestupů',
        },
        defaultValue: 'medium',
        options: [
          { label: { en: 'Compact', cs: 'Kompaktní' }, value: 'compact' },
          { label: { en: 'Medium', cs: 'Střední' }, value: 'medium' },
          { label: { en: 'Comfortable', cs: 'Pohodlné' }, value: 'comfortable' },
        ],
        admin: {
          description: {
            en: 'Global spacing between elements',
            cs: 'Globální rozestupy mezi prvky',
          },
          width: '50%',
        },
        dbName: 'spacing',
      },
    ],
  })

  // Visual Effects — glassmorphism, shadows, border style. Open by default: it
  // shares its tab with only the style preset and the shape row.
  styleTab.push({
    type: 'collapsible',
    label: {
      en: 'Visual Effects',
      cs: 'Vizuální efekty',
    },
    admin: {
      initCollapsed: false,
      className: 'tm-section-effects',
      description: {
        en: 'Configure UI effect style, shadow intensity and border appearance.',
        cs: 'Nastavte styl efektů UI, intenzitu stínů a vzhled okrajů.',
      },
    },
    fields: [
      {
        name: 'visualEffects',
        type: 'group',
        // The collapsible around it already carries the heading.
        label: false,
        admin: { hideGutter: true },
        fields: [
          {
            type: 'row',
            fields: [
              {
                name: 'effectStyle',
                type: 'select',
                label: {
                  en: 'Effect Style',
                  cs: 'Styl efektů',
                },
                defaultValue: 'flat',
                options: [
                  { label: { en: 'Flat', cs: 'Plochý' }, value: 'flat' },
                  {
                    label: { en: 'Elevated (Box shadows)', cs: 'Vyvýšený (stíny)' },
                    value: 'elevated',
                  },
                  {
                    label: {
                      en: 'Glassmorphism (Frosted glass)',
                      cs: 'Glassmorphism (mléčné sklo)',
                    },
                    value: 'glass',
                  },
                  {
                    label: { en: 'Neumorphism (Soft UI)', cs: 'Neumorphism (měkké UI)' },
                    value: 'neumorphic',
                  },
                  {
                    label: { en: 'Claymorphism (Clay-like)', cs: 'Claymorphism (hlína)' },
                    value: 'clay',
                  },
                ],
                admin: {
                  description: {
                    en: 'Visual style applied to cards, panels and interactive elements.',
                    cs: 'Vizuální styl karet, panelů a interaktivních prvků.',
                  },
                  width: '50%',
                },
                dbName: 'effect_style',
              },
              {
                name: 'shadowIntensity',
                type: 'select',
                label: {
                  en: 'Shadow Intensity',
                  cs: 'Intenzita stínů',
                },
                defaultValue: 'medium',
                options: [
                  { label: { en: 'None', cs: 'Žádné' }, value: 'none' },
                  { label: { en: 'Subtle', cs: 'Jemné' }, value: 'subtle' },
                  { label: { en: 'Medium', cs: 'Střední' }, value: 'medium' },
                  { label: { en: 'Strong', cs: 'Silné' }, value: 'strong' },
                  { label: { en: 'Dramatic', cs: 'Dramatické' }, value: 'dramatic' },
                ],
                admin: {
                  description: {
                    en: 'Global shadow depth for elevated elements.',
                    cs: 'Globální hloubka stínů pro vyvýšené prvky.',
                  },
                  width: '50%',
                },
                dbName: 'shadow_intensity',
              },
            ],
          },
          {
            type: 'row',
            fields: [
              {
                name: 'backdropBlur',
                type: 'select',
                label: {
                  en: 'Backdrop Blur',
                  cs: 'Rozmazání pozadí',
                },
                defaultValue: 'none',
                options: [
                  { label: { en: 'None', cs: 'Žádné' }, value: 'none' },
                  { label: { en: 'Slight (4px)', cs: 'Jemné (4px)' }, value: 'slight' },
                  { label: { en: 'Medium (8px)', cs: 'Střední (8px)' }, value: 'medium' },
                  { label: { en: 'Strong (16px)', cs: 'Silné (16px)' }, value: 'strong' },
                  { label: { en: 'Heavy (24px)', cs: 'Intenzivní (24px)' }, value: 'heavy' },
                ],
                admin: {
                  description: {
                    en: 'Blur behind translucent glass panels.',
                    cs: 'Rozostření za průsvitnými skleněnými panely.',
                  },
                  width: '50%',
                  condition: (_, siblingData) => siblingData?.effectStyle === 'glass',
                },
                dbName: 'backdrop_blur',
              },
              {
                name: 'glassOpacity',
                type: 'number',
                label: {
                  en: 'Glass Opacity (%)',
                  cs: 'Průhlednost skla (%)',
                },
                defaultValue: 60,
                min: 0,
                max: 100,
                admin: {
                  description: {
                    en: 'Card/panel opacity when using glass effect (0 = fully transparent, 100 = opaque).',
                    cs: 'Průhlednost karet/panelů při skleněném efektu (0 = plně průhledné, 100 = neprůhledné).',
                  },
                  width: '50%',
                  condition: (_, siblingData) => siblingData?.effectStyle === 'glass',
                },
              },
            ],
          },
          {
            type: 'row',
            fields: [
              {
                name: 'borderStyle',
                type: 'select',
                label: {
                  en: 'Border Style',
                  cs: 'Styl okrajů',
                },
                defaultValue: 'solid',
                options: [
                  { label: { en: 'None', cs: 'Žádné' }, value: 'none' },
                  { label: { en: 'Solid', cs: 'Plné' }, value: 'solid' },
                  { label: { en: 'Dashed', cs: 'Čárkované' }, value: 'dashed' },
                  { label: { en: 'Dotted', cs: 'Tečkované' }, value: 'dotted' },
                  { label: { en: 'Double', cs: 'Dvojité' }, value: 'double' },
                ],
                admin: {
                  description: {
                    en: 'Default border style for cards, inputs and dividers.',
                    cs: 'Výchozí styl okrajů pro karty, vstupy a oddělovače.',
                  },
                  width: '50%',
                },
                dbName: 'border_style',
              },
              {
                name: 'borderWidth',
                type: 'select',
                label: {
                  en: 'Border Width',
                  cs: 'Tloušťka okraje',
                },
                defaultValue: '1px',
                options: [
                  { label: '0px', value: '0px' },
                  { label: '1px', value: '1px' },
                  { label: '2px', value: '2px' },
                  { label: '3px', value: '3px' },
                  { label: '4px', value: '4px' },
                ],
                admin: {
                  width: '50%',
                  condition: (_, siblingData) => siblingData?.borderStyle !== 'none',
                },
                dbName: 'border_width',
              },
            ],
          },
        ],
      },
    ],
  })

  // Component Styles — buttons, cards, images, icons
  const componentsTab: Field[] = [
      {
        name: 'componentStyles',
        type: 'group',
        // The tab already carries the heading.
        label: false,
        admin: { hideGutter: true },
        fields: [
          {
            type: 'row',
            fields: [
              {
                name: 'buttonVariant',
                type: 'select',
                label: {
                  en: 'Primary Button Style',
                  cs: 'Styl primárního tlačítka',
                },
                defaultValue: 'filled',
                options: [
                  { label: { en: 'Filled (solid)', cs: 'Plné (solid)' }, value: 'filled' },
                  { label: { en: 'Outlined', cs: 'Ohraničené' }, value: 'outlined' },
                  { label: { en: 'Ghost (transparent)', cs: 'Průhledné' }, value: 'ghost' },
                  { label: { en: 'Gradient', cs: 'Přechodové' }, value: 'gradient' },
                  {
                    label: { en: 'Pill (full rounded)', cs: 'Pill (plné zaoblení)' },
                    value: 'pill',
                  },
                  {
                    label: { en: 'Brutalist (thick border)', cs: 'Brutalistické (silný okraj)' },
                    value: 'brutal',
                  },
                ],
                admin: {
                  description: {
                    en: 'Default visual style of primary action buttons.',
                    cs: 'Výchozí vizuální styl primárních tlačítek.',
                  },
                  width: '50%',
                },
                dbName: 'button_variant',
              },
              {
                name: 'buttonSize',
                type: 'select',
                label: {
                  en: 'Button Size',
                  cs: 'Velikost tlačítka',
                },
                defaultValue: 'medium',
                options: [
                  { label: { en: 'Small', cs: 'Malé' }, value: 'small' },
                  { label: { en: 'Medium', cs: 'Střední' }, value: 'medium' },
                  { label: { en: 'Large', cs: 'Velké' }, value: 'large' },
                  { label: { en: 'XL', cs: 'XL' }, value: 'xl' },
                ],
                admin: {
                  description: {
                    en: 'Default padding / font-size of buttons.',
                    cs: 'Výchozí odsazení a velikost písma tlačítek.',
                  },
                  width: '50%',
                },
                dbName: 'button_size',
              },
            ],
          },
          {
            type: 'row',
            fields: [
              {
                name: 'cardStyle',
                type: 'select',
                label: {
                  en: 'Card Style',
                  cs: 'Styl karet',
                },
                defaultValue: 'elevated',
                options: [
                  { label: { en: 'Elevated (shadow)', cs: 'Vyvýšené (stín)' }, value: 'elevated' },
                  { label: { en: 'Flat (no shadow)', cs: 'Ploché (bez stínu)' }, value: 'flat' },
                  { label: { en: 'Bordered', cs: 'S okrajem' }, value: 'bordered' },
                  { label: { en: 'Glass', cs: 'Skleněné' }, value: 'glass' },
                  { label: { en: 'Neumorphic', cs: 'Neumorfní' }, value: 'neumorphic' },
                  {
                    label: { en: 'Gradient border', cs: 'Přechodový okraj' },
                    value: 'gradient-border',
                  },
                ],
                admin: {
                  description: {
                    en: 'Default card/panel visual style across the website.',
                    cs: 'Výchozí vizuální styl karet a panelů na webu.',
                  },
                  width: '50%',
                },
                dbName: 'card_style',
              },
              {
                name: 'cardHoverEffect',
                type: 'select',
                label: {
                  en: 'Card Hover Effect',
                  cs: 'Efekt při najetí na kartu',
                },
                defaultValue: 'lift',
                options: [
                  { label: { en: 'None', cs: 'Žádný' }, value: 'none' },
                  {
                    label: { en: 'Lift (translate up)', cs: 'Zvednutí (posun nahoru)' },
                    value: 'lift',
                  },
                  { label: { en: 'Scale up', cs: 'Zvětšení' }, value: 'scale' },
                  { label: { en: 'Shadow grow', cs: 'Větší stín' }, value: 'shadow' },
                  { label: { en: 'Border glow', cs: 'Zářící okraj' }, value: 'glow' },
                  { label: { en: 'Tilt 3D', cs: '3D náklon' }, value: 'tilt' },
                ],
                admin: {
                  width: '50%',
                },
                dbName: 'card_hover_effect',
              },
            ],
          },

          {
            type: 'row',
            fields: [
              {
                name: 'navbarStyle',
                type: 'select',
                label: {
                  en: 'Navbar Style',
                  cs: 'Styl navigace',
                },
                defaultValue: 'solid',
                options: [
                  { label: { en: 'Solid', cs: 'Plná' }, value: 'solid' },
                  {
                    label: { en: 'Transparent (on hero)', cs: 'Průhledná (nad hero)' },
                    value: 'transparent',
                  },
                  { label: { en: 'Blurred glass', cs: 'Rozmazané sklo' }, value: 'blur' },
                  { label: { en: 'Floating', cs: 'Plovoucí' }, value: 'floating' },
                  {
                    label: {
                      en: 'Minimal (bottom border only)',
                      cs: 'Minimalistická (jen spodní okraj)',
                    },
                    value: 'minimal',
                  },
                ],
                admin: {
                  description: {
                    en: 'Navigation bar visual style.',
                    cs: 'Vizuální styl navigační lišty.',
                  },
                  width: '50%',
                },
                dbName: 'navbar_style',
              },
              {
                name: 'footerStyle',
                type: 'select',
                label: {
                  en: 'Footer Style',
                  cs: 'Styl patičky',
                },
                defaultValue: 'standard',
                options: [
                  { label: { en: 'Standard', cs: 'Standardní' }, value: 'standard' },
                  { label: { en: 'Minimal', cs: 'Minimalistická' }, value: 'minimal' },
                  { label: { en: 'Dark', cs: 'Tmavá' }, value: 'dark' },
                  {
                    label: { en: 'Gradient top edge', cs: 'Gradient horní hrana' },
                    value: 'gradient-top',
                  },
                  { label: { en: 'Full colour', cs: 'Plná barva' }, value: 'full-color' },
                ],
                admin: {
                  description: {
                    en: 'Footer visual style.',
                    cs: 'Vizuální styl patičky.',
                  },
                  width: '50%',
                },
                dbName: 'footer_style',
              },
            ],
          },
          {
            type: 'row',
            fields: [
              {
                name: 'imageStyle',
                type: 'select',
                label: {
                  en: 'Image Style',
                  cs: 'Styl obrázků',
                },
                defaultValue: 'default',
                options: [
                  { label: { en: 'Default', cs: 'Výchozí' }, value: 'default' },
                  { label: { en: 'Rounded', cs: 'Zaoblené' }, value: 'rounded' },
                  { label: { en: 'Circle', cs: 'Kruhové' }, value: 'circle' },
                  { label: { en: 'Vignette', cs: 'Vinětace' }, value: 'vignette' },
                  { label: { en: 'Grayscale', cs: 'Černobílé' }, value: 'grayscale' },
                  { label: { en: 'Duotone', cs: 'Duotón' }, value: 'duotone' },
                  { label: { en: 'Polaroid', cs: 'Polaroid' }, value: 'polaroid' },
                ],
                admin: {
                  description: {
                    en: 'How images inside page content are shown.',
                    cs: 'Jak se zobrazují obrázky v obsahu stránek.',
                  },
                  width: '50%',
                },
                dbName: 'image_style',
              },
              {
                name: 'linkStyle',
                type: 'select',
                label: {
                  en: 'Link Style',
                  cs: 'Styl odkazů',
                },
                defaultValue: 'underline-hover',
                options: [
                  { label: { en: 'Always underlined', cs: 'Vždy podtržené' }, value: 'underline' },
                  {
                    label: { en: 'Underline on hover', cs: 'Podtržení při najetí' },
                    value: 'underline-hover',
                  },
                  { label: { en: 'No underline', cs: 'Bez podtržení' }, value: 'none' },
                  { label: { en: 'Highlight', cs: 'Zvýraznění' }, value: 'highlight' },
                  {
                    label: { en: 'Animated underline', cs: 'Animované podtržení' },
                    value: 'animated',
                  },
                ],
                admin: {
                  description: {
                    en: 'How links inside text look.',
                    cs: 'Jak vypadají odkazy v textu.',
                  },
                  width: '50%',
                },
                dbName: 'link_style',
              },
            ],
          },
          {
            type: 'row',
            fields: [
              {
                name: 'enableScrollReveal',
                type: 'checkbox',
                label: {
                  en: 'Scroll reveal animations',
                  cs: 'Animace při scrollování',
                },
                defaultValue: true,
                admin: {
                  description: {
                    en: 'Reveal elements as they enter the viewport.',
                    cs: 'Odhalovat prvky při vstupu do viewportu.',
                  },
                  width: '50%',
                },
              },
              {
                name: 'enableHoverAnimations',
                type: 'checkbox',
                label: {
                  en: 'Hover micro-animations',
                  cs: 'Hover mikro-animace',
                },
                defaultValue: true,
                admin: {
                  description: {
                    en: 'Subtle motion on interactive elements when hovered.',
                    cs: 'Jemný pohyb interaktivních prvků při najetí.',
                  },
                  width: '50%',
                },
              },
            ],
          },
        ],
      },
  ]

  // Color Mode Settings — fine-tuning under the theme picker in the Colours tab.
  if (includeColorModeToggle) {
    colorsTab.push({
      type: 'collapsible',
      label: {
        en: 'Fine-tune colours',
        cs: 'Doladit barvy',
      },
      admin: {
        className: 'tm-section-colors',
        // Fine-tuning: collapsed by default so presets and the preview lead the tab.
        initCollapsed: true,
        description: {
          en: 'Individual light and dark mode colours. Edits here take precedence over the theme.',
          cs: 'Jednotlivé barvy světlého a tmavého režimu. Úpravy zde mají přednost před motivem.',
        },
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'colorMode',
              type: 'select',
              label: {
                en: 'Default Color Mode',
                cs: 'Výchozí barevný režim',
              },
              defaultValue: 'auto',
              options: [
                {
                  label: {
                    en: 'Auto (System)',
                    cs: 'Automaticky (Systém)',
                  },
                  value: 'auto',
                },
                {
                  label: { en: 'Light', cs: 'Světlý' },
                  value: 'light',
                },
                {
                  label: { en: 'Dark', cs: 'Tmavý' },
                  value: 'dark',
                },
              ],
              admin: {
                description: {
                  en: 'Default color mode for visitors',
                  cs: 'Výchozí barevný režim pro návštěvníky',
                },
                width: '50%',
              },
              dbName: 'color_mode',
            },
            {
              name: 'allowColorModeToggle',
              type: 'checkbox',
              label: {
                en: 'Enable Mode Toggle',
                cs: 'Povolit přepínač režimu',
              },
              defaultValue: true,
              admin: {
                description: {
                  en: 'Let visitors switch modes',
                  cs: 'Umožnit návštěvníkům přepínat režimy',
                },
                width: '50%',
              },
            },
          ],
        },
        lightModeField,
        darkModeField,
        {
          name: 'accessibilityAudit',
          type: 'ui',
          admin: {
            components: {
              Field: '@kilivi/payloadcms-theme-management/fields/AccessibilityAuditField',
            },
          },
        },
        {
          name: 'themeExport',
          type: 'ui',
          admin: {
            components: {
              Field: '@kilivi/payloadcms-theme-management/fields/ThemeExportField',
            },
          },
        },
      ],
    })
  }

  const customPresetsField: Field = {
    type: 'collapsible',
    label: {
      en: 'Custom Theme Presets',
      cs: 'Vlastní motivy',
    },
    admin: {
      initCollapsed: true,
      className: 'tm-section-custom-presets',
      description: {
        en: 'For developers: import extra colour themes as JSON. They appear in the theme list at the top straight away.',
        cs: 'Pro vývojáře: import dalších barevných motivů ve formátu JSON. Hned se objeví v seznamu motivů nahoře.',
      },
    },
    fields: [
      {
        name: 'customThemePresets',
        type: 'json',
        label: {
          en: 'Custom Preset JSON',
          cs: 'JSON s vlastními motivy',
        },
        admin: {
          description: {
            en: 'Paste or import an array (or object map) of theme presets. Each entry should include at least a unique "name" and "label" with optional lightMode/darkMode colors.',
            cs: 'Vložte nebo importujte pole (či objekt) motivů. Každý motiv musí mít unikátní „name“ a „label“ a volitelně barvy pro světlý a tmavý režim.',
          },
          components: {
            Field: '@kilivi/payloadcms-theme-management/fields/ThemePresetImportField',
          },
        },
      },
    ],
  }

  // Advanced tab: the developer-facing knobs — consumer-supplied sections,
  // custom CSS and the JSON preset import — kept away from the editor's
  // everyday path.
  const advancedTab: Field[] = []

  if (customThemeConfigurationSections?.length) {
    customThemeConfigurationSections.forEach((section) => {
      advancedTab.push({
        type: 'collapsible',
        label: section.label,
        admin: {
          initCollapsed: section.initCollapsed ?? true,
          description: section.description,
        },
        fields: section.fields,
      })
    })
  }

  if (enableAdvancedFeatures) {
    // Motion is part of how the site *feels*, so it sits with the other style
    // choices rather than behind the developer tab.
    styleTab.push({
      type: 'row',
      fields: [
        {
          name: 'animationLevel',
          type: 'select',
          label: {
            en: 'Animation Level',
            cs: 'Úroveň animací',
          },
          defaultValue: 'medium',
          options: [
            { label: { en: 'None', cs: 'Žádné' }, value: 'none' },
            { label: { en: 'Reduced', cs: 'Snížené' }, value: 'reduced' },
            { label: { en: 'Medium', cs: 'Střední' }, value: 'medium' },
            { label: { en: 'High', cs: 'Vysoké' }, value: 'high' },
          ],
          admin: {
            description: {
              en: 'Control website animations and transitions',
              cs: 'Kontrola animací a přechodů na webu',
            },
            width: '50%',
          },
          dbName: 'animation_level',
        },
      ],
    })

    if (includeCustomCSS) {
      advancedTab.push({
        name: 'customCSS',
        type: 'code',
        label: {
          en: 'Custom CSS',
          cs: 'Vlastní CSS',
        },
        admin: {
          language: 'css',
          description: {
            en: 'Add custom CSS to override default styles',
            cs: 'Přidejte vlastní CSS pro přepsání výchozích stylů',
          },
        },
      })
    }
  }

  advancedTab.push(customPresetsField)

  // Consumer-supplied loose fields are appearance options of the consumer's own
  // site (a gradient background, say), so they close the Style & effects tab
  // rather than hiding among the developer settings.
  if (customThemeConfigurationFields?.length) {
    styleTab.push(...customThemeConfigurationFields)
  }

  const tabs: NonNullable<TabsField['tabs']> = [
    {
      // No tab description: the theme picker right below says it in its own words.
      label: { en: 'Colours', cs: 'Barvy' },
      fields: colorsTab,
    },
    {
      label: { en: 'Typography', cs: 'Písmo' },
      description: {
        en: 'Fonts, text size and the character of headings. "Use theme preset" keeps the colour theme’s defaults.',
        cs: 'Písma, velikost textu a charakter nadpisů. „Podle motivu“ ponechá výchozí nastavení barevného motivu.',
      },
      fields: typographyTab,
    },
    {
      // No tab description: the style preset picker opens with its own.
      label: { en: 'Style & effects', cs: 'Styl a efekty' },
      fields: styleTab,
    },
    {
      label: { en: 'Components', cs: 'Komponenty' },
      description: {
        en: 'How buttons, cards, the navigation bar, images and links look.',
        cs: 'Jak vypadají tlačítka, karty, navigační lišta, obrázky a odkazy.',
      },
      fields: componentsTab,
    },
    {
      label: { en: 'Advanced', cs: 'Pokročilé' },
      fields: advancedTab,
    },
  ]

  // Return as tab configuration to be injected into tabs structure
  return {
    label: {
      en: 'Appearance Settings',
      cs: 'Nastavení vzhledu',
    },
    fields: [
      {
        name: 'themeConfiguration',
        type: 'group',
        // The surrounding tab already names it; Payload would otherwise print
        // the untranslated "Theme Configuration" above the controls.
        label: false,
        admin: {
          className: 'tm-appearance',
          hideGutter: true,
        },
        fields: [previewField, { type: 'tabs', tabs }],
      },
    ],
  }
}
