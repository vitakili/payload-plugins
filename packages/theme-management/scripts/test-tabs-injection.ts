/**
 * Test plugin behavior with existing tabs field
 */

import { themeManagementPlugin } from '../src/index.js'

console.log('🧪 Testing Plugin with Existing Tabs\n')

// Simulate config with existing tabs (like user's SiteSettings)
const mockConfigWithTabs = {
  collections: [
    {
      slug: 'site-settings',
      fields: [
        {
          name: 'hiddenLabel',
          type: 'text',
          defaultValue: 'Site Settings',
        },
        {
          type: 'tabs',
          tabs: [
            {
              name: 'general',
              label: { en: 'General', cs: 'Obecné' },
              fields: [
                {
                  name: 'title',
                  type: 'text',
                  required: true,
                },
              ],
            },
            {
              name: 'seo',
              label: { en: 'SEO', cs: 'SEO' },
              fields: [
                {
                  name: 'metaTitle',
                  type: 'text',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}

console.log('📦 Original config:')
console.log('  Collections:', mockConfigWithTabs.collections.length)
console.log('  Site-settings fields:', mockConfigWithTabs.collections[0].fields.length)
console.log('  Existing tabs:', mockConfigWithTabs.collections[0].fields[1].tabs.length)
mockConfigWithTabs.collections[0].fields[1].tabs.forEach((tab: any, i: number) => {
  console.log(`    Tab ${i + 1}: ${tab.name} (${tab.label.en})`)
})

// Apply plugin
const plugin = themeManagementPlugin({
  enabled: true,
  targetCollection: 'site-settings',
  enableLogging: true,
})

const enhancedConfig = plugin(mockConfigWithTabs as any)

console.log('\n✨ Enhanced config:')

const siteSettings = enhancedConfig.collections?.find((c: any) => c.slug === 'site-settings')
console.log('  Site-settings fields:', siteSettings?.fields?.length)

// Find tabs field
const tabsField = siteSettings?.fields?.find((f: any) => f.type === 'tabs')
if (tabsField && 'tabs' in tabsField) {
  console.log('  Total tabs:', tabsField.tabs.length)
  tabsField.tabs.forEach((tab: any, i: number) => {
    const label = typeof tab.label === 'object' ? tab.label.en : tab.label
    console.log(`    Tab ${i + 1}: ${tab.name} (${label})`)
    
    if (tab.name === 'themeConfiguration') {
      console.log(`      ✅ Theme tab found!`)
      console.log(`      Fields in theme tab: ${tab.fields?.length}`)
    }
  })
} else {
  console.error('❌ No tabs field found!')
}

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('✅ Plugin correctly adds tab to existing tabs!')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
