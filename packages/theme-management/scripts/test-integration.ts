/**
 * Test plugin integration in a realistic Payload config structure
 * This simulates how the plugin is used in a real application
 */

import { themeManagementPlugin } from '../src/index.js'

console.log('🧪 Testing Plugin Integration\n')

// Simulate a typical Payload config
const mockConfig = {
  collections: [
    {
      slug: 'site-settings',
      fields: [
        {
          name: 'siteName',
          type: 'text',
          required: true,
        },
        {
          name: 'seo',
          type: 'group',
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
      ],
    },
    {
      slug: 'pages',
      fields: [
        {
          name: 'title',
          type: 'text',
        },
      ],
    },
  ],
}

console.log('📦 Original config collections:', mockConfig.collections.length)
console.log('📦 Original site-settings fields:', mockConfig.collections[0].fields.length)

// Apply plugin
const plugin = themeManagementPlugin({
  enabled: true,
  targetCollection: 'site-settings',
  enableLogging: true,
})

const enhancedConfig = plugin(mockConfig as any)

console.log('\n✨ Enhanced config collections:', enhancedConfig.collections?.length)

const siteSettings = enhancedConfig.collections?.find((c: any) => c.slug === 'site-settings')
console.log('✨ Enhanced site-settings fields:', siteSettings?.fields?.length)

// Deep validation
if (siteSettings?.fields) {
  console.log('\n🔍 Validating enhanced fields...\n')
  
  siteSettings.fields.forEach((field: any, index: number) => {
    console.log(`  Field ${index}:`)
    console.log(`    type: ${field.type}`)
    console.log(`    name: ${field.name || 'N/A'}`)
    
    // Check if this is our theme field
    if (field.name === 'themeConfiguration') {
      console.log(`    ✅ Theme configuration field found!`)
      console.log(`    fields count: ${field.fields?.length || 0}`)
      
      // Validate each nested field
      if (field.fields) {
        field.fields.forEach((nestedField: any, ni: number) => {
          if (nestedField === undefined || nestedField === null) {
            console.error(`    ❌ ERROR: field.fields[${ni}] is ${nestedField}`)
          } else if (!nestedField.type) {
            console.error(`    ❌ ERROR: field.fields[${ni}] has no type:`, nestedField)
          }
        })
      }
    }
    console.log()
  })
}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('✅ Plugin integration test completed')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
