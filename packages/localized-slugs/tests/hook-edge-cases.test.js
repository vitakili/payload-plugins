import { describe, expect, test } from 'vitest'
import { createPopulateLocalizedSlugsHook } from '../dist/hooks/populateLocalizedSlugs.js'

describe('Hook Edge Cases', () => {
  test('handles missing title field gracefully', async () => {
    const hook = createPopulateLocalizedSlugsHook({
      locales: ['en', 'cs'],
      defaultLocale: 'en',
      slugField: 'slug',
      fullPathField: 'path',
      generateFromTitle: true,
      titleField: 'title',
      enableLogging: false,
    })

    const sample = {
      // No title field
      slug: undefined,
      path: undefined,
      localizedSlugs: { en: {}, cs: {} },
    }

    const result = await hook({
      doc: sample,
      operation: 'create',
      req: {},
      collection: { slug: 'pages' },
    })

    // Should not crash, but localizedSlugs might be empty or have defaults
    expect(result).toBeDefined()
    expect(result.localizedSlugs).toBeDefined()
  })

  test('handles invalid locale configurations', async () => {
    const hook = createPopulateLocalizedSlugsHook({
      locales: [], // Empty locales
      defaultLocale: 'en',
      slugField: 'slug',
      fullPathField: 'path',
      generateFromTitle: true,
      titleField: 'title',
      enableLogging: false,
    })

    const sample = {
      title: { en: 'Test' },
      slug: undefined,
      path: undefined,
      localizedSlugs: {},
    }

    const result = await hook({
      doc: sample,
      operation: 'create',
      req: {},
      collection: { slug: 'pages' },
    })

    expect(result).toBeDefined()
  })

  test('handles update operations', async () => {
    const hook = createPopulateLocalizedSlugsHook({
      locales: ['en'],
      slugField: 'slug',
      fullPathField: 'path',
      enableLogging: false,
    })

    const sample = {
      title: { en: 'Updated Title' },
      slug: { en: 'updated-slug' },
      path: { en: '/updated-path' },
      localizedSlugs: {},
    }

    const result = await hook({
      doc: sample,
      operation: 'update',
      req: {},
      collection: { slug: 'pages' },
    })

    // Should copy the existing slug and path values
    expect(result.localizedSlugs.en.slug).toBe('updated-slug')
    expect(result.localizedSlugs.en.fullPath).toBe('/updated-path')
  })

  test('copies existing slug and path values', async () => {
    const hook = createPopulateLocalizedSlugsHook({
      locales: ['en'],
      slugField: 'slug',
      fullPathField: 'path',
      enableLogging: false,
    })

    const sample = {
      title: { en: 'Some Title' },
      slug: { en: 'custom-slug' },
      path: { en: '/custom-path' },
      localizedSlugs: {},
    }

    const result = await hook({
      doc: sample,
      operation: 'create',
      req: {},
      collection: { slug: 'pages' },
    })

    // Should copy the existing slug and path values
    expect(result.slug).toEqual({ en: 'custom-slug' })
    expect(result.path).toEqual({ en: '/custom-path' })
    expect(result.localizedSlugs).toEqual({ en: { slug: 'custom-slug', fullPath: '/custom-path' } })
  })
})
