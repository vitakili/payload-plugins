import { describe, expect, test } from 'vitest'
import { createPopulateLocalizedSlugsHook } from '../dist/hooks/populateLocalizedSlugs.js'

describe('Localized Slugs Generation - Real World Scenarios', () => {
  const defaultOptions = {
    locales: ['en', 'cs', 'de'],
    defaultLocale: 'en',
    slugField: 'slug',
    fullPathField: 'fullPath',
    generateFromTitle: true,
    titleField: 'title',
    enableLogging: false,
    customDiacriticsMap: {},
  }

  test('generates slugs for multiple locales with diacritics', async () => {
    const hook = createPopulateLocalizedSlugsHook(defaultOptions)

    const doc = {
      title: {
        en: 'Contact Us Today',
        cs: 'Kontaktujte nás dnes',
        de: 'Kontaktieren Sie uns heute',
      },
      slug: undefined,
      fullPath: undefined,
      localizedSlugs: { en: {}, cs: {}, de: {} },
    }

    const result = await hook({
      doc,
      operation: 'create',
      req: {},
      collection: { slug: 'pages' },
    })

    expect(result.localizedSlugs.en.slug).toBe('contact-us-today')
    expect(result.localizedSlugs.cs.slug).toBe('kontaktujte-nas-dnes')
    expect(result.localizedSlugs.de.slug).toBe('kontaktieren-sie-uns-heute')

    expect(result.localizedSlugs.en.fullPath).toBe('/contact-us-today')
    expect(result.localizedSlugs.cs.fullPath).toBe('/kontaktujte-nas-dnes')
    expect(result.localizedSlugs.de.fullPath).toBe('/kontaktieren-sie-uns-heute')
  })

  test('handles missing title for some locales', async () => {
    const hook = createPopulateLocalizedSlugsHook(defaultOptions)

    const doc = {
      title: {
        en: 'About Us',
        cs: 'O nás', // Missing de title
      },
      slug: undefined,
      fullPath: undefined,
      localizedSlugs: { en: {}, cs: {}, de: {} },
    }

    const result = await hook({
      doc,
      operation: 'create',
      req: {},
      collection: { slug: 'pages' },
    })

    expect(result.localizedSlugs.en.slug).toBe('about-us')
    expect(result.localizedSlugs.cs.slug).toBe('o-nas')
    expect(result.localizedSlugs.de.slug).toBe('about-us') // Falls back to default locale
  })

  test('respects existing slugs when not generating from title', async () => {
    const hook = createPopulateLocalizedSlugsHook({
      ...defaultOptions,
      generateFromTitle: false,
    })

    const doc = {
      title: {
        en: 'Some Title',
        cs: 'Nějaký název',
      },
      slug: {
        en: 'custom-slug-en',
        cs: 'vlastni-slug-cs',
      },
      fullPath: undefined,
      localizedSlugs: { en: {}, cs: {} },
    }

    const result = await hook({
      doc,
      operation: 'create',
      req: {},
      collection: { slug: 'pages' },
    })

    expect(result.localizedSlugs.en.slug).toBe('custom-slug-en')
    expect(result.localizedSlugs.cs.slug).toBe('vlastni-slug-cs')
    expect(result.localizedSlugs.en.fullPath).toBe('/custom-slug-en')
    expect(result.localizedSlugs.cs.fullPath).toBe('/vlastni-slug-cs')
  })

  test('handles update operations correctly', async () => {
    const hook = createPopulateLocalizedSlugsHook(defaultOptions)

    const doc = {
      title: {
        en: 'Updated Title',
        cs: 'Aktualizovaný název',
      },
      slug: {
        en: 'old-slug',
        cs: 'stary-slug',
      },
      fullPath: {
        en: '/old-path',
        cs: '/stary-slug',
      },
      localizedSlugs: {
        en: { slug: 'old-slug', fullPath: '/old-path' },
        cs: { slug: 'stary-slug', fullPath: '/stary-slug' },
      },
    }

    const result = await hook({
      doc,
      operation: 'update',
      req: {},
      collection: { slug: 'pages' },
    })

    // Should regenerate based on title
    expect(result.localizedSlugs.en.slug).toBe('updated-title')
    expect(result.localizedSlugs.cs.slug).toBe('aktualizovany-nazev')
    expect(result.localizedSlugs.en.fullPath).toBe('/updated-title')
    expect(result.localizedSlugs.cs.fullPath).toBe('/aktualizovany-nazev')
  })

  test('handles complex titles with special characters', async () => {
    const hook = createPopulateLocalizedSlugsHook(defaultOptions)

    const doc = {
      title: {
        en: 'Café & Restaurant - Best Food in Town!',
        cs: 'Kavárna & Restaurace - Nejlepší jídlo ve městě!',
      },
      slug: undefined,
      fullPath: undefined,
      localizedSlugs: { en: {}, cs: {} },
    }

    const result = await hook({
      doc,
      operation: 'create',
      req: {},
      collection: { slug: 'pages' },
    })

    expect(result.localizedSlugs.en.slug).toBe('cafe-restaurant-best-food-in-town')
    expect(result.localizedSlugs.cs.slug).toBe('kavarna-restaurace-nejlepsi-jidlo-ve-meste')
  })

  test('works with custom field names', async () => {
    const hook = createPopulateLocalizedSlugsHook({
      ...defaultOptions,
      slugField: 'urlSlug',
      fullPathField: 'urlPath',
      titleField: 'pageTitle',
    })

    const doc = {
      pageTitle: {
        en: 'Custom Fields Test',
        cs: 'Test vlastních polí',
      },
      urlSlug: undefined,
      urlPath: undefined,
      localizedSlugs: { en: {}, cs: {} },
    }

    const result = await hook({
      doc,
      operation: 'create',
      req: {},
      collection: { slug: 'pages' },
    })

    expect(result.urlSlug.en).toBe('custom-fields-test')
    expect(result.urlSlug.cs).toBe('test-vlastnich-poli')
    expect(result.urlPath.en).toBe('/custom-fields-test')
    expect(result.urlPath.cs).toBe('/test-vlastnich-poli')
  })
})
