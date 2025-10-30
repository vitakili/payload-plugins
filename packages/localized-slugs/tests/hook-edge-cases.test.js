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
      defaultLocale: 'en',
      slugField: 'slug',
      fullPathField: 'path',
      generateFromTitle: true,
      titleField: 'title',
      enableLogging: false,
    })

    const sample = {
      title: { en: 'Updated Title' },
      slug: 'old-slug',
      path: '/old-path',
      localizedSlugs: { en: { slug: 'old-slug', fullPath: '/old-path' } },
    }

    const result = await hook({
      doc: sample,
      operation: 'update',
      req: {},
      collection: { slug: 'pages' },
    })

    // Should update the slugs
    expect(result.localizedSlugs.en.slug).toBe('updated-title')
    expect(result.localizedSlugs.en.fullPath).toBe('/updated-title')
  })

  test('respects existing slugs when not generating from title', async () => {
    const hook = createPopulateLocalizedSlugsHook({
      locales: ['en'],
      defaultLocale: 'en',
      slugField: 'slug',
      fullPathField: 'path',
      generateFromTitle: false, // Don't generate from title
      titleField: 'title',
      enableLogging: false,
    })

    const sample = {
      title: { en: 'Some Title' },
      slug: 'custom-slug',
      path: '/custom-path',
      localizedSlugs: { en: {} },
    }

    const result = await hook({
      doc: sample,
      operation: 'create',
      req: {},
      collection: { slug: 'pages' },
    })

    // Should use the existing slug values and generate path from slug
    expect(result.slug).toEqual({ en: 'custom-slug' })
    expect(result.path).toEqual({ en: '/custom-slug' })
  })
})
