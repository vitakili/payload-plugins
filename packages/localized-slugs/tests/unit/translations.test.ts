import { availableLanguages, getTranslations, registerTranslations } from '../../src/translations'

describe('localized-slugs translations', () => {
  it('returns English default', () => {
    const t = getTranslations('en')
    expect(t.pluginName).toBe('Localized Slugs')
    expect(t.errors.noLocalesProvided).toMatch(/No locales provided/)
  })

  it('can register and retrieve new translations', () => {
    registerTranslations({
      xx: { pluginName: 'Test XX', errors: { noLocalesProvided: 'Missing locales XX' } },
    })
    const t = getTranslations('xx')
    expect(t.pluginName).toBe('Test XX')
    expect(availableLanguages()).toContain('xx')
  })
})
