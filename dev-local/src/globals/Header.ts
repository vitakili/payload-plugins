import type { GlobalConfig } from 'payload'

import { link } from '@/fields/link'

export const Header: GlobalConfig = {
  slug: 'header',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'navItems',
      type: 'array',
      fields: [
        link({
          appearances: false,
        }),
      ],
      maxRows: 6,
    },
    {
      name: 'themeToken',
      type: 'text',
      label: {
        en: 'Header Background',
        cs: 'Pozadí hlavičky',
      },
      defaultValue: 'background',
      admin: {
        description: {
          en: 'Select the background color token for the header',
          cs: 'Vyberte token barvy pozadí pro hlavičku',
        },
        components: {
          Field: '@kilivi/payloadcms-theme-management/fields/ThemeTokenSelectField',
        },
      },
    },
  ],
}
