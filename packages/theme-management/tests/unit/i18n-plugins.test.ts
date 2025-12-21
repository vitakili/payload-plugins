import { describe, expect, it } from '@jest/globals'
import { themeManagementPlugin } from '../../src/index.js'
import { getTranslations } from '../../src/translations.js'

describe('Theme Management Plugin - i18n integration', () => {
  it('removes existing theme tab with translated label (cs)', () => {
    const mockConfig: any = {
      collections: [
        {
          slug: 'site-settings',
          fields: [
            {
              type: 'tabs',
              tabs: [
                {
                  label: { cs: '🎨 Nastavení vzhledu' },
                  fields: [],
                },
              ],
            },
          ],
        },
      ],
      globals: [],
    }

    const plugin = themeManagementPlugin({ enableLogging: false })
    const result = plugin(mockConfig) as any

    const siteSettings = result.collections.find((c: any) => c.slug === 'site-settings')
    const tabsField = siteSettings.fields.find((f: any) => f.type === 'tabs')

    // There should be exactly one tab matching the plugin tab label (en)
    const expected = getTranslations('en')
    const matchingTabs = (tabsField.tabs || []).filter((t: any) => {
      if (typeof t.label === 'string') return t.label === expected.tabLabel
      return Object.values(t.label || {}).includes(expected.tabLabel)
    })

    expect(matchingTabs.length).toBe(1)
  })

  it('exports translations programmatically', () => {
    const t = getTranslations('cs')
    expect(t.standaloneCollectionLabel).toBeDefined()
    expect(t.livePreview).toBeDefined()
  })
})
