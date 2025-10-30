import { describe, expect, test } from 'vitest'
import { generateSlugFromTitle, isValidSlug } from '../dist/utils/slugUtils.js'

describe('Slug Generation Core Logic', () => {
  describe('generateSlugFromTitle', () => {
    test('basic title to slug conversion', () => {
      expect(generateSlugFromTitle('Hello World')).toBe('hello-world')
      expect(generateSlugFromTitle('Contact Us')).toBe('contact-us')
      expect(generateSlugFromTitle('Test Case')).toBe('test-case')
    })

    test('handles special characters', () => {
      expect(generateSlugFromTitle('Hello & World!')).toBe('hello-world')
      expect(generateSlugFromTitle('Test @#$% Case')).toBe('test-case')
      expect(generateSlugFromTitle('Item #1')).toBe('item-1')
    })

    test('handles diacritics and accented characters', () => {
      expect(generateSlugFromTitle('café')).toBe('cafe')
      expect(generateSlugFromTitle('naïve')).toBe('naive')
      expect(generateSlugFromTitle('résumé')).toBe('resume')
      expect(generateSlugFromTitle('Kontaktujte nás')).toBe('kontaktujte-nas')
      expect(generateSlugFromTitle('Čeština')).toBe('cestina')
    })

    test('handles multiple spaces and hyphens', () => {
      expect(generateSlugFromTitle('Hello   World')).toBe('hello-world')
      expect(generateSlugFromTitle('Test--Case')).toBe('test-case')
      expect(generateSlugFromTitle('Multiple   Spaces   Here')).toBe('multiple-spaces-here')
    })

    test('handles leading/trailing spaces and punctuation', () => {
      expect(generateSlugFromTitle('  Hello World  ')).toBe('hello-world')
      expect(generateSlugFromTitle('-Hello-World-')).toBe('hello-world')
      expect(generateSlugFromTitle('!@#Hello World!@#')).toBe('hello-world')
    })

    test('handles numbers', () => {
      expect(generateSlugFromTitle('Item 123')).toBe('item-123')
      expect(generateSlugFromTitle('Version 2.0')).toBe('version-20')
    })

    test('handles empty and edge cases', () => {
      expect(generateSlugFromTitle('')).toBe('')
      expect(generateSlugFromTitle('   ')).toBe('')
      expect(generateSlugFromTitle('!@#$%')).toBe('')
    })

    test('preserves valid characters', () => {
      expect(generateSlugFromTitle('hello-world')).toBe('hello-world')
      expect(generateSlugFromTitle('test123')).toBe('test123')
      expect(generateSlugFromTitle('valid-slug-123')).toBe('valid-slug-123')
    })

    test('custom diacritics mapping', () => {
      const customMap = { ñ: 'n', ü: 'u' }
      expect(generateSlugFromTitle('señor', customMap)).toBe('senor')
      expect(generateSlugFromTitle('niño', customMap)).toBe('nino')
      expect(generateSlugFromTitle('pingüino', customMap)).toBe('pinguino')
    })
  })

  describe('isValidSlug', () => {
    test('validates correct slug format', () => {
      expect(isValidSlug('hello-world')).toBe(true)
      expect(isValidSlug('test')).toBe(true)
      expect(isValidSlug('test123')).toBe(true)
      expect(isValidSlug('valid-slug-123')).toBe(true)
      expect(isValidSlug('a')).toBe(true)
      expect(isValidSlug('a-b-c')).toBe(true)
    })

    test('rejects invalid slug format', () => {
      expect(isValidSlug('')).toBe(false)
      expect(isValidSlug('hello world')).toBe(false)
      expect(isValidSlug('hello_world')).toBe(false)
      expect(isValidSlug('Hello-World')).toBe(false)
      expect(isValidSlug('-hello')).toBe(false)
      expect(isValidSlug('hello-')).toBe(false)
      expect(isValidSlug('hello--world')).toBe(false)
      expect(isValidSlug('hello@world')).toBe(false)
    })
  })
})
