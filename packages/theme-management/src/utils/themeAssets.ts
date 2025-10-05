import { readFile } from 'fs/promises'
import { join } from 'path'
import type { ThemePreset } from '@/providers/Theme/types'

const themeCriticalFiles: Record<string, string> = {
  cool: 'cool-critical.css',
  brutal: 'brutal-critical.css',
  neon: 'neon-critical.css',
  solar: 'solar-critical.css',
  dealership: 'dealership-critical.css',
  'real-estate': 'real-estate-critical.css',
  'real-estate-gold': 'real-estate-gold-critical.css',
  'real-estate-neutral': 'real-estate-neutral-critical.css',
}

const themeFullFiles: Record<string, string> = {
  cool: 'cool.css',
  brutal: 'brutal.css',
  neon: 'neon.css',
  solar: 'solar.css',
  dealership: 'dealership.css',
  'real-estate': 'real-estate.css',
  'real-estate-gold': 'real-estate-gold.css',
  'real-estate-neutral': 'real-estate-neutral.css',
}

export async function getThemeCriticalCSS(theme: ThemePreset): Promise<string | null> {
  try {
    const filename = themeCriticalFiles[theme]
    if (!filename) {
      console.warn(`Critical CSS file not found for theme: ${theme}`)
      return null
    }

    const filePath = join(process.cwd(), 'public', 'themes', filename)
    const css = await readFile(filePath, 'utf-8')

    return css.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  } catch (error) {
    console.error(`Error reading critical CSS for theme ${theme}:`, error)
    return null
  }
}

export function getThemeCSSPath(theme: ThemePreset): string {
  const filename = themeFullFiles[theme]
  return `/themes/${filename}`
}

export function generateThemePreloadLinks(theme: ThemePreset): string {
  const cssPath = getThemeCSSPath(theme)
  return `<link rel="preload" href="${cssPath}" as="style" onload="this.onload=null;this.rel='stylesheet'">`
}

export function createFallbackCriticalCSS(theme: ThemePreset): string {
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
