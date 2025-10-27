import { expect, test } from 'vitest'
import localizedSlugsPlugin from '../dist/index.js'

test('plugin injects localizedSlugs field and afterChange hook', () => {
  const options = {
    locales: ['cs', 'en'],
    defaultLocale: 'cs',
    collections: [{ collection: 'pages', generateFromTitle: false }],
    enableLogging: false,
  }

  const plugin = localizedSlugsPlugin(options)
  const mockConfig = {
    collections: [
      {
        slug: 'pages',
        fields: [],
        hooks: { afterChange: [] },
      },
    ],
  }

  const newConfig = plugin(mockConfig)
  const collection = newConfig.collections[0]
  const hasLocalizedField = collection.fields.some((f) => f && f.name === 'localizedSlugs')
  const afterChangeHooks = collection.hooks?.afterChange || []

  expect(hasLocalizedField).toBe(true)
  expect(afterChangeHooks.length).toBeGreaterThan(0)
  expect(typeof afterChangeHooks.at(-1)).toBe('function')
})
