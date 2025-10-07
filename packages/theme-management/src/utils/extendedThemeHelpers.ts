import type { ExtendedThemePreset, ShadcnColorTokens } from '../extended-presets.js'
import * as React from 'react'

/**
 * Apply an extended theme client-side by setting CSS variables on document.documentElement
 * Works exactly like silicondeck/shadcn-dashboard-landing-template's useThemeManager
 * 
 * @example
 * ```tsx
 * import { extendedThemePresets, applyExtendedTheme } from '@kilivi/payloadcms-theme-management'
 * 
 * // In a client component or hook
 * function useExtendedTheme() {
 *   const isDark = document.documentElement.classList.contains('dark')
 *   
 *   useEffect(() => {
 *     applyExtendedTheme(extendedThemePresets['cool-extended'], isDark ? 'dark' : 'light')
 *   }, [isDark])
 * }
 * ```
 */
export function applyExtendedTheme(
  theme: ExtendedThemePreset,
  mode: 'light' | 'dark' = 'light'
): void {
  if (typeof document === 'undefined') {
    console.warn('applyExtendedTheme can only be called in browser environment')
    return
  }
  
  const tokens = theme.styles[mode]
  const root = document.documentElement
  
  // Apply CSS variables to document root (same as silicondeck's approach)
  Object.entries(tokens).forEach(([key, value]) => {
    root.style.setProperty(`--${key}`, value)
  })
}

/**
 * Generate CSS content for globals.css
 * Add this to your globals.css file to define base theme variables
 * 
 * @example
 * ```tsx
 * import { extendedThemePresets, generateExtendedThemeCSS } from '@kilivi/payloadcms-theme-management'
 * 
 * // Generate CSS for cool-extended theme
 * const css = generateExtendedThemeCSS(extendedThemePresets['cool-extended'])
 * 
 * // Copy this to your globals.css:
 * // :root {
 * //   --background: oklch(...);
 * //   ...
 * // }
 * // .dark {
 * //   --background: oklch(...);
 * //   ...
 * // }
 * ```
 */
export function generateExtendedThemeCSS(theme: ExtendedThemePreset): string {
  const lightVars = Object.entries(theme.styles.light)
    .map(([key, value]) => `  --${key}: ${value};`)
    .join('\n')

  const darkVars = Object.entries(theme.styles.dark)
    .map(([key, value]) => `  --${key}: ${value};`)
    .join('\n')

  return `:root {\n${lightVars}\n}\n\n.dark {\n${darkVars}\n}`
}

/**
 * Reset all extended theme CSS variables
 * Useful when switching between themes or resetting to defaults
 * 
 * @example
 * ```tsx
 * import { resetExtendedTheme } from '@kilivi/payloadcms-theme-management'
 * 
 * // Remove all extended theme variables
 * resetExtendedTheme()
 * ```
 */
export function resetExtendedTheme(): void {
  if (typeof document === 'undefined') return

  const root = document.documentElement
  const allVars = [
    'background', 'foreground', 'card', 'card-foreground', 'popover', 'popover-foreground',
    'primary', 'primary-foreground', 'secondary', 'secondary-foreground',
    'muted', 'muted-foreground', 'accent', 'accent-foreground',
    'destructive', 'destructive-foreground', 'border', 'input', 'ring',
    'chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5',
    'radius', 'font-sans', 'font-mono'
  ]

  allVars.forEach(varName => {
    root.style.removeProperty(`--${varName}`)
  })
}

/**
 * Extract specific color tokens from an extended theme
 * Useful when you only need a subset of theme colors
 * 
 * @example
 * ```tsx
 * import { extendedThemePresets, getExtendedThemeTokens } from '@kilivi/payloadcms-theme-management'
 * 
 * const chartColors = getExtendedThemeTokens(
 *   extendedThemePresets['cool-extended'],
 *   'light',
 *   ['chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5']
 * )
 * ```
 */
export function getExtendedThemeTokens<K extends keyof ShadcnColorTokens>(
  theme: ExtendedThemePreset,
  mode: 'light' | 'dark',
  keys: K[]
): Pick<ShadcnColorTokens, K> {
  const tokens = theme.styles[mode]
  const result = {} as Pick<ShadcnColorTokens, K>
  
  keys.forEach(key => {
    if (tokens[key]) {
      result[key] = tokens[key]
    }
  })
  
  return result
}

/**
 * Create a React hook for theme management
 * Factory function to create a custom hook tied to your theme system
 * 
 * @example
 * ```tsx
 * import { extendedThemePresets, createUseExtendedTheme } from '@kilivi/payloadcms-theme-management'
 * 
 * const useExtendedTheme = createUseExtendedTheme(extendedThemePresets)
 * 
 * function MyComponent() {
 *   const { applyTheme, currentMode } = useExtendedTheme()
 *   
 *   return (
 *     <button onClick={() => applyTheme('neon-extended', 'dark')}>
 *       Apply Neon Dark
 *     </button>
 *   )
 * }
 * ```
 */
export function createUseExtendedTheme(presets: Record<string, ExtendedThemePreset>) {
  return function useExtendedTheme() {
    const [currentTheme, setCurrentTheme] = React.useState<string>('default')
    const [currentMode, setCurrentMode] = React.useState<'light' | 'dark'>('light')

    const applyTheme = React.useCallback((themeKey: string, mode: 'light' | 'dark') => {
      const theme = presets[themeKey]
      if (!theme) {
        console.warn(`Theme "${themeKey}" not found`)
        return
      }

      applyExtendedTheme(theme, mode)
      setCurrentTheme(themeKey)
      setCurrentMode(mode)
    }, [])

    return {
      currentTheme,
      currentMode,
      applyTheme,
      resetTheme: resetExtendedTheme
    }
  }
}

/**
 * Get Tailwind CSS color references for extended themes
 * Use this in your tailwind.config.ts to enable semantic color classes
 * 
 * @example
 * ```ts
 * // tailwind.config.ts
 * import { getTailwindVarReferences } from '@kilivi/payloadcms-theme-management'
 * 
 * export default {
 *   theme: {
 *     extend: {
 *       colors: getTailwindVarReferences()
 *     }
 *   }
 * }
 * ```
 */
export function getTailwindVarReferences(): any {
  return {
    background: 'hsl(var(--background))',
    foreground: 'hsl(var(--foreground))',
    card: {
      DEFAULT: 'hsl(var(--card))',
      foreground: 'hsl(var(--card-foreground))',
    },
    popover: {
      DEFAULT: 'hsl(var(--popover))',
      foreground: 'hsl(var(--popover-foreground))',
    },
    primary: {
      DEFAULT: 'hsl(var(--primary))',
      foreground: 'hsl(var(--primary-foreground))',
    },
    secondary: {
      DEFAULT: 'hsl(var(--secondary))',
      foreground: 'hsl(var(--secondary-foreground))',
    },
    muted: {
      DEFAULT: 'hsl(var(--muted))',
      foreground: 'hsl(var(--muted-foreground))',
    },
    accent: {
      DEFAULT: 'hsl(var(--accent))',
      foreground: 'hsl(var(--accent-foreground))',
    },
    destructive: {
      DEFAULT: 'hsl(var(--destructive))',
      foreground: 'hsl(var(--destructive-foreground))',
    },
    border: 'hsl(var(--border))',
    input: 'hsl(var(--input))',
    ring: 'hsl(var(--ring))',
    chart: {
      '1': 'hsl(var(--chart-1))',
      '2': 'hsl(var(--chart-2))',
      '3': 'hsl(var(--chart-3))',
      '4': 'hsl(var(--chart-4))',
      '5': 'hsl(var(--chart-5))',
    },
  }
}
