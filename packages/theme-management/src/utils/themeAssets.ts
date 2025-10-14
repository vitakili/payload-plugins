import type { ThemeDefaults } from '../providers/Theme/types.js'
import { getThemeDynamicCSS } from './themeCSS.js'

function normaliseCss(css: string): string {
  return css.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
}

export async function getThemeCriticalCSS(theme: ThemeDefaults): Promise<string | null> {
  try {
    const css = getThemeDynamicCSS(theme)
    if (!css) {
      console.warn(`Dynamic CSS could not be generated for theme: ${theme}`)
      return null
    }
    return normaliseCss(css)
  } catch (error) {
    console.error(`Error generating critical CSS for theme ${theme}:`, error)
    return null
  }
}

export function getThemeCSS(theme: ThemeDefaults): string | null {
  const css = getThemeDynamicCSS(theme)
  return css ? normaliseCss(css) : null
}

/**
 * @deprecated Static CSS files have been removed. This function now returns an empty string.
 */
export function getThemeCSSPath(theme: ThemeDefaults): string {
  console.warn(
    `[theme-management] getThemeCSSPath(${theme}) is deprecated. Dynamic CSS generation is used instead.`,
  )
  return ''
}

/**
 * @deprecated Preload links are no longer required when CSS is inlined dynamically.
 */
export function generateThemePreloadLinks(theme: ThemeDefaults): string {
  console.warn(
    `[theme-management] generateThemePreloadLinks(${theme}) is deprecated. Dynamic CSS generation is used instead.`,
  )
  return ''
}

export function createFallbackCriticalCSS(theme: ThemeDefaults): string {
  return `
/* Fallback critical CSS for ${theme} theme */
[data-theme="${theme}"] {
  --background: hsl(0 0% 100%);
  --foreground: hsl(222 47% 11%);
  --primary: hsl(221 83% 53%);
  --primary-foreground: hsl(210 40% 98%);
  color-scheme: light;
}

[data-theme="${theme}"][data-theme-mode="dark"] {
  --background: hsl(222 47% 11%);
  --foreground: hsl(210 40% 98%);
  --primary: hsl(217 91% 60%);
  --primary-foreground: hsl(222 47% 11%);
  color-scheme: dark;
}
`.trim()
}
