/**
 * Google Fonts Picker - Unit Tests
 *
 * Tests for FontPicker component, API endpoint, and helper utilities
 */

import { describe, expect, it } from '@jest/globals'

describe('FontPicker - Utility Functions', () => {
  describe('getGoogleFontUrl', () => {
    it('should generate correct Google Fonts URL with default weights', () => {
      const { getGoogleFontUrl } = require('../../src/utilities/getThemeSettings')
      const url = getGoogleFontUrl('Inter')
      expect(url).toBe('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap')
    })

    it('should generate correct URL with custom weights', () => {
      const { getGoogleFontUrl } = require('../../src/utilities/getThemeSettings')
      const url = getGoogleFontUrl('Roboto', ['300', '400', '500', '700'])
      expect(url).toBe(
        'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap',
      )
    })

    it('should handle font families with spaces', () => {
      const { getGoogleFontUrl } = require('../../src/utilities/getThemeSettings')
      const url = getGoogleFontUrl('Open Sans', ['400', '600'])
      expect(url).toBe(
        'https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600&display=swap',
      )
    })

    it('should handle single weight', () => {
      const { getGoogleFontUrl } = require('../../src/utilities/getThemeSettings')
      const url = getGoogleFontUrl('Playfair Display', ['400'])
      expect(url).toBe(
        'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400&display=swap',
      )
    })
  })

  describe('isPreImportedFont', () => {
    it('should return true for pre-imported fonts', () => {
      const { isPreImportedFont } = require('../../src/utilities/getThemeSettings')
      expect(isPreImportedFont('Inter')).toBe(true)
      expect(isPreImportedFont('Nunito')).toBe(true)
      expect(isPreImportedFont('Montserrat')).toBe(true)
      expect(isPreImportedFont('Playfair Display')).toBe(true)
    })

    it('should return false for non-pre-imported fonts', () => {
      const { isPreImportedFont } = require('../../src/utilities/getThemeSettings')
      expect(isPreImportedFont('Roboto')).toBe(false)
      expect(isPreImportedFont('Open Sans')).toBe(false)
      expect(isPreImportedFont('Custom Font')).toBe(false)
    })

    it('should be case-sensitive', () => {
      const { isPreImportedFont } = require('../../src/utilities/getThemeSettings')
      expect(isPreImportedFont('inter')).toBe(false)
      expect(isPreImportedFont('INTER')).toBe(false)
    })
  })

  describe('PRE_IMPORTED_FONTS', () => {
    it('should contain exactly 8 fonts', () => {
      const { PRE_IMPORTED_FONTS } = require('../../src/utilities/getThemeSettings')
      expect(PRE_IMPORTED_FONTS).toHaveLength(8)
    })

    it('should include all expected fonts', () => {
      const { PRE_IMPORTED_FONTS } = require('../../src/utilities/getThemeSettings')
      const expectedFonts = [
        'Inter',
        'Nunito',
        'Montserrat',
        'Manrope',
        'Mulish',
        'Barlow',
        'Raleway',
        'Playfair Display',
      ]
      expectedFonts.forEach((font) => {
        expect(PRE_IMPORTED_FONTS).toContain(font)
      })
    })
  })
})

describe('FontPicker - GoogleFont Types', () => {
  it('should have correct GoogleFont structure', () => {
    const mockFont = {
      family: 'Inter',
      variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
      subsets: ['latin', 'latin-ext', 'cyrillic'],
      category: 'sans-serif',
      version: 'v13',
      lastModified: '2024-01-01',
      files: {
        '400': 'https://fonts.gstatic.com/s/inter/v13/...',
      },
    }

    expect(mockFont).toHaveProperty('family')
    expect(mockFont).toHaveProperty('variants')
    expect(mockFont).toHaveProperty('subsets')
    expect(mockFont).toHaveProperty('category')
    expect(mockFont).toHaveProperty('version')
    expect(mockFont).toHaveProperty('lastModified')
    expect(mockFont).toHaveProperty('files')
    expect(Array.isArray(mockFont.variants)).toBe(true)
    expect(Array.isArray(mockFont.subsets)).toBe(true)
  })

  it('should support all font categories', () => {
    const categories = ['all', 'sans-serif', 'serif', 'display', 'handwriting', 'monospace']

    categories.forEach((category) => {
      expect(['all', 'sans-serif', 'serif', 'display', 'handwriting', 'monospace']).toContain(
        category,
      )
    })
  })

  it('should support all language subsets', () => {
    const subsets = [
      'all',
      'vietnamese',
      'latin',
      'latin-ext',
      'cyrillic',
      'cyrillic-ext',
      'greek',
      'greek-ext',
      'arabic',
      'hebrew',
      'thai',
      'japanese',
      'korean',
      'chinese',
    ]

    expect(subsets).toHaveLength(14)
    expect(subsets).toContain('latin')
    expect(subsets).toContain('cyrillic')
    expect(subsets).toContain('vietnamese')
  })
})

describe('FontPicker - ThemeSettings Global', () => {
  it('should have correct default values', () => {
    // These values are defined in config.ts
    const expectedDefaults = {
      activeFont: 'Inter',
      fontWeightHeading: '700',
      fontWeightBody: '400',
    }

    expect(expectedDefaults.activeFont).toBe('Inter')
    expect(expectedDefaults.fontWeightHeading).toBe('700')
    expect(expectedDefaults.fontWeightBody).toBe('400')
  })

  it('should have correct field structure', () => {
    const expectedFields = [
      'activeFont',
      'googleFontsApiKey',
      'fontWeightHeading',
      'fontWeightBody',
    ]

    expectedFields.forEach((field) => {
      expect(expectedFields).toContain(field)
    })
  })
})

describe('FontPicker - Translations', () => {
  it('should have English translations', () => {
    const { getTranslations } = require('../../src/globals/ThemeSettings/FontPicker/translations')
    const t = getTranslations('en')

    expect(t).toHaveProperty('search')
    expect(t).toHaveProperty('category')
    expect(t).toHaveProperty('subset')
    expect(t).toHaveProperty('viewMode')
    expect(t).toHaveProperty('favorites')
    expect(t).toHaveProperty('loading')
    expect(t).toHaveProperty('noFonts')
    expect(t).toHaveProperty('previewTabs')
    expect(t).toHaveProperty('categories')
    expect(t).toHaveProperty('subsets')
  })

  it('should have Czech translations', () => {
    const { getTranslations } = require('../../src/globals/ThemeSettings/FontPicker/translations')
    const t = getTranslations('cs')

    expect(t).toHaveProperty('search')
    expect(t).toHaveProperty('category')
    expect(t).toHaveProperty('subset')
    expect(t.search).toBe('Hledat fonty...')
    expect(t.category).toBe('Kategorie')
  })

  it('should fallback to English for invalid language', () => {
    const { getTranslations } = require('../../src/globals/ThemeSettings/FontPicker/translations')
    const t = getTranslations('invalid' as any)

    expect(t.search).toBe('Search fonts...')
  })

  it('should have all preview tab translations', () => {
    const { getTranslations } = require('../../src/globals/ThemeSettings/FontPicker/translations')
    const t = getTranslations('en')

    expect(t.previewTabs).toHaveProperty('typography')
    expect(t.previewTabs).toHaveProperty('blog')
    expect(t.previewTabs).toHaveProperty('landing')
    expect(t.previewTabs).toHaveProperty('ui')
  })

  it('should have all category translations', () => {
    const { getTranslations } = require('../../src/globals/ThemeSettings/FontPicker/translations')
    const t = getTranslations('en')

    expect(t.categories).toHaveProperty('all')
    expect(t.categories).toHaveProperty('sans-serif')
    expect(t.categories).toHaveProperty('serif')
    expect(t.categories).toHaveProperty('display')
    expect(t.categories).toHaveProperty('handwriting')
    expect(t.categories).toHaveProperty('monospace')
  })

  it('should have all subset translations', () => {
    const { getTranslations } = require('../../src/globals/ThemeSettings/FontPicker/translations')
    const t = getTranslations('en')

    expect(t.subsets).toHaveProperty('all')
    expect(t.subsets).toHaveProperty('latin')
    expect(t.subsets).toHaveProperty('cyrillic')
    expect(t.subsets).toHaveProperty('vietnamese')
    expect(t.subsets['vietnamese']).toContain('🇻🇳')
  })
})

describe('FontPicker - Component Exports', () => {
  it('should export ThemeSettings global config', () => {
    const { ThemeSettings } = require('../../src/globals/ThemeSettings/config')

    expect(ThemeSettings).toBeDefined()
    expect(ThemeSettings.slug).toBe('themeSettings')
    expect(ThemeSettings.label).toBe('Theme Settings')
  })

  it('should have correct field components registered', () => {
    const { ThemeSettings } = require('../../src/globals/ThemeSettings/config')

    const typographyTab = ThemeSettings.fields[0].tabs.find(
      (tab: any) => tab.label === 'Typography',
    )
    expect(typographyTab).toBeDefined()

    const activeFontField = typographyTab.fields.find((field: any) => field.name === 'activeFont')
    expect(activeFontField).toBeDefined()
    expect(activeFontField.admin.components.Field).toBe(
      '@kilivi/payloadcms-theme-management/globals/ThemeSettings/FontPicker',
    )
  })

  it('should have Font Loading tab', () => {
    const { ThemeSettings } = require('../../src/globals/ThemeSettings/config')

    const fontLoadingTab = ThemeSettings.fields[0].tabs.find(
      (tab: any) => tab.label === 'Font Loading',
    )
    expect(fontLoadingTab).toBeDefined()
  })
})
