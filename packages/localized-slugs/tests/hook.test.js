import { expect, test } from 'vitest'
import { createPopulateLocalizedSlugsHook } from '../dist/hooks/populateLocalizedSlugs.js'

test('populateLocalizedSlugs hook generates localized slugs and fullPaths', async () => {
  const hook = createPopulateLocalizedSlugsHook({
    locales: ['cs', 'en'],
    defaultLocale: 'cs',
    slugField: 'slug',
    fullPathField: 'path',
    generateFromTitle: true,
    titleField: 'title',
    enableLogging: false,
    customDiacriticsMap: {},
  })

  const sample = {
    title: { cs: 'Kontaktujte nás', en: 'Contact us' },
    slug: undefined,
    path: undefined,
    localizedSlugs: { cs: {}, en: {} },
  }

  const result = await hook({
    doc: sample,
    operation: 'create',
    req: {},
    collection: { slug: 'pages' },
  })

  expect(result.slug).toBeDefined()
  expect(result.path).toBeDefined()
  expect(result.localizedSlugs).toBeDefined()
  expect(result.localizedSlugs.cs.slug).toBe('kontaktujte-nas')
  expect(result.localizedSlugs.en.slug).toBe('contact-us')
  expect(result.localizedSlugs.cs.fullPath).toBe('/kontaktujte-nas')
  expect(result.localizedSlugs.en.fullPath).toBe('/contact-us')
})
