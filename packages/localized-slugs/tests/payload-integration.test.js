import { describe, expect, test } from 'vitest'
import { createPopulateLocalizedSlugsHook } from '../dist/hooks/populateLocalizedSlugs.js'

describe('PayloadCMS Document Lifecycle - Real World Operations', () => {
  const defaultOptions = {
    locales: ['en', 'cs'],
    slugField: 'slug',
    fullPathField: 'fullPath',
    enableLogging: false,
  }

  test('simulates real PayloadCMS document creation', async () => {
    const hook = createPopulateLocalizedSlugsHook(defaultOptions)

    // Simulate a real PayloadCMS document structure
    const mockPayloadDoc = {
      id: '507f1f77bcf86cd799439011',
      title: {
        en: 'Welcome to Our Website',
        cs: 'Vítejte na našich webových stránkách',
      },
      slug: {
        en: 'welcome-to-our-website',
        cs: 'vitejte-na-nasich-webovych-strankach',
      },
      fullPath: {
        en: '/welcome-to-our-website',
        cs: '/vitejte-na-nasich-webovych-strankach',
      },
      localizedSlugs: {}, // Will be populated by hook
      createdAt: '2025-10-30T16:00:00.000Z',
      updatedAt: '2025-10-30T16:00:00.000Z',
    }

    // Simulate PayloadCMS operation context
    const operationContext = {
      doc: mockPayloadDoc,
      operation: 'create',
      req: {
        payload: {
          // Mock payload instance for parent document fetching
          findByID: async () => null, // No parent
        },
      },
      collection: {
        slug: 'pages',
        config: {
          slug: 'pages',
        },
      },
    }

    const result = await hook(operationContext)

    // Verify the document was processed correctly
    expect(result.title.en).toBe('Welcome to Our Website')
    expect(result.title.cs).toBe('Vítejte na našich webových stránkách')

    // Verify slugs are preserved
    expect(result.slug.en).toBe('welcome-to-our-website')
    expect(result.slug.cs).toBe('vitejte-na-nasich-webovych-strankach')

    // Verify full paths are preserved
    expect(result.fullPath.en).toBe('/welcome-to-our-website')
    expect(result.fullPath.cs).toBe('/vitejte-na-nasich-webovych-strankach')

    // Verify localizedSlugs field was populated with existing values
    expect(result.localizedSlugs.en.slug).toBe('welcome-to-our-website')
    expect(result.localizedSlugs.cs.slug).toBe('vitejte-na-nasich-webovych-strankach')
    expect(result.localizedSlugs.en.fullPath).toBe('/welcome-to-our-website')
    expect(result.localizedSlugs.cs.fullPath).toBe('/vitejte-na-nasich-webovych-strankach')
  })

  test('simulates real PayloadCMS document update', async () => {
    const hook = createPopulateLocalizedSlugsHook(defaultOptions)

    // Simulate an existing document being updated
    const existingDoc = {
      id: '507f1f77bcf86cd799439012',
      title: {
        en: 'Old Title',
        cs: 'Starý název',
      },
      slug: {
        en: 'old-title',
        cs: 'stary-nazev',
      },
      fullPath: {
        en: '/old-title',
        cs: '/stary-nazev',
      },
      localizedSlugs: {
        en: { slug: 'old-title', fullPath: '/old-title' },
        cs: { slug: 'stary-nazev', fullPath: '/stary-nazev' },
      },
      createdAt: '2025-10-29T10:00:00.000Z',
      updatedAt: '2025-10-29T10:00:00.000Z',
    }

    const operationContext = {
      doc: existingDoc,
      operation: 'update',
      req: {
        payload: {
          findByID: async () => null,
        },
      },
      collection: {
        slug: 'pages',
        config: {
          slug: 'pages',
        },
      },
    }

    const result = await hook(operationContext)

    // Should preserve existing slugs and fullPaths
    expect(result.slug.en).toBe('old-title')
    expect(result.slug.cs).toBe('stary-nazev')
    expect(result.fullPath.en).toBe('/old-title')
    expect(result.fullPath.cs).toBe('/stary-nazev')
  })

  test('handles hierarchical paths with parent documents', async () => {
    const hook = createPopulateLocalizedSlugsHook({
      ...defaultOptions,
      enableLogging: true,
    })

    const childDoc = {
      id: '507f1f77bcf86cd799439013',
      title: {
        en: 'Child Page',
        cs: 'Podřízená stránka',
      },
      parent: '507f1f77bcf86cd799439014', // Parent document ID
      slug: {
        en: 'child-page',
        cs: 'podrizena-stranka',
      },
      fullPath: {
        en: '/child-page',
        cs: '/podrizena-stranka',
      },
      localizedSlugs: {},
    }

    // Mock parent document with existing paths
    const operationContext = {
      doc: childDoc,
      operation: 'create',
      req: {
        payload: {
          findByID: async ({ id, locale }) => {
            if (id === '507f1f77bcf86cd799439014') {
              // Return parent document with localized fullPath
              return {
                fullPath: {
                  en: '/parent-page',
                  cs: '/rodicovska-stranka',
                },
              }
            }
            return null
          },
        },
      },
      collection: {
        slug: 'pages',
        config: {
          slug: 'pages',
        },
      },
    }

    const result = await hook(operationContext)

    // Should copy existing slug and fullPath values to localizedSlugs
    expect(result.fullPath.en).toBe('/child-page')
    expect(result.fullPath.cs).toBe('/podrizena-stranka')
  })

  test('handles database errors gracefully', async () => {
    const hook = createPopulateLocalizedSlugsHook(defaultOptions)

    const doc = {
      title: {
        en: 'Test Page',
        cs: 'Testovací stránka',
      },
      parent: 'non-existent-parent',
      slug: undefined,
      fullPath: undefined,
      localizedSlugs: {},
    }

    const operationContext = {
      doc,
      operation: 'create',
      req: {
        payload: {
          findByID: async () => {
            throw new Error('Database connection failed')
          },
        },
      },
      collection: {
        slug: 'pages',
        config: {
          slug: 'pages',
        },
      },
    }

    // Should not crash, should handle gracefully when slug/fullPath are undefined
    const result = await hook(operationContext)

    // Since slug and fullPath are undefined, localizedSlugs should have empty strings
    expect(result.slug).toBeUndefined()
    expect(result.fullPath).toBeUndefined()
    expect(result.localizedSlugs).toEqual({
      en: { slug: '', fullPath: '' },
      cs: { slug: '', fullPath: '' },
    })
  })
})
