/**
 * Deep inspection script to find potential undefined values or conditional returns
 */

import { createThemeConfigurationField } from '../src/fields/themeConfigurationField.js'
import { defaultThemePresets } from '../src/presets.js'
import type { Field } from 'payload'

console.log('🔍 Deep Field Structure Inspection\n')

const field = createThemeConfigurationField({
  themePresets: defaultThemePresets,
  defaultTheme: 'cool',
  includeColorModeToggle: true,
  includeCustomCSS: true,
  includeBrandIdentity: false,
  enableAdvancedFeatures: true,
})

function inspectField(field: any, path: string, depth = 0): void {
  const indent = '  '.repeat(depth)
  
  console.log(`${indent}${path}:`)
  console.log(`${indent}  type: ${field.type}`)
  
  if (field.name) {
    console.log(`${indent}  name: ${field.name}`)
  }
  
  if (field.label) {
    const labelType = typeof field.label
    console.log(`${indent}  label: ${labelType === 'object' ? JSON.stringify(field.label) : field.label}`)
  }
  
  // Check for tabs
  if (field.tabs) {
    console.log(`${indent}  tabs: [${field.tabs.length} items]`)
    field.tabs.forEach((tab: any, index: number) => {
      if (tab === undefined || tab === null) {
        console.error(`${indent}    ❌ tabs[${index}] is ${tab}!`)
      } else {
        console.log(`${indent}    tabs[${index}]: name="${tab.name || 'NO NAME'}"`)
        if (tab.fields) {
          tab.fields.forEach((f: any, fi: number) => {
            if (f === undefined || f === null) {
              console.error(`${indent}      ❌ tabs[${index}].fields[${fi}] is ${f}!`)
            }
          })
        }
      }
    })
  }
  
  // Check for fields array
  if (field.fields && Array.isArray(field.fields)) {
    console.log(`${indent}  fields: [${field.fields.length} items]`)
    field.fields.forEach((f: any, index: number) => {
      if (f === undefined || f === null) {
        console.error(`${indent}    ❌ fields[${index}] is ${f}!`)
      } else if (depth < 3) { // Limit recursion depth
        inspectField(f, `${path}.fields[${index}]`, depth + 1)
      } else {
        console.log(`${indent}    fields[${index}]: type=${f.type}, name=${f.name || 'NO NAME'}`)
      }
    })
  }
  
  console.log()
}

inspectField(field, 'themeConfiguration', 0)
