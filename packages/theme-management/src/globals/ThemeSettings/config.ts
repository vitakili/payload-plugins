import type { GlobalConfig } from 'payload'

/**
 * ThemeSettings Global Configuration
 *
 * This global stores theme-related settings including:
 * - Active font family (selected via FontPicker)
 * - Google Fonts API key (optional, for extended font library)
 */
export const ThemeSettings: GlobalConfig = {
  slug: 'themeSettings',
  label: { en: 'Theme Settings', cs: 'Nastavení témat' },
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
                  Field: '@kilivi/payloadcms-theme-management/globals/ThemeSettings/FontPicker',
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
                  label: 'Heading Font Weight',
                  defaultValue: '700',
                  options: [
                    { label: '100 - Thin', value: '100' },
                    { label: '200 - Extra Light', value: '200' },
                    { label: '300 - Light', value: '300' },
                    { label: '400 - Regular', value: '400' },
                    { label: '500 - Medium', value: '500' },
                    { label: '600 - Semi Bold', value: '600' },
                    { label: '700 - Bold', value: '700' },
                    { label: '800 - Extra Bold', value: '800' },
                    { label: '900 - Black', value: '900' },
                  ],
                },
                {
                  name: 'fontWeightBody',
                  type: 'select',
                  label: 'Body Font Weight',
                  defaultValue: '400',
                  options: [
                    { label: '100 - Thin', value: '100' },
                    { label: '200 - Extra Light', value: '200' },
                    { label: '300 - Light', value: '300' },
                    { label: '400 - Regular', value: '400' },
                    { label: '500 - Medium', value: '500' },
                    { label: '600 - Semi Bold', value: '600' },
                    { label: '700 - Bold', value: '700' },
                    { label: '800 - Extra Bold', value: '800' },
                    { label: '900 - Black', value: '900' },
                  ],
                },
              ],
            },
            {
              type: 'ui',
              name: 'typographyInfo',
              admin: {
                components: {
                  Field:
                    '@kilivi/payloadcms-theme-management/globals/ThemeSettings/fields/TypographyInfoField',
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
                    '@kilivi/payloadcms-theme-management/globals/ThemeSettings/fields/FontLoadingGuideField',
                },
              },
            },
          ],
        },
      ],
    },
  ],
}
