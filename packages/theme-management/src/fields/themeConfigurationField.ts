import type { Field } from 'payload'
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
}

/**
 * Theme Configuration Field with Theme Selection as default value setter
 * Theme Selection populates lightMode/darkMode colors automatically
 */
export function createThemeConfigurationField(options: ThemeConfigurationFieldOptions): Field {
  const {
    themePresets,
    defaultTheme,
    includeColorModeToggle,
    includeCustomCSS,
    enableAdvancedFeatures = true,
  } = options

  const themeOptions = themePresets.map((preset) => {
    const previewColor = preset.preview?.colors.primary
    const label = previewColor ? `${preset.label} • ${previewColor}` : preset.label
    return {
      label,
      value: preset.name,
    }
  })

  const fields: Field[] = [
    {
      name: 'theme',
      type: 'select',
      required: true,
      defaultValue: defaultTheme,
      options: themeOptions,
      label: {
        en: '🎨 Theme Selection',
        cs: '🎨 Výběr tématu',
      },
      admin: {
        description: {
          en: 'Select a theme to auto-populate color values. You can customize colors after selection.',
          cs: 'Vyberte téma pro automatické předvyplnění barev. Po výběru můžete barvy upravit.',
        },
        components: {
          Field: '@kilivi/payloadcms-theme-management/fields/ThemePreviewField',
        },
      },
    },
  ]

  // Color Mode Settings
  if (includeColorModeToggle) {
    fields.push({
      type: 'collapsible',
      label: {
        en: '🌗 Color Mode Settings',
        cs: '🌗 Nastavení barevného režimu',
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

  // Typography (only when NOT using extended theme configuration)
  if (!enableAdvancedFeatures) {
    fields.push({
      type: 'collapsible',
      label: {
        en: '🅰️ Typography',
        cs: '🅰️ Typografie',
      },
      admin: {
        initCollapsed: true,
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
                  // @ts-expect-error - Pass full objects including fontFamily for custom rendering
                  options: BODY_FONT_OPTIONS,
                  admin: {
                    width: '50%',
                    components: {
                      Field: '@kilivi/payloadcms-theme-management/fields/FontSelectField',
                    },
                  },
                },
                {
                  name: 'headingFont',
                  type: 'select',
                  label: {
                    en: 'Heading font',
                    cs: 'Písmo pro nadpisy',
                  },
                  defaultValue: 'preset',
                  // @ts-expect-error - Pass full objects including fontFamily for custom rendering
                  options: HEADING_FONT_OPTIONS,
                  admin: {
                    width: '50%',
                    components: {
                      Field: '@kilivi/payloadcms-theme-management/fields/FontSelectField',
                    },
                  },
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
                },
              ],
            },
          ],
        },
      ],
    })
  }

  // Design Customization (only when NOT using extended theme configuration)
  if (!enableAdvancedFeatures) {
    fields.push({
      type: 'collapsible',
      label: {
        en: '✨ Design Customization',
        cs: '✨ Přizpůsobení designu',
      },
      admin: {
        initCollapsed: true,
      },
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
            { label: { en: 'None', cs: 'Žádné' }, value: 'none' },
            { label: { en: 'Small', cs: 'Malé' }, value: 'small' },
            { label: { en: 'Medium', cs: 'Střední' }, value: 'medium' },
            { label: { en: 'Large', cs: 'Velké' }, value: 'large' },
            { label: { en: 'Full', cs: 'Plné' }, value: 'xl' },
          ],
          admin: {
            components: {
              Field: '@kilivi/payloadcms-theme-management/fields/RadiusField',
            },
            width: '33%',
          },
        },
        {
          name: 'fontScale',
          type: 'select',
          label: {
            en: 'Font Scale',
            cs: 'Velikost písma',
          },
          defaultValue: 'medium',
          options: [
            { label: { en: 'Small', cs: 'Malé' }, value: 'small' },
            { label: { en: 'Medium', cs: 'Střední' }, value: 'medium' },
            { label: { en: 'Large', cs: 'Velké' }, value: 'large' },
          ],
          admin: {
            width: '33%',
          },
        },
        {
          name: 'spacing',
          type: 'select',
          label: {
            en: 'Spacing',
            cs: 'Mezery',
          },
          defaultValue: 'medium',
          options: [
            { label: { en: 'Compact', cs: 'Kompaktní' }, value: 'compact' },
            { label: { en: 'Medium', cs: 'Střední' }, value: 'medium' },
            { label: { en: 'Spacious', cs: 'Prostorné' }, value: 'spacious' },
          ],
          admin: {
            width: '34%',
          },
        },
      ],
    })
  } // End of !enableAdvancedFeatures block

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
        en: '⚙️ Advanced Settings',
        cs: '⚙️ Pokročilé nastavení',
      },
      admin: {
        initCollapsed: true,
      },
      fields: advancedFields,
    })
  }

  // Return just the tab configuration, not the full tabs field
  // Return as group field with all theme configuration
  return {
    name: 'themeConfiguration',
    type: 'group',
    label: {
      en: '🎨 Appearance Settings',
      cs: '🎨 Nastavení vzhledu',
    },
    admin: {
      description: {
        en: 'Configure website appearance and styling',
        cs: 'Nakonfigurujte vzhled a stylování webu',
      },
    },
    fields,
  }
}
