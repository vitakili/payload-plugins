import { expect, test } from 'vitest'
import { createPopulateLocalizedSlugsHook } from '../dist/hooks/populateLocalizedSlugs.js'

test('populateLocalizedSlugs hook copies existing slug and path values', async () => {
  const hook = createPopulateLocalizedSlugsHook({
    locales: ['cs', 'en'],
    slugField: 'slug',
    fullPathField: 'path',
    enableLogging: false,
  })

  const sample = {
    title: { cs: 'Kontaktujte nás', en: 'Contact us' },
    slug: { cs: 'kontaktujte-nas', en: 'contact-us' },
    path: { cs: '/kontaktujte-nas', en: '/contact-us' },
    localizedSlugs: {},
  }

  const result = await hook({
    doc: sample,
    operation: 'create',
    req: {},
    collection: { slug: 'pages' },
  })

  expect(result.slug).toEqual({ cs: 'kontaktujte-nas', en: 'contact-us' })
  expect(result.path).toEqual({ cs: '/kontaktujte-nas', en: '/contact-us' })
  expect(result.localizedSlugs).toEqual({
    cs: { slug: 'kontaktujte-nas', fullPath: '/kontaktujte-nas' },
    en: { slug: 'contact-us', fullPath: '/contact-us' },
  })
})
