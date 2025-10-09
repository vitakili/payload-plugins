/**
 * Test plugin integration when user's config has tabs
 * This tests if our plugin plays nicely with tabs structure
 */

import { themeManagementPlugin } from '../src/index.js'

console.log('🧪 Testing Plugin with Tabs Structure\n')

// Simulate config with tabs
const mockConfigWithTabs = {
  collections: [
    {
      slug: 'site-settings',
      fields: [
        {
          name: 'siteName',
          type: 'text',
        },
        {
          type: 'tabs',
          tabs: [
            {
              name: 'seo',
              label: 'SEO',
              fields: [
                {
                  name: 'title',
                  type: 'text',
                },
                {
                  name: 'description',
                  type: 'textarea',
                },
              ],
            },
            {
              name: 'social',
              label: 'Social Media',
              fields: [
                {
                  name: 'facebook',
                  type: 'text',
                },
                {
                  name: 'twitter',
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

console.log('📦 Original config with tabs')
console.log('📦 Original site-settings fields:', mockConfigWithTabs.collections[0].fields.length)
console.log('📦 Tabs field has', mockConfigWithTabs.collections[0].fields[1].tabs.length, 'tabs')

// Apply plugin
const plugin = themeManagementPlugin({
  enabled: true,
  targetCollection: 'site-settings',
  enableLogging: true,
})

const enhancedConfig = plugin(mockConfigWithTabs as any)

console.log('\n✨ Enhanced config')

const siteSettings = enhancedConfig.collections?.find((c: any) => c.slug === 'site-settings')
console.log('✨ Enhanced site-settings fields:', siteSettings?.fields?.length)

// Validate all fields
if (siteSettings?.fields) {
  console.log('\n🔍 Validating enhanced fields...\n')
  
  siteSettings.fields.forEach((field: any, index: number) => {
    console.log(`  Field ${index}: type=${field.type}, name=${field.name || 'N/A'}`)
    
    // Check tabs
    if (field.type === 'tabs' && field.tabs) {
      console.log(`    📑 Has ${field.tabs.length} tabs`)
      field.tabs.forEach((tab: any, ti: number) => {
        if (tab === undefined || tab === null) {
          console.error(`    ❌ ERROR: tabs[${ti}] is ${tab}!`)
        } else if (!tab.name) {
          console.error(`    ❌ ERROR: tabs[${ti}] has no name:`, JSON.stringify(tab, null, 2))
        } else {
          console.log(`      Tab ${ti}: name="${tab.name}", fields=${tab.fields?.length || 0}`)
          
          // Check tab fields
          if (tab.fields) {
            tab.fields.forEach((f: any, fi: number) => {
              if (f === undefined || f === null) {
                console.error(`        ❌ ERROR: tabs[${ti}].fields[${fi}] is ${f}!`)
              }
            })
          }
        }
      })
    }
    
    // Check regular fields
    if (field.fields) {
      const hasUndefined = field.fields.some((f: any) => f === undefined || f === null)
      if (hasUndefined) {
        console.error(`    ❌ ERROR: Contains undefined/null fields!`)
      }
    }
  })
}

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('✅ Tabs integration test completed')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
