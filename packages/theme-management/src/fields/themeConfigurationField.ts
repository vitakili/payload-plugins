import type { Field, TabsField } from 'payload'
import {
  BASE_FONT_SIZE_OPTIONS,
  BODY_FONT_OPTIONS,
  HEADING_FONT_OPTIONS,
  LINE_HEIGHT_OPTIONS,
} from '../constants/themeFonts.js'
import type { ThemePreset } from '../index.js'
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

  const fields: Field[] = [
    {
      name: 'theme',
      type: 'text',
      required: true,
      defaultValue: defaultTheme,
      label: {
        en: 'Theme Selection',
        cs: 'Výběr tématu',
      },
      validate: (value: unknown) => {
        if (typeof value === 'string' && value.trim().length > 0) {
          return true
        }
        return 'Select a theme'
      },
      admin: {
        description: {
          en: 'Select a theme to auto-populate color values. You can customize colors after selection.',
          cs: 'Vyberte téma pro automatické předvyplnění barev. Po výběru můžete barvy upravit.',
        },
        components: {
          Field: '@kilivi-dev/payloadcms-theme-management/fields/ThemePreviewField',
        },
        custom: {
          themePresets,
          useThemePreviewField,
        } as ThemeAdminCustom,
      },
    },
  ]

  // Style Preset - visual style selection independent of colors
  fields.push({
    type: 'collapsible',
    label: {
      en: 'Style Preset',
      cs: 'Styl předlohy',
    },
    admin: {
      initCollapsed: true,
      className: 'tm-section-style-preset',
      description: {
        en: 'Choose a visual style (Brutalism, Swiss, Glassmorphism …) without changing the colour palette.',
        cs: 'Zvolte vizuální styl (Brutalismus, Švýcarský, Glassmorphism …) bez změny barevné palety.',
      },
    },
    fields: [
      {
        name: 'stylePreset',
        type: 'text',
        label: {
          en: 'Active Style Preset',
          cs: 'Aktivní styl předlohy',
        },
        defaultValue: '',
        admin: {
          components: {
            Field: '@kilivi-dev/payloadcms-theme-management/fields/StylePresetField',
          },
        },
      },
    ],
  })

  // Border Radius Configuration - Always visible
  fields.push({
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

  // Color Mode Settings
  if (includeColorModeToggle) {
    fields.push({
      type: 'collapsible',
      label: {
        en: 'Color Mode Settings',
        cs: 'Nastavení barevného režimu',
      },
      admin: {
        initCollapsed: false,
        description: {
          en: 'Configure light and dark mode colors. Changes here override theme selection.',
          cs: 'Nakonfigurujte barvy světlého a tmavého režimu. Změny zde přepíší výběr tématu.',
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
      ],
    })
  }

  // Typography - Always visible
  fields.push({
    type: 'collapsible',
    label: {
      en: 'Typography',
      cs: 'Typografie',
    },
    admin: {
      initCollapsed: true,
      className: 'tm-section-typography',
      description: {
        en: 'Choose font families and base typography settings. Leave fields on "Use preset" to inherit the theme defaults.',
        cs: 'Zvolte rodiny písem a základní typografické nastavení. Hodnota "Použít výchozí" zachová nastavení motivu.',
      },
    },
    fields: [
      {
        name: 'typography',
        type: 'group',
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
                    Field: '@kilivi-dev/payloadcms-theme-management/fields/FontSelectField',
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
                    Field: '@kilivi-dev/payloadcms-theme-management/fields/FontSelectField',
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
                options: BASE_FONT_SIZE_OPTIONS.map((option) => ({
                  label: option.label,
                  value: option.value,
                })),
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
                options: LINE_HEIGHT_OPTIONS.map((option) => ({
                  label: option.label,
                  value: option.value,
                })),
                admin: {
                  width: '50%',
                },
                dbName: 'line_height',
              },
            ],
          },
        ],
      },
    ],
  })

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
        en: 'Import additional theme presets via JSON to extend or override the defaults. These presets become available instantly in the Theme Selection above.',
        cs: 'Importujte další motivy pomocí JSONu a rozšiřte nebo přepište výchozí nabídku. Motivy budou ihned k dispozici ve výběru výše.',
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
            cs: 'Vložte nebo importujte pole (či objekt) motivů. Každý motiv musí mít unikátní „name“ a „label“ a volitelně barvy pro světly/tmavý režim.',
          },
          components: {
            Field: '@kilivi-dev/payloadcms-theme-management/fields/ThemePresetImportField',
          },
        },
      },
    ],
  }

  fields.push(customPresetsField)

  // Visual Effects — glassmorphism, shadows, border style
  fields.push({
    type: 'collapsible',
    label: {
      en: 'Visual Effects',
      cs: 'Vizuální efekty',
    },
    admin: {
      initCollapsed: true,
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
                    en: 'Blur effect behind translucent elements (requires glass effect style).',
                    cs: 'Rozmazání za průhledné prvky (vyžaduje styl skla).',
                  },
                  width: '50%',
                },
                dbName: 'backdrop_blur',
              },
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
            ],
          },
          {
            type: 'row',
            fields: [
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
                admin: { width: '50%' },
                dbName: 'border_width',
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
        ],
      },
    ],
  })

  // Component Styles — buttons, cards, images, icons
  fields.push({
    type: 'collapsible',
    label: {
      en: 'Component Styles',
      cs: 'Styly komponent',
    },
    admin: {
      initCollapsed: true,
      className: 'tm-section-components',
      description: {
        en: 'Customize button variant, card style and navbar appearance.',
        cs: 'Přizpůsobte styl tlačítek, karet a navigační lišty.',
      },
    },
    fields: [
      {
        name: 'componentStyles',
        type: 'group',
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
              { label: { en: 'Pill (full rounded)', cs: 'Pill (plné zaoblení)' }, value: 'pill' },
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
            },
            dbName: 'button_variant',
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
            },
            dbName: 'navbar_style',
          },
        ],
      },
    ],
  })

  if (customThemeConfigurationFields?.length) {
    fields.push(...customThemeConfigurationFields)
  }

  if (customThemeConfigurationSections?.length) {
    customThemeConfigurationSections.forEach((section) => {
      fields.push({
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

  // Advanced Settings (when using extended theme configuration)
  if (enableAdvancedFeatures) {
    const advancedFields: Field[] = [
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
    ]

    if (includeCustomCSS) {
      advancedFields.push({
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
          // placeholder:
          //   ':root {\n  --primary: #your-color;\n  --border-radius: 8px;\n  --font-family: "Your Font";\n}\n\n.custom-class {\n  /* Your custom styles */\n}',
          // rows: 8,
        },
      })
    }

    fields.push({
      type: 'collapsible',
      label: {
        en: 'Advanced Settings',
        cs: 'Pokročilé nastavení',
      },
      admin: {
        initCollapsed: true,
        className: 'tm-section-advanced',
      },
      fields: advancedFields,
    })
  }

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
        admin: {
          description: {
            en: 'Configure website appearance and styling',
            cs: 'Nakonfigurujte vzhled a stylování webu',
          },
        },
        fields,
      },
    ],
  }
}
