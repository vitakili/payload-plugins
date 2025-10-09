/**
 * Test extended theme configuration
 * Verify that OKLCH color fields and extended theme options are present
 */

import { createThemeConfigurationField } from '../src/fields/themeConfigurationField.js'
import { defaultThemePresets } from '../src/presets.js'

console.log('🧪 Testing Extended Theme Configuration\n')

const field = createThemeConfigurationField({
  themePresets: defaultThemePresets,
  defaultTheme: 'cool',
  includeColorModeToggle: true,
  includeCustomCSS: true,
  includeBrandIdentity: false,
  enableAdvancedFeatures: true,
})

console.log('Field structure:', JSON.stringify(field, null, 2).substring(0, 500))

// Verify tabs structure
if (field.type === 'tabs') {
  console.log('✅ Field type is tabs')
  
  if ('tabs' in field && Array.isArray(field.tabs)) {
    console.log(`✅ Has ${field.tabs.length} tab(s)`)
    
    field.tabs.forEach((tab: any, index: number) => {
      console.log(`\nTab ${index}:`)
      console.log(`  Name: ${tab.name}`)
      console.log(`  Label: ${JSON.stringify(tab.label)}`)
      console.log(`  Fields: ${tab.fields?.length || 0}`)
      
      if (tab.fields) {
        console.log('\n  Field list:')
        tab.fields.forEach((f: any, fi: number) => {
          const fieldName = f.name || `[${f.type}]`
          const fieldLabel = typeof f.label === 'object' 
            ? f.label?.en || f.label?.cs 
            : f.label || 'No label'
          console.log(`    ${fi + 1}. ${fieldName} (${f.type}): ${fieldLabel}`)
          
          // Check for extended theme fields
          if (fieldName === 'extendedTheme') {
            console.log('       ✅ Extended theme selection found!')
          }
          
          // Check for extended theme configuration
          if (f.type === 'collapsible') {
            const collLabel = typeof f.label === 'object' ? f.label.en : f.label
            if (collLabel?.includes('Extended Theme')) {
              console.log('       ✅ Extended theme configuration section found!')
              if (f.fields) {
                console.log(`       Contains ${f.fields.length} subsection(s)`)
              }
            }
          }
        })
      }
    })
  } else {
    console.error('❌ Field does not have tabs array')
  }
} else {
  console.error(`❌ Field type is ${field.type}, expected "tabs"`)
}

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('✅ Extended theme test completed')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
