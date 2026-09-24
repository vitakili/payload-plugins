import type { GlobalConfig } from 'payload'

const fontWeightOptions = [
  { value: '100', label: { en: '100 – Thin', cs: '100 – Vlasové' } },
  { value: '200', label: { en: '200 – Extra light', cs: '200 – Extra tenké' } },
  { value: '300', label: { en: '300 – Light', cs: '300 – Tenké' } },
  { value: '400', label: { en: '400 – Regular', cs: '400 – Normální' } },
  { value: '500', label: { en: '500 – Medium', cs: '500 – Střední' } },
  { value: '600', label: { en: '600 – Semi bold', cs: '600 – Polotučné' } },
  { value: '700', label: { en: '700 – Bold', cs: '700 – Tučné' } },
  { value: '800', label: { en: '800 – Extra bold', cs: '800 – Extra tučné' } },
  { value: '900', label: { en: '900 – Black', cs: '900 – Černé' } },
]

/**
 * ThemeSettings Global Configuration
 *
 * This global stores theme-related settings including:
 * - Active font family (selected via FontPicker)
 * - Google Fonts API key (optional, for extended font library)
 */
export const ThemeSettings: GlobalConfig = {
  slug: 'themeSettings',
  label: { en: 'Theme Settings', cs: 'Nastavení motivu' },
  admin: {
    group: { en: 'Settings', cs: 'Nastavení' },
  },
  access: {
    read: () => true,
    update: ({ req }) => {
      // Only admins can update theme settings
      return req.user?.roles?.includes('admin') || false
    },
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: { en: 'Typography', cs: 'Typografie' },
          fields: [
            {
              name: 'activeFont',
              type: 'text',
              label: { en: 'Active Font Family', cs: 'Aktivní rodina písem' },
              defaultValue: 'Inter',
              admin: {
                description: {
                  en: 'The currently active font family for your website',
                  cs: 'Aktuální rodina písem pro váš web',
                },
                components: {
                  Field: '@kilivi-dev/payloadcms-theme-management/globals/ThemeSettings/FontPicker',
                },
              },
            },
            {
              name: 'googleFontsApiKey',
              type: 'text',
              label: { en: 'Google Fonts API Key', cs: 'Google Fonts API klíč' },
              admin: {
                description: {
                  en: "Optional: Add your Google Fonts API key to access the full library of 1400+ fonts. Without this, you'll have access to 35 popular fonts.",
                  cs: 'Volitelné: přidejte svůj Google Fonts API klíč pro přístup k plné knihovně 1400+ písem. Bez něj máte k dispozici 35 populárních písem.',
                },
                placeholder: 'AIzaSy...',
              },
            },

            {
              type: 'row',
              fields: [
                {
                  name: 'fontWeightHeading',
                  type: 'select',
                  label: { en: 'Heading font weight', cs: 'Tloušťka písma nadpisů' },
                  defaultValue: '700',
                  options: fontWeightOptions,
                },
                {
                  name: 'fontWeightBody',
                  type: 'select',
                  label: { en: 'Body font weight', cs: 'Tloušťka písma textu' },
                  defaultValue: '400',
                  options: fontWeightOptions,
                },
              ],
            },
            {
              type: 'ui',
              name: 'typographyInfo',
              admin: {
                components: {
                  Field:
                    '@kilivi-dev/payloadcms-theme-management/globals/ThemeSettings/fields/TypographyInfoField',
                },
              },
            },
          ],
        },
        {
          label: { en: 'Font Loading', cs: 'Načítání písem' },
          fields: [
            {
              type: 'ui',
              name: 'fontLoadingGuide',
              admin: {
                components: {
                  Field:
                    '@kilivi-dev/payloadcms-theme-management/globals/ThemeSettings/fields/FontLoadingGuideField',
                },
              },
            },
          ],
        },
      ],
    },
  ],
}
