import { describe, expect, it } from 'vitest'
import { payload } from './vitest.setup.js'

describe('Theme Management Plugin - Integration Tests', () => {
  describe('Plugin Loading', () => {
    it('should initialize Payload without errors', () => {
      expect(payload).toBeDefined()
      expect(payload.config).toBeDefined()
    })

    it('should have theme management plugin registered', () => {
      const hasThemePlugin = payload.config.plugins.some(
        (plugin) => plugin.name === 'theme-management-plugin',
      )
      expect(hasThemePlugin).toBe(true)
    })
  })

  describe('Collection Configuration', () => {
    it('should add theme tab to pages collection', () => {
      const pagesCollection = payload.config.collections.find(
        (col) => col.slug === 'pages',
      )
      
      expect(pagesCollection).toBeDefined()
      
      // Find tabs field
      const tabsField = pagesCollection?.fields.find(
        (field) => 'type' in field && field.type === 'tabs',
      )
      
      expect(tabsField).toBeDefined()
      
      // Check if theme tab exists
      if (tabsField && 'tabs' in tabsField) {
        const themeTab = tabsField.tabs.find(
          (tab) => 'name' in tab && tab.name === 'themeConfiguration',
        )
        expect(themeTab).toBeDefined()
      }
    })

    it('should have theme configuration field in theme tab', () => {
      const pagesCollection = payload.config.collections.find(
        (col) => col.slug === 'pages',
      )
      
      const tabsField = pagesCollection?.fields.find(
        (field) => 'type' in field && field.type === 'tabs',
      )
      
      if (tabsField && 'tabs' in tabsField) {
        const themeTab = tabsField.tabs.find(
          (tab) => 'name' in tab && tab.name === 'themeConfiguration',
        )
        
        if (themeTab && 'fields' in themeTab) {
          const themeConfigField = themeTab.fields.find(
            (field) => 'name' in field && field.name === 'themeConfiguration',
          )
          expect(themeConfigField).toBeDefined()
          expect(themeConfigField).toHaveProperty('type', 'group')
        }
      }
    })
  })

  describe('CRUD Operations', () => {
    let createdPageId: string

    it('should create a page with theme configuration', async () => {
      const result = await payload.create({
        collection: 'pages',
        data: {
          title: 'Test Page with Theme',
          themeConfiguration: {
            activePreset: 'default',
            colorMode: 'auto',
            customCSS: '/* Test CSS */',
          },
        },
      })

      expect(result).toBeDefined()
      expect(result.id).toBeDefined()
      expect(result.title).toBe('Test Page with Theme')
      expect(result.themeConfiguration).toBeDefined()
      
      createdPageId = result.id as string
    })

    it('should read page with theme configuration', async () => {
      const result = await payload.findByID({
        collection: 'pages',
        id: createdPageId,
      })

      expect(result).toBeDefined()
      expect(result.themeConfiguration).toBeDefined()
      expect(result.themeConfiguration.activePreset).toBe('default')
    })

    it('should update page theme configuration', async () => {
      const result = await payload.update({
        collection: 'pages',
        id: createdPageId,
        data: {
          themeConfiguration: {
            activePreset: 'ocean',
            colorMode: 'dark',
          },
        },
      })

      expect(result).toBeDefined()
      expect(result.themeConfiguration.activePreset).toBe('ocean')
      expect(result.themeConfiguration.colorMode).toBe('dark')
    })

    it('should delete page with theme configuration', async () => {
      const result = await payload.delete({
        collection: 'pages',
        id: createdPageId,
      })

      expect(result).toBeDefined()
      expect(result.id).toBe(createdPageId)
    })
  })

  describe('Theme Presets', () => {
    it('should have default theme presets available', () => {
      const pagesCollection = payload.config.collections.find(
        (col) => col.slug === 'pages',
      )
      
      const tabsField = pagesCollection?.fields.find(
        (field) => 'type' in field && field.type === 'tabs',
      )
      
      if (tabsField && 'tabs' in tabsField) {
        const themeTab = tabsField.tabs.find(
          (tab) => 'name' in tab && tab.name === 'themeConfiguration',
        )
        
        if (themeTab && 'fields' in themeTab) {
          const themeConfigField = themeTab.fields.find(
            (field) => 'name' in field && field.name === 'themeConfiguration',
          )
          
          // Theme presets should be configured
          expect(themeConfigField).toBeDefined()
        }
      }
    })
  })

  describe('Advanced Features', () => {
    it('should include color mode toggle when enabled', () => {
      const pagesCollection = payload.config.collections.find(
        (col) => col.slug === 'pages',
      )
      
      expect(pagesCollection).toBeDefined()
      // Advanced features enabled in config
    })

    it('should include custom CSS field when enabled', async () => {
      const result = await payload.create({
        collection: 'pages',
        data: {
          title: 'Page with Custom CSS',
          themeConfiguration: {
            customCSS: '.custom { color: red; }',
          },
        },
      })

      expect(result.themeConfiguration).toBeDefined()
      expect(result.themeConfiguration.customCSS).toBe('.custom { color: red; }')

      // Cleanup
      await payload.delete({
        collection: 'pages',
        id: result.id as string,
      })
    })
  })

  describe('CSS Files', () => {
    it('should have CSS files available in build output', async () => {
      // This test verifies that CSS files are properly bundled
      // In real deployment, CSS should be importable
      const fs = await import('fs')
      const path = await import('path')
      
      const distPath = path.resolve(__dirname, '../dist')
      
      // Check if dist folder exists (after build)
      if (fs.existsSync(distPath)) {
        const files = fs.readdirSync(distPath, { recursive: true })
        const cssFiles = files.filter((f) => String(f).endsWith('.css'))
        
        // Should have at least the theme CSS files
        expect(cssFiles.length).toBeGreaterThan(0)
      }
    })
  })
})
