/**
 * Integration tests for Theme Management Plugin
 * Tests that the plugin works correctly when installed in a real Payload application
 */

import { buildConfig } from 'payload'
import { themeManagementPlugin } from '../../src/index.js'
import { defaultThemePresets } from '../../src/presets.js'

describe('Theme Management Plugin Integration', () => {
  describe('Plugin Configuration', () => {
    it('should create valid Payload config with plugin', async () => {
      const config = await buildConfig({
        secret: 'test-secret',
        db: {
          url: 'mongodb://localhost:27017/test',
        } as any,
        globals: [
          {
            slug: 'site-settings',
            fields: [
              {
                name: 'siteName',
                type: 'text',
              },
            ],
          },
        ],
        plugins: [
          themeManagementPlugin({
            targetCollection: 'site-settings',
            themePresets: defaultThemePresets,
            defaultTheme: 'cool',
          }),
        ],
        typescript: {
          outputFile: false as any,
        },
      })

      expect(config).toBeDefined()
      expect(config.globals).toBeDefined()
      expect(config.globals?.length).toBeGreaterThan(0)
    })

    it('should inject theme configuration field into global', async () => {
      const config = await buildConfig({
        secret: 'test-secret',
        db: {
          url: 'mongodb://localhost:27017/test',
        } as any,
        globals: [
          {
            slug: 'site-settings',
            fields: [
              {
                name: 'siteName',
                type: 'text',
              },
            ],
          },
        ],
        plugins: [
          themeManagementPlugin({
            targetCollection: 'site-settings',
            themePresets: defaultThemePresets,
            defaultTheme: 'cool',
          }),
        ],
        typescript: {
          outputFile: false as any,
        },
      })

      const siteSettings = config.globals?.find((g: any) => g.slug === 'site-settings')
      expect(siteSettings).toBeDefined()
      expect(siteSettings?.fields).toBeDefined()

      const themeField = siteSettings?.fields.find(
        (f: any) => 'name' in f && f.name === 'themeConfiguration'
      )
      expect(themeField).toBeDefined()
    })
  })

  describe('Field Configuration Validation', () => {
    it('should create valid collapsible fields', async () => {
      const config = await buildConfig({
        secret: 'test-secret',
        db: {
          url: 'mongodb://localhost:27017/test',
        } as any,
        globals: [
          {
            slug: 'site-settings',
            fields: [],
          },
        ],
        plugins: [
          themeManagementPlugin({
            targetCollection: 'site-settings',
            themePresets: defaultThemePresets,
            defaultTheme: 'cool',
            includeColorModeToggle: true,
          }),
        ],
        typescript: {
          outputFile: false as any,
        },
      })

      const siteSettings = config.globals?.find((g: any) => g.slug === 'site-settings')
      const themeField = siteSettings?.fields.find(
        (f: any) => 'name' in f && f.name === 'themeConfiguration'
      )

      expect(themeField).toBeDefined()
      expect(themeField?.type).toBe('group')
    })

    it('should have valid label types (string or Record<string, string>)', async () => {
      const config = await buildConfig({
        secret: 'test-secret',
        db: {
          url: 'mongodb://localhost:27017/test',
        } as any,
        globals: [
          {
            slug: 'site-settings',
            fields: [],
          },
        ],
        plugins: [
          themeManagementPlugin({
            targetCollection: 'site-settings',
            themePresets: defaultThemePresets,
            defaultTheme: 'cool',
          }),
        ],
        typescript: {
          outputFile: false as any,
        },
      })

      const siteSettings = config.globals?.find((g: any) => g.slug === 'site-settings')
      const themeField = siteSettings?.fields.find(
        (f: any) => 'name' in f && f.name === 'themeConfiguration'
      ) as any

      expect(themeField).toBeDefined()

      // Check all nested fields have valid labels
      function validateFieldLabels(fields: any[]): void {
        fields.forEach((field) => {
          if ('label' in field && field.label !== undefined && field.label !== false) {
            const labelType = typeof field.label
            const isValidLabel =
              labelType === 'string' ||
              labelType === 'function' ||
              (labelType === 'object' && field.label !== null)

            expect(isValidLabel).toBe(true)
          }

          if ('fields' in field && Array.isArray(field.fields)) {
            validateFieldLabels(field.fields)
          }

          if (field.type === 'tabs' && 'tabs' in field) {
            field.tabs.forEach((tab: any) => {
              if (tab.fields) {
                validateFieldLabels(tab.fields)
              }
            })
          }
        })
      }

      if (themeField?.fields) {
        validateFieldLabels(themeField.fields)
      }
    })

    it('should not have undefined fields in arrays', async () => {
      const config = await buildConfig({
        secret: 'test-secret',
        db: {
          url: 'mongodb://localhost:27017/test',
        } as any,
        globals: [
          {
            slug: 'site-settings',
            fields: [],
          },
        ],
        plugins: [
          themeManagementPlugin({
            targetCollection: 'site-settings',
            themePresets: defaultThemePresets,
            defaultTheme: 'cool',
            includeColorModeToggle: true,
          }),
        ],
        typescript: {
          outputFile: false as any,
        },
      })

      const siteSettings = config.globals?.find((g: any) => g.slug === 'site-settings')
      const themeField = siteSettings?.fields.find(
        (f: any) => 'name' in f && f.name === 'themeConfiguration'
      ) as any

      function checkForUndefinedFields(fields: any[], path = ''): void {
        expect(fields).toBeDefined()
        expect(Array.isArray(fields)).toBe(true)

        fields.forEach((field, index) => {
          const fieldPath = `${path}[${index}]`
          expect(field).toBeDefined()
          expect(field).not.toBeNull()

          // Check for required properties
          if (!('type' in field)) {
            console.error(`Field at ${fieldPath} is missing 'type' property:`, field)
          }
          expect('type' in field).toBe(true)

          if ('fields' in field && field.fields) {
            checkForUndefinedFields(field.fields, `${fieldPath}.fields`)
          }

          if (field.type === 'tabs' && 'tabs' in field) {
            expect(Array.isArray(field.tabs)).toBe(true)
            field.tabs.forEach((tab: any, tabIndex: number) => {
              const tabPath = `${fieldPath}.tabs[${tabIndex}]`
              expect(tab).toBeDefined()
              expect(tab).not.toBeNull()
              if (tab.fields) {
                checkForUndefinedFields(tab.fields, `${tabPath}.fields`)
              }
            })
          }
        })
      }

      if (themeField?.fields) {
        checkForUndefinedFields(themeField.fields, 'themeConfiguration.fields')
      }
    })
  })

  describe('Custom Component Paths', () => {
    it('should have valid component paths', async () => {
      const config = await buildConfig({
        secret: 'test-secret',
        db: {
          url: 'mongodb://localhost:27017/test',
        } as any,
        globals: [
          {
            slug: 'site-settings',
            fields: [],
          },
        ],
        plugins: [
          themeManagementPlugin({
            targetCollection: 'site-settings',
            themePresets: defaultThemePresets,
            defaultTheme: 'cool',
            includeColorModeToggle: true,
          }),
        ],
        typescript: {
          outputFile: false as any,
        },
      })

      const siteSettings = config.globals?.find((g: any) => g.slug === 'site-settings')
      const themeField = siteSettings?.fields.find(
        (f: any) => 'name' in f && f.name === 'themeConfiguration'
      ) as any

      function validateComponentPaths(fields: any[], path = ''): void {
        fields.forEach((field, index) => {
          const fieldPath = `${path}[${index}]`
          if (field?.admin?.components?.Field) {
            const component = field.admin.components.Field
            const isValidComponent =
              typeof component === 'string' ||
              (typeof component === 'object' &&
                component !== null &&
                'path' in component &&
                typeof component.path === 'string')

            if (!isValidComponent) {
              console.error(`Invalid component at ${fieldPath}:`, component)
            }
            expect(isValidComponent).toBe(true)

            // If it's a string, it should be a valid path
            if (typeof component === 'string') {
              expect(component.length).toBeGreaterThan(0)
              // Should not be empty or just whitespace
              expect(component.trim()).toBe(component)
            }
          }

          if ('fields' in field && Array.isArray(field.fields)) {
            validateComponentPaths(field.fields, `${fieldPath}.fields`)
          }
        })
      }

      if (themeField?.fields) {
        validateComponentPaths(themeField.fields, 'themeConfiguration.fields')
      }
    })
  })

  describe('Field Type Validation', () => {
    it('should only use valid Payload field types', async () => {
      const validFieldTypes = [
        'text',
        'textarea',
        'email',
        'number',
        'checkbox',
        'date',
        'group',
        'array',
        'blocks',
        'radio',
        'relationship',
        'select',
        'upload',
        'richText',
        'code',
        'json',
        'point',
        'tabs',
        'collapsible',
        'row',
        'ui',
      ]

      const config = await buildConfig({
        secret: 'test-secret',
        db: {
          url: 'mongodb://localhost:27017/test',
        } as any,
        globals: [
          {
            slug: 'site-settings',
            fields: [],
          },
        ],
        plugins: [
          themeManagementPlugin({
            targetCollection: 'site-settings',
            themePresets: defaultThemePresets,
            defaultTheme: 'cool',
            includeColorModeToggle: true,
            includeCustomCSS: true,
          }),
        ],
        typescript: {
          outputFile: false as any,
        },
      })

      const siteSettings = config.globals?.find((g: any) => g.slug === 'site-settings')
      const themeField = siteSettings?.fields.find(
        (f: any) => 'name' in f && f.name === 'themeConfiguration'
      ) as any

      function validateFieldTypes(fields: any[], path = ''): void {
        fields.forEach((field, index) => {
          const fieldPath = `${path}[${index}]`
          if ('type' in field) {
            if (!validFieldTypes.includes(field.type)) {
              console.error(`Invalid field type at ${fieldPath}:`, field.type)
            }
            expect(validFieldTypes).toContain(field.type)
          }

          if ('fields' in field && Array.isArray(field.fields)) {
            validateFieldTypes(field.fields, `${fieldPath}.fields`)
          }

          if (field.type === 'tabs' && 'tabs' in field) {
            field.tabs.forEach((tab: any, tabIndex: number) => {
              if (tab.fields) {
                validateFieldTypes(tab.fields, `${fieldPath}.tabs[${tabIndex}].fields`)
              }
            })
          }
        })
      }

      if (themeField?.fields) {
        validateFieldTypes(themeField.fields, 'themeConfiguration.fields')
      }
    })
  })
})
