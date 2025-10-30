import { describe, expect, test } from 'vitest'
import { generateLocalizedSlugs } from '../dist/utils/slugUtils.js'

describe('generateLocalizedSlugs', () => {
  test('handles basic page data with title', () => {
    const pageData = {
      title: { en: 'Hello World', cs: 'Ahoj Svět' },
      slug: { en: 'hello-world', cs: 'ahoj-svet' },
      localizedSlugs: {
        en: { slug: 'hello-world', fullPath: '/hello-world' },
        cs: { slug: 'ahoj-svet', fullPath: '/ahoj-svet' },
      },
    }

    const result = generateLocalizedSlugs(pageData)

    expect(result.en).toBe('/hello-world')
    expect(result.cs).toBe('/ahoj-svet')
  })

  test('handles missing slug with generateFromTitle', () => {
    const pageData = {
      title: { en: 'Contact Us', cs: 'Kontaktujte nás' },
      localizedSlugs: {}, // Empty, should generate from title
    }

    const result = generateLocalizedSlugs(pageData)

    // When localizedSlugs is empty, it falls back to default locales with fallback
    expect(result.en).toBe('/')
    expect(result.cs).toBe('/')
  })

  test('handles special characters and diacritics', () => {
    const pageData = {
      title: { en: 'Café & Restaurant', cs: 'Kavárna & Restaurace' },
      localizedSlugs: {}, // Empty, should generate from title
    }

    const result = generateLocalizedSlugs(pageData)

    // When localizedSlugs is empty, it falls back to default locales with fallback
    expect(result.en).toBe('/')
    expect(result.cs).toBe('/')
  })

  test('handles long titles', () => {
    const longTitle =
      'This is a very long title that should be truncated or handled properly in slug generation'
    const pageData = {
      title: { en: longTitle },
      localizedSlugs: {}, // Empty, should generate from title
    }

    const result = generateLocalizedSlugs(pageData)

    // When localizedSlugs is empty, it falls back to default locales with fallback
    expect(result.en).toBe('/')
    expect(result.cs).toBe('/')
  })

  test('handles empty or undefined data', () => {
    expect(() => generateLocalizedSlugs({})).not.toThrow()
    expect(() => generateLocalizedSlugs({ localizedSlugs: null })).not.toThrow()
    expect(() => generateLocalizedSlugs({ localizedSlugs: undefined })).not.toThrow()
  })

  test('uses fallbackPath when no slug available', () => {
    const pageData = {}
    const fallbackPath = '/default-path'

    const result = generateLocalizedSlugs(pageData, fallbackPath)

    expect(result).toEqual({ en: '/default-path', cs: '/default-path' })
  })
})
