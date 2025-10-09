/**
 * Validation script to check field configurations for undefined values
 * This helps prevent the "right-hand side of 'in' should be an object, got undefined" error
 */

import { createThemeConfigurationField } from '../src/fields/themeConfigurationField.js'
import { defaultThemePresets } from '../src/presets.js'
import { lightModeField, darkModeField } from '../src/fields/colorModeFields.js'
import type { Field } from 'payload'

let totalErrors = 0

function validateFields(fields: Field[] | undefined, path = ''): void {
  if (!fields) {
    console.error(`❌ ERROR: Fields array is undefined at ${path}`)
    totalErrors++
    return
  }

  if (!Array.isArray(fields)) {
    console.error(`❌ ERROR: Fields is not an array at ${path}:`, typeof fields)
    totalErrors++
    return
  }

  fields.forEach((fieldItem, index) => {
    const fieldPath = path ? `${path}[${index}]` : `fields[${index}]`

    // Check if field is undefined or null
    if (fieldItem === undefined || fieldItem === null) {
      console.error(`❌ ERROR: Field at ${fieldPath} is ${fieldItem}`)
      totalErrors++
      return
    }

    // Check if field has type property
    if (!('type' in fieldItem)) {
      console.error(`❌ ERROR: Field at ${fieldPath} is missing 'type' property`)
      console.error('Field content:', JSON.stringify(fieldItem, null, 2))
      totalErrors++
      return
    }

    // Validate label
    if ('label' in fieldItem && fieldItem.label !== undefined && fieldItem.label !== false) {
      const label = fieldItem.label
      const labelType = typeof label

      if (labelType !== 'string' && labelType !== 'function' && labelType !== 'object') {
        console.error(`❌ ERROR: Invalid label type at ${fieldPath}: ${labelType}`)
        console.error('Label value:', label)
        totalErrors++
      }
    }

    // Validate admin components
    const anyField = fieldItem as any
    if (anyField?.admin?.components?.Field) {
      const component = anyField.admin.components.Field
      const componentType = typeof component

      if (componentType !== 'string' && (componentType !== 'object' || !component.path)) {
        console.error(`❌ ERROR: Invalid component at ${fieldPath}`)
        console.error('Component value:', component)
        totalErrors++
      }
    }

    // Check for nested fields
    if ('fields' in fieldItem && fieldItem.fields) {
      validateFields(fieldItem.fields as Field[], `${fieldPath}.fields`)
    }

    // Check for tabs
    if ('type' in fieldItem && fieldItem.type === 'tabs' && 'tabs' in fieldItem) {
      const tabsField = fieldItem as any
      if (Array.isArray(tabsField.tabs)) {
        tabsField.tabs.forEach((tab: any, tabIndex: number) => {
          const tabPath = `${fieldPath}.tabs[${tabIndex}]`

          if (tab === undefined || tab === null) {
            console.error(`❌ ERROR: Tab at ${tabPath} is ${tab}`)
            totalErrors++
            return
          }

          if (!tab.name) {
            console.error(`❌ ERROR: Tab at ${tabPath} is missing 'name' property`)
            console.error('Tab content:', JSON.stringify(tab, null, 2))
            totalErrors++
          }

          if (tab.fields) {
            validateFields(tab.fields, `${tabPath}.fields`)
          }
        })
      }
    }
  })
}

console.log('🔍 Validating field configurations...\n')

// Test 1: lightModeField
console.log('📋 Test 1: Validating lightModeField')
if ('fields' in lightModeField && lightModeField.fields) {
  validateFields(lightModeField.fields as Field[], 'lightModeField.fields')
  if (totalErrors === 0) {
    console.log('✅ lightModeField is valid\n')
  }
}

// Test 2: darkModeField
console.log('📋 Test 2: Validating darkModeField')
const darkErrors = totalErrors
if ('fields' in darkModeField && darkModeField.fields) {
  validateFields(darkModeField.fields as Field[], 'darkModeField.fields')
  if (totalErrors === darkErrors) {
    console.log('✅ darkModeField is valid\n')
  }
}

// Test 3: createThemeConfigurationField
console.log('📋 Test 3: Validating createThemeConfigurationField')
const themeErrors = totalErrors
const field = createThemeConfigurationField({
  themePresets: defaultThemePresets,
  defaultTheme: 'cool',
  includeColorModeToggle: true,
  includeCustomCSS: true,
  includeBrandIdentity: false,
  enableAdvancedFeatures: true,
})

if ('fields' in field && field.fields) {
  validateFields(field.fields as Field[], 'themeConfiguration.fields')
  if (totalErrors === themeErrors) {
    console.log('✅ themeConfiguration is valid\n')
  }
}

// Summary
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
if (totalErrors === 0) {
  console.log('✅ ALL FIELD CONFIGURATIONS ARE VALID')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  process.exit(0)
} else {
  console.log(`❌ FOUND ${totalErrors} ERROR(S) IN FIELD CONFIGURATIONS`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  process.exit(1)
}
