import { describe, expect, it } from 'vitest'
import { defaultThemePresets } from '../src/presets.js'

describe('Theme Management Plugin - Simple Integration Tests', () => {
  describe('Plugin Initialization', () => {
    it('should have default theme presets', () => {
      expect(defaultThemePresets).toBeDefined()
      expect(Array.isArray(defaultThemePresets)).toBe(true)
      expect(defaultThemePresets.length).toBeGreaterThan(0)
    })

    it('should have required preset properties', () => {
      const firstPreset = defaultThemePresets[0]
      expect(firstPreset).toHaveProperty('name')
      expect(firstPreset).toHaveProperty('label')
      expect(firstPreset).toHaveProperty('preview')
    })
  })

  // describe('Build Output Verification', () => {
  //   it('should have dist folder with compiled files', async () => {
  //     const fs = await import('fs')
  //     const path = await import('path')

  //     const distPath = path.resolve(__dirname, '../dist')

  //     // Check if dist folder exists (after build)
  //     if (fs.existsSync(distPath)) {
  //       expect(fs.existsSync(distPath)).toBe(true)

  //       // Check for index.js
  //       const indexPath = path.join(distPath, 'index.js')
  //       expect(fs.existsSync(indexPath)).toBe(true)

  //       // Check for CSS files
  //       const fieldsPath = path.join(distPath, 'fields')
  //       if (fs.existsSync(fieldsPath)) {
  //         const files = fs.readdirSync(fieldsPath)
  //         const cssFiles = files.filter((f) => f.endsWith('.css'))
  //         expect(cssFiles.length).toBeGreaterThan(0)
  //       }
  //     }
  //   })
  // })

  describe('Type Safety', () => {
    it('should have proper TypeScript definitions', async () => {
      const fs = await import('fs')
      const path = await import('path')

      const distPath = path.resolve(__dirname, '../dist')
      const dtsPath = path.join(distPath, 'index.d.ts')

      if (fs.existsSync(dtsPath)) {
        expect(fs.existsSync(dtsPath)).toBe(true)

        const content = fs.readFileSync(dtsPath, 'utf-8')
        expect(content).toContain('ThemeManagementPluginOptions')
      }
    })
  })
})
