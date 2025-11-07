import { describe, expect, test } from 'vitest'
import { createPopulateLocalizedSlugsHook } from '../dist/hooks/populateLocalizedSlugs.js'

describe('Localized Slugs Generation - Real World Scenarios', () => {
  const defaultOptions = {
    locales: ['en', 'cs', 'de'],
    slugField: 'slug',
    fullPathField: 'fullPath',
    enableLogging: false,
  }

  test('copies slugs for multiple locales with diacritics', async () => {
    const hook = createPopulateLocalizedSlugsHook(defaultOptions)

    const doc = {
      title: {
        en: 'Contact Us Today',
        cs: 'Kontaktujte nás dnes',
        de: 'Kontaktieren Sie uns heute',
      },
      slug: {
        en: 'contact-us-today',
        cs: 'kontaktujte-nas-dnes',
        de: 'kontaktieren-sie-uns-heute',
      },
      fullPath: {
        en: '/contact-us-today',
        cs: '/kontaktujte-nas-dnes',
        de: '/kontaktieren-sie-uns-heute',
      },
      localizedSlugs: {},
    }

    const result = await hook({
      doc,
      operation: 'create',
      req: { payload: { findByID: async () => null, update: async (data) => data } },
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
      slug: {
        en: 'about-us',
        cs: 'o-nas',
        de: 'about-us', // Manually set for de
      },
      fullPath: {
        en: '/about-us',
        cs: '/o-nas',
        de: '/about-us',
      },
      localizedSlugs: {},
    }

    const result = await hook({
      doc,
      operation: 'create',
      req: { payload: { findByID: async () => null, update: async (data) => data } },
      collection: { slug: 'pages' },
    })

    expect(result.localizedSlugs.en.slug).toBe('about-us')
    expect(result.localizedSlugs.cs.slug).toBe('o-nas')
    expect(result.localizedSlugs.de.slug).toBe('about-us')
  })

  test('copies existing slugs and paths', async () => {
    const hook = createPopulateLocalizedSlugsHook(defaultOptions)

    const doc = {
      title: {
        en: 'Some Title',
        cs: 'Nějaký název',
      },
      slug: {
        en: 'custom-slug-en',
        cs: 'vlastni-slug-cs',
      },
      fullPath: {
        en: '/custom-slug-en',
        cs: '/vlastni-slug-cs',
      },
      localizedSlugs: {},
    }

    const result = await hook({
      doc,
      operation: 'create',
      req: { payload: { findByID: async () => null, update: async (data) => data } },
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
        en: 'updated-slug',
        cs: 'aktualizovany-slug',
      },
      fullPath: {
        en: '/updated-path',
        cs: '/aktualizovany-slug',
      },
      localizedSlugs: {},
    }

    const result = await hook({
      doc,
      operation: 'update',
      req: { payload: { findByID: async () => null, update: async (data) => data } },
      collection: { slug: 'pages' },
    })

    // Should copy the current slug and fullPath values
    expect(result.localizedSlugs.en.slug).toBe('updated-slug')
    expect(result.localizedSlugs.cs.slug).toBe('aktualizovany-slug')
    expect(result.localizedSlugs.en.fullPath).toBe('/updated-path')
    expect(result.localizedSlugs.cs.fullPath).toBe('/aktualizovany-slug')
  })

  test('handles complex titles with special characters', async () => {
    const hook = createPopulateLocalizedSlugsHook(defaultOptions)

    const doc = {
      title: {
        en: 'Café & Restaurant - Best Food in Town!',
        cs: 'Kavárna & Restaurace - Nejlepší jídlo ve městě!',
      },
      slug: {
        en: 'cafe-restaurant-best-food-in-town',
        cs: 'kavarna-restaurace-nejlepsi-jidlo-ve-meste',
      },
      fullPath: {
        en: '/cafe-restaurant-best-food-in-town',
        cs: '/kavarna-restaurace-nejlepsi-jidlo-ve-meste',
      },
      localizedSlugs: {},
    }

    const result = await hook({
      doc,
      operation: 'create',
      req: { payload: { findByID: async () => null, update: async (data) => data } },
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
    })

    const doc = {
      pageTitle: {
        en: 'Custom Fields Test',
        cs: 'Test vlastních polí',
      },
      urlSlug: {
        en: 'custom-fields-test',
        cs: 'test-vlastnich-poli',
      },
      urlPath: {
        en: '/custom-fields-test',
        cs: '/test-vlastnich-poli',
      },
      localizedSlugs: {},
    }

    const result = await hook({
      doc,
      operation: 'create',
      req: { payload: { findByID: async () => null, update: async (data) => data } },
      collection: { slug: 'pages' },
    })

    expect(result.urlSlug.en).toBe('custom-fields-test')
    expect(result.urlSlug.cs).toBe('test-vlastnich-poli')
    expect(result.urlPath.en).toBe('/custom-fields-test')
    expect(result.urlPath.cs).toBe('/test-vlastnich-poli')
  })
})
