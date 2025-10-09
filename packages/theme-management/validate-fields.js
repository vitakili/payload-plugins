/**
 * Validation Script: Check for Duplicate Field Names
 * Run this before publishing to ensure no duplicate fields
 */

import { createThemeConfigurationField } from './dist/fields/themeConfigurationField.js'
import { defaultThemePresets } from './dist/presets.js'

function getAllFieldNames(fields, path = '') {
  const names = []

  for (const field of fields) {
    if ('name' in field) {
      const fullPath = path ? `${path}.${field.name}` : field.name
      names.push(fullPath)
    }

    // Check nested fields
    if ('fields' in field && Array.isArray(field.fields)) {
      const nestedPath = 'name' in field ? `${path ? path + '.' : ''}${field.name}` : path
      names.push(...getAllFieldNames(field.fields, nestedPath))
    }

    // Check tabs
    if ('type' in field && field.type === 'tabs' && 'tabs' in field) {
      for (const tab of field.tabs) {
        if ('fields' in tab) {
          const tabPath = 'name' in tab ? `${path ? path + '.' : ''}${tab.name}` : path
          names.push(...getAllFieldNames(tab.fields, tabPath))
        }
      }
    }

    // Check collapsible
    if ('type' in field && field.type === 'collapsible' && 'fields' in field) {
      names.push(...getAllFieldNames(field.fields, path))
    }

    // Check groups
    if ('type' in field && field.type === 'group' && 'fields' in field) {
      const groupPath = 'name' in field ? `${path ? path + '.' : ''}${field.name}` : path
      names.push(...getAllFieldNames(field.fields, groupPath))
    }
  }

  return names
}

function findDuplicates(arr) {
  const counts = new Map()
  for (const item of arr) {
    counts.set(item, (counts.get(item) || 0) + 1)
  }
  return Array.from(counts.entries())
    .filter(([, count]) => count > 1)
    .map(([name]) => name)
}

console.log('🔍 Validating Theme Management Plugin Configuration...\n')

try {
  // Test with all features enabled
  const config = createThemeConfigurationField({
    themePresets: defaultThemePresets,
    defaultTheme: 'cool',
    includeColorModeToggle: true,
    includeCustomCSS: true,
    includeBrandIdentity: true,
    enableAdvancedFeatures: true,
  })

  console.log('📋 Theme Configuration Tab:', config.name)
  console.log('📝 Fields count:', config.fields.length)

  const fieldNames = getAllFieldNames(config.fields)
  console.log('🏷️  Total field names found:', fieldNames.length)

  const duplicates = findDuplicates(fieldNames)

  if (duplicates.length > 0) {
    console.error('\n❌ DUPLICATE FIELD NAMES DETECTED:')
    for (const dup of duplicates) {
      console.error(`   - ${dup}`)
    }
    process.exit(1)
  } else {
    console.log('\n✅ No duplicate field names found!')
    console.log('✅ All fields have unique names')
    console.log('\n🎉 Validation PASSED!\n')
  }

  // Show field structure
  console.log('📊 Field Structure:')
  const uniqueFields = new Set(fieldNames.map((name) => name.split('.')[0]))
  console.log('   Top-level fields:', Array.from(uniqueFields).join(', '))
} catch (error) {
  console.error('\n❌ Validation FAILED:')
  console.error(error)
  process.exit(1)
}
