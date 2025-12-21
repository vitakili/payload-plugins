import { describe, expect, it } from '@jest/globals'
import { availableLanguages, getTranslations, registerTranslations } from '../../src/translations'

describe('translations registry', () => {
  it('allows registering new language and merges with english fallback', () => {
    // register a tiny german translation
    registerTranslations({
      de: {
        tabLabel: 'Erscheinungsbild',
        standaloneCollectionLabel: 'Erscheinungsbild',
      },
    })

    const langs = availableLanguages()
    expect(langs).toContain('de')

    const tDe = getTranslations('de')
    expect(tDe.tabLabel).toBe('Erscheinungsbild')

    // fallback to English for missing nested fields
    expect(tDe.preview.welcomeTitle).toBe(getTranslations('en').preview.welcomeTitle)
  })
})
