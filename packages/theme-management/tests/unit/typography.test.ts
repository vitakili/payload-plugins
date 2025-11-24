import { resolveTypographyPreview } from '../../src/components/typographyPreviewUtils.js'
import { defaultThemePresets } from '../../src/presets.js'

describe('Typography Preview Utils', () => {
  describe('resolveTypographyPreview', () => {
    it('should use preset typography when no selection provided', () => {
      const result = resolveTypographyPreview(null, 'cool')

      expect(result).toBeDefined()
      expect(result.bodyFont).toBeTruthy()
      expect(result.headingFont).toBeTruthy()
      expect(result.baseFontSize).toBeTruthy()
      expect(result.lineHeight).toBeTruthy()
      expect(result.bodyLabel).toBeTruthy()
      expect(result.headingLabel).toBeTruthy()
    })

    it('should fallback to preset when selection is "preset"', () => {
      const result = resolveTypographyPreview(
        {
          bodyFont: 'preset',
          headingFont: 'preset',
          baseFontSize: 'preset',
          lineHeight: 'preset',
        },
        'cool',
      )

      const coolPreset = defaultThemePresets.find((p) => p.name === 'cool')
      expect(result).toBeDefined()
      expect(result.bodyFont).toContain(coolPreset?.typography?.fontFamily || 'system-ui')
    })

    it('should use custom font when provided', () => {
      const customFont = '"Custom Font", sans-serif'
      const result = resolveTypographyPreview(
        {
          bodyFont: 'custom',
          bodyFontCustom: customFont,
          headingFont: 'preset',
        },
        'cool',
      )

      expect(result.bodyFont).toBe(customFont)
    })

    it('should resolve system-ui font', () => {
      const result = resolveTypographyPreview(
        {
          bodyFont: 'system-ui',
          headingFont: 'system-ui',
        },
        'cool',
      )

      expect(result.bodyFont).toContain('system-ui')
      expect(result.headingFont).toContain('system-ui')
    })

    it('should resolve Inter font variable', () => {
      const result = resolveTypographyPreview(
        {
          bodyFont: 'inter',
          headingFont: 'inter',
        },
        'cool',
      )

      // Font values use CSS variables with fallbacks
      expect(result.bodyFont).toBeTruthy()
      expect(result.headingFont).toBeTruthy()
      expect(result.bodyLabel).toBe('inter')
      expect(result.headingLabel).toBe('inter')
    })

    it('should use custom font size when provided', () => {
      const result = resolveTypographyPreview(
        {
          baseFontSize: '18px',
          lineHeight: '1.8',
        },
        'cool',
      )

      expect(result.baseFontSize).toBe('18px')
      expect(result.lineHeight).toBe('1.8')
    })

    it('should handle undefined theme gracefully', () => {
      const result = resolveTypographyPreview(null)

      expect(result).toBeDefined()
      expect(result.bodyFont).toBeTruthy()
      expect(result.headingFont).toBeTruthy()
    })

    it('should handle different heading and body fonts', () => {
      const result = resolveTypographyPreview(
        {
          bodyFont: 'inter',
          headingFont: 'outfit',
        },
        'cool',
      )

      expect(result.bodyFont).toBeTruthy()
      expect(result.headingFont).toBeTruthy()
      expect(result.bodyLabel).toBe('inter')
      expect(result.headingLabel).toBe('outfit')
    })

    it('should fallback to preset when custom font is empty', () => {
      const result = resolveTypographyPreview(
        {
          bodyFont: 'custom',
          bodyFontCustom: '',
        },
        'cool',
      )

      expect(result.bodyFont).toBeTruthy()
      expect(result.bodyFont).not.toBe('')
    })

    it('should provide font labels for display', () => {
      const result = resolveTypographyPreview(
        {
          bodyFont: 'inter',
          headingFont: 'playfair',
        },
        'cool',
      )

      expect(result.bodyLabel).toBe('inter')
      expect(result.headingLabel).toBe('playfair')
    })
  })
})
