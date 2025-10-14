import { allThemePresets } from '../presets.js'
import type { ThemeDefaults } from '../providers/Theme/types.js'
import { generateThemeCSS } from './generateThemeCSS.js'

/**
 * Get dynamically generated CSS for a theme
 * Returns null if theme doesn't exist or doesn't use dynamic CSS
 */
export function getThemeDynamicCSS(themeName: ThemeDefaults): string | null {
  const preset = allThemePresets.find((p) => p.name === themeName)

  if (!preset) {
    console.warn(`Theme preset not found: ${themeName}`)
    return null
  }

  try {
    return generateThemeCSS(preset)
  } catch (error) {
    console.error(`Error generating CSS for theme ${themeName}:`, error)
    return null
  }
}

/**
 * Get CSS for all themes that use dynamic generation
 */
export function getAllDynamicThemesCSS(): string {
  return allThemePresets
    .map((preset) => {
      try {
        return generateThemeCSS(preset)
      } catch (error) {
        console.error(`Error generating CSS for theme ${preset.name}:`, error)
        return null
      }
    })
    .filter((css): css is string => css !== null)
    .join('\n\n')
}
