import { describe, expect, it } from '@jest/globals'
import { lightModeDefaults } from '../../src/fields/colorModeFields.js'
import { defaultThemePresets } from '../../src/presets.js'
import { getAllTweakCNPresets } from '../../src/utils/tweakcnConverter.js'

describe('TweakCN Theme Compatibility', () => {
  const colorKeys = Object.keys(lightModeDefaults) as Array<keyof typeof lightModeDefaults>
  const tweakcnPresets = getAllTweakCNPresets()

  describe('Converter Output', () => {
    it('should convert all TweakCN presets', () => {
      expect(tweakcnPresets.length).toBeGreaterThan(0)
      console.log(`✓ Converted ${tweakcnPresets.length} TweakCN themes`)
    })

    it('should have all required properties', () => {
      tweakcnPresets.forEach((preset) => {
        expect(preset).toHaveProperty('name')
        expect(preset).toHaveProperty('label')
        expect(preset).toHaveProperty('borderRadius')
        expect(preset).toHaveProperty('lightMode')
        expect(preset).toHaveProperty('darkMode')
        expect(preset).toHaveProperty('preview')
      })
    })
  })

  describe('Color Token Completeness', () => {
    it('should have all required color tokens in lightMode', () => {
      const missingTokens: Array<{ preset: string; missing: string[] }> = []

      tweakcnPresets.forEach((preset) => {
        const missing = colorKeys.filter((key) => !preset.lightMode?.[key])
        if (missing.length > 0) {
          missingTokens.push({ preset: preset.name, missing })
        }
      })

      if (missingTokens.length > 0) {
        console.log('Missing lightMode tokens:')
        missingTokens.forEach(({ preset, missing }) => {
          console.log(`  ${preset}: ${missing.join(', ')}`)
        })
      }

      expect(missingTokens).toEqual([])
    })

    it('should have all required color tokens in darkMode', () => {
      const missingTokens: Array<{ preset: string; missing: string[] }> = []

      tweakcnPresets.forEach((preset) => {
        const missing = colorKeys.filter((key) => !preset.darkMode?.[key])
        if (missing.length > 0) {
          missingTokens.push({ preset: preset.name, missing })
        }
      })

      if (missingTokens.length > 0) {
        console.log('Missing darkMode tokens:')
        missingTokens.forEach(({ preset, missing }) => {
          console.log(`  ${preset}: ${missing.join(', ')}`)
        })
      }

      expect(missingTokens).toEqual([])
    })
  })

  describe('Comparison with Working Themes', () => {
    const realEstateGold = defaultThemePresets.find((p) => p.name === 'real-estate-gold')
    const firstTweakcn = tweakcnPresets[0]

    it('should have same structure as working theme (Real Estate Gold)', () => {
      expect(realEstateGold).toBeDefined()
      expect(firstTweakcn).toBeDefined()

      if (!realEstateGold || !firstTweakcn) return

      // Both should have the same color keys
      const realEstateKeys = Object.keys(realEstateGold.lightMode ?? {}).sort()
      const tweakcnKeys = Object.keys(firstTweakcn.lightMode ?? {}).sort()

      console.log('Real Estate Gold lightMode keys:', realEstateKeys)
      console.log('TweakCN lightMode keys:', tweakcnKeys)

      expect(tweakcnKeys).toEqual(realEstateKeys)
    })

    it('should have valid color values (HEX format like Real Estate Gold)', () => {
      tweakcnPresets.slice(0, 5).forEach((preset) => {
        colorKeys.forEach((key) => {
          const lightValue = preset.lightMode?.[key]
          const darkValue = preset.darkMode?.[key]

          // Color values should be strings in HEX format (like Real Estate Gold)
          expect(typeof lightValue).toBe('string')
          expect(typeof darkValue).toBe('string')

          // Should be valid HEX colors (#RRGGBB)
          expect(lightValue).toMatch(/^#[0-9a-f]{6}$/i)
          expect(darkValue).toMatch(/^#[0-9a-f]{6}$/i)
        })
      })
    })
  })

  describe('Preview Colors', () => {
    it('should have valid preview colors', () => {
      tweakcnPresets.forEach((preset) => {
        expect(preset.preview).toBeDefined()
        expect(preset.preview?.colors).toBeDefined()
        expect(preset.preview?.colors.primary).toBeDefined()
        expect(preset.preview?.colors.background).toBeDefined()
        expect(preset.preview?.colors.accent).toBeDefined()

        // Preview colors should be valid CSS colors (hsl)
        const primary = preset.preview?.colors.primary ?? ''
        const background = preset.preview?.colors.background ?? ''
        const accent = preset.preview?.colors.accent ?? ''

        expect(primary).toMatch(/^(hsl\(|#)/)
        expect(background).toMatch(/^(hsl\(|#)/)
        expect(accent).toMatch(/^(hsl\(|#)/)
      })
    })
  })

  describe('Border Radius', () => {
    it('should have valid borderRadius values', () => {
      const validRadii = ['none', 'small', 'medium', 'large', 'xl']

      tweakcnPresets.forEach((preset) => {
        expect(validRadii).toContain(preset.borderRadius)
      })
    })
  })

  describe('Sample TweakCN Theme Structure', () => {
    it('should log first TweakCN theme for inspection', () => {
      const first = tweakcnPresets[0]
      if (!first) return

      console.log('\n📋 Sample TweakCN Theme Structure:')
      console.log('Name:', first.name)
      console.log('Label:', first.label)
      console.log('Border Radius:', first.borderRadius)
      console.log('\nLight Mode Colors:')
      Object.entries(first.lightMode ?? {}).forEach(([key, value]) => {
        console.log(`  ${key}: ${value}`)
      })
      console.log('\nDark Mode Colors:')
      Object.entries(first.darkMode ?? {}).forEach(([key, value]) => {
        console.log(`  ${key}: ${value}`)
      })
      console.log('\nPreview Colors:')
      console.log(`  primary: ${first.preview?.colors.primary}`)
      console.log(`  background: ${first.preview?.colors.background}`)
      console.log(`  accent: ${first.preview?.colors.accent}`)

      expect(true).toBe(true) // Just for logging
    })
  })
})
