import type { Field } from 'payload'

/**
 * Creates a hidden localized slug field group for storing slug mappings across locales
 */
export function createLocalizedSlugField(locales: string[]): Field {
  // Generate locale-specific fields
  const localeFields = locales.map((locale) => ({
    name: locale,
    type: 'group' as const,
    fields: [
      {
        name: 'slug',
        type: 'text' as const,
        admin: { hidden: true },
      },
      {
        name: 'fullPath',
        type: 'text' as const,
        admin: { hidden: true },
      },
    ],
  }))

  return {
    name: 'localizedSlugs',
    type: 'group',
    admin: {
      hidden: true, // Hidden from admin UI
    },
    fields: localeFields,
  }
}
