import type { Payload } from 'payload'

export interface ThemeSettingsData {
  activeFont: string
  googleFontsApiKey?: string
  fontWeightHeading: string
  fontWeightBody: string
}

/**
 * Get theme settings from Payload CMS
 *
 * This helper fetches the ThemeSettings global and returns
 * the typography configuration.
 *
 * @param payload - Payload instance
 * @returns Theme settings data
 */
export async function getThemeSettings(payload?: Payload): Promise<ThemeSettingsData | null> {
  if (!payload) {
    // If no payload instance provided, try to get it from the global scope
    // This is useful in server components where payload might be available globally
    if (typeof window === 'undefined' && (global as any).payload) {
      payload = (global as any).payload
    } else {
      console.warn('getThemeSettings: No payload instance available')
      return null
    }
  }

  try {
    const themeSettings = await payload.findGlobal({
      slug: 'themeSettings',
    })

    return {
      activeFont: themeSettings.activeFont || 'Inter',
      googleFontsApiKey: themeSettings.googleFontsApiKey,
      fontWeightHeading: themeSettings.fontWeightHeading || '700',
      fontWeightBody: themeSettings.fontWeightBody || '400',
    }
  } catch (error) {
    console.error('Error fetching theme settings:', error)
    return null
  }
}

/**
 * Generate Google Fonts CSS URL
 *
 * @param fontFamily - Font family name
 * @param weights - Array of font weights
 * @returns Google Fonts CSS URL
 */
export function getGoogleFontUrl(fontFamily: string, weights: string[] = ['400', '700']): string {
  const family = fontFamily.replace(/\s+/g, '+')
  const weightsStr = weights.join(';')
  return `https://fonts.googleapis.com/css2?family=${family}:wght@${weightsStr}&display=swap`
}

/**
 * Check if a font is pre-imported via next/font/google
 *
 * These fonts are optimized and don't require runtime loading
 */
export const PRE_IMPORTED_FONTS = [
  'Inter',
  'Nunito',
  'Montserrat',
  'Manrope',
  'Mulish',
  'Barlow',
  'Raleway',
  'Playfair Display',
] as const

export type PreImportedFont = (typeof PRE_IMPORTED_FONTS)[number]

export function isPreImportedFont(fontFamily: string): fontFamily is PreImportedFont {
  return (PRE_IMPORTED_FONTS as readonly string[]).includes(fontFamily)
}
