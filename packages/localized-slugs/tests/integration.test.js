import { describe, expect, test } from 'vitest'
import localizedSlugsPlugin from '../dist/index.js'

describe('Integration: Localized Slugs Generation', () => {
  test('end-to-end localizedSlugs generation', async () => {
    const options = {
      locales: ['en', 'cs'],
      defaultLocale: 'en',
      collections: [{ collection: 'pages', generateFromTitle: true }],
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
    const afterChangeHook = collection.hooks?.afterChange?.[0]

    // Simulate document creation
    const testDoc = {
      title: { en: 'Hello World', cs: 'Ahoj Svět' },
      slug: undefined,
      fullPath: undefined,
      localizedSlugs: {},
    }

    const result = await afterChangeHook({
      doc: testDoc,
      operation: 'create',
      req: {},
      collection: { slug: 'pages' },
    })

    // Verify localizedSlugs were generated
    expect(result.localizedSlugs).toBeDefined()
    expect(result.localizedSlugs.en).toBeDefined()
    expect(result.localizedSlugs.cs).toBeDefined()
    expect(result.localizedSlugs.en.slug).toBe('hello-world')
    expect(result.localizedSlugs.cs.slug).toBe('ahoj-svet')
    expect(result.localizedSlugs.en.fullPath).toBe('/hello-world')
    expect(result.localizedSlugs.cs.fullPath).toBe('/ahoj-svet')

    // Verify slug and path fields were populated
    expect(result.slug).toEqual({ en: 'hello-world', cs: 'ahoj-svet' })
    expect(result.fullPath).toEqual({ en: '/hello-world', cs: '/ahoj-svet' })
  })

  test('localizedSlugs field is added to collection', () => {
    const options = {
      locales: ['en', 'fr'],
      defaultLocale: 'en',
      collections: [{ collection: 'posts' }],
      enableLogging: false,
    }

    const plugin = localizedSlugsPlugin(options)
    const mockConfig = {
      collections: [
        {
          slug: 'posts',
          fields: [],
        },
      ],
    }

    const newConfig = plugin(mockConfig)
    const collection = newConfig.collections[0]

    // Check that localizedSlugs field was added
    const localizedSlugsField = collection.fields.find((f) => f.name === 'localizedSlugs')
    expect(localizedSlugsField).toBeDefined()
    expect(localizedSlugsField?.type).toBe('group')
  })
})
