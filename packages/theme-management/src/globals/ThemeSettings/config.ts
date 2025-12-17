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
  label: 'Theme Settings',
  admin: {
    group: 'Settings',
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
          label: 'Typography',
          fields: [
            {
              name: 'activeFont',
              type: 'text',
              label: 'Active Font Family',
              defaultValue: 'Inter',
              admin: {
                description: 'The currently active font family for your website',
                components: {
                  Field: '@kilivi/payloadcms-theme-management/globals/ThemeSettings/FontPicker',
                },
              },
            },
            {
              name: 'googleFontsApiKey',
              type: 'text',
              label: 'Google Fonts API Key',
              admin: {
                description:
                  "Optional: Add your Google Fonts API key to access the full library of 1400+ fonts. Without this, you'll have access to 35 popular fonts.",
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
          label: 'Font Loading',
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
