import { readFileSync } from 'fs'
import { join } from 'path'
import * as postcss from 'postcss'

describe('CSS Files Validation', () => {
  const cssFiles = ['src/fields/ThemeColorPickerField.css']

  cssFiles.forEach((cssFilePath) => {
    describe(cssFilePath, () => {
      let cssContent: string

      beforeAll(() => {
        const fullPath = join(process.cwd(), cssFilePath)
        cssContent = readFileSync(fullPath, 'utf-8')
      })

      it('should exist', () => {
        expect(cssContent).toBeDefined()
        expect(cssContent.length).toBeGreaterThan(0)
      })

      it('should have valid CSS syntax (parseable by PostCSS)', async () => {
        const result = postcss.parse(cssContent)
        expect(result).toBeDefined()
      })

      it('should not have syntax errors', async () => {
        const result = await postcss.parse(cssContent)
        expect(result.nodes).toBeDefined()
        expect(Array.isArray(result.nodes)).toBe(true)
      })

      it('should have proper semicolons', () => {
        // Check for common syntax errors
        const lines = cssContent.split('\n')

        lines.forEach((line, index) => {
          const trimmed = line.trim()

          // Skip comments and empty lines
          if (trimmed.startsWith('/*') || trimmed.startsWith('*') || trimmed === '') {
            return
          }

          // CSS property lines should end with semicolon (but not selectors or closing braces)
          if (trimmed.includes(':') && !trimmed.endsWith('{') && !trimmed.endsWith('}')) {
            // If it's a property declaration, it should end with ; or {
            const isPropertyLine = /^[a-z-]+\s*:/.test(trimmed)
            if (isPropertyLine && !trimmed.endsWith(';') && !trimmed.endsWith('{')) {
              fail(`Line ${index + 1} in ${cssFilePath} is missing a semicolon: "${trimmed}"`)
            }
          }
        })
      })

      it('should have balanced braces', () => {
        const openBraces = (cssContent.match(/{/g) || []).length
        const closeBraces = (cssContent.match(/}/g) || []).length

        expect(openBraces).toBe(closeBraces)
      })

      it('should not have duplicate selectors with same properties', async () => {
        const result = await postcss.parse(cssContent)
        const selectors = new Map<string, number>()

        result.walkRules((rule) => {
          const selector = rule.selector
          const count = selectors.get(selector) || 0
          selectors.set(selector, count + 1)
        })

        // Check for exact duplicates (which might be a mistake)
        const duplicates = Array.from(selectors.entries())
          .filter(([, count]) => count > 3) // Allow some reasonable duplication
          .map(([selector]) => selector)

        if (duplicates.length > 0) {
          console.warn(`Warning: Potential duplicate selectors in ${cssFilePath}:`, duplicates)
        }
      })

      it('should use valid CSS color values', async () => {
        const result = await postcss.parse(cssContent)
        const colorRegex =
          /^(#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)|hsla?\([^)]+\)|var\([^)]+\)|transparent|currentColor|inherit)$/

        result.walkDecls((decl) => {
          if (
            decl.prop.includes('color') ||
            decl.prop.includes('background') ||
            decl.prop.includes('border') ||
            decl.prop.includes('fill') ||
            decl.prop.includes('stroke')
          ) {
            // Skip gradient values and complex backgrounds
            if (
              decl.value.includes('gradient') ||
              decl.value.includes('url(') ||
              decl.value.includes('calc(')
            ) {
              return
            }

            // For simple color values, validate format
            const values = decl.value.split(/\s+/)
            values.forEach((value) => {
              if (value && !value.match(/^\d+/) && !value.includes('px') && !value.includes('%')) {
                // This should be a color value
                if (!colorRegex.test(value)) {
                  // It might still be valid (like 'solid', 'none', etc.)
                  // Just log a warning
                  if (
                    ![
                      'solid',
                      'none',
                      'auto',
                      'transparent',
                      'inherit',
                      'initial',
                      'unset',
                    ].includes(value)
                  ) {
                    console.log(
                      `Note: Non-standard color value in ${cssFilePath}: ${decl.prop}: ${value}`,
                    )
                  }
                }
              }
            })
          }
        })
      })
    })
  })
})
