/**
 * Extended Shadcn-style theme presets with full color token support
 * Inspired by https://ui.shadcn.com/themes and https://tweakcn.com/editor/theme
 * 
 * This extends the existing theme system with:
 * - Full shadcn/ui color tokens
 * - OKLCH color format support
 * - Chart colors (chart-1 through chart-5)
 * - Semantic color tokens (destructive, muted, accent, etc.)
 * - CSS variable generation for Tailwind integration
 */

export interface ShadcnColorTokens {
  // Base colors
  background: string
  foreground: string
  
  // Card colors
  card: string
  'card-foreground': string
  
  // Popover colors
  popover: string
  'popover-foreground': string
  
  // Primary colors
  primary: string
  'primary-foreground': string
  
  // Secondary colors
  secondary: string
  'secondary-foreground': string
  
  // Muted colors
  muted: string
  'muted-foreground': string
  
  // Accent colors
  accent: string
  'accent-foreground': string
  
  // Destructive colors
  destructive: string
  'destructive-foreground': string
  
  // Border & Input
  border: string
  input: string
  ring: string
  
  // Chart colors (for data visualization)
  'chart-1': string
  'chart-2': string
  'chart-3': string
  'chart-4': string
  'chart-5': string
  
  // Border radius (optional)
  radius?: string
  
  // Font families (optional)
  'font-sans'?: string
  'font-mono'?: string
}

export interface ExtendedThemePreset {
  label: string
  value: string
  styles: {
    light: ShadcnColorTokens
    dark: ShadcnColorTokens
  }
}

/**
 * Extended theme presets with full shadcn/ui token support
 * These work alongside the existing default presets
 */
export const extendedThemePresets: Record<string, ExtendedThemePreset> = {
  'cool-extended': {
    label: 'Cool & Professional (Extended)',
    value: 'cool-extended',
    styles: {
      light: {
        background: 'oklch(1 0 0)',
        foreground: 'oklch(0.145 0 0)',
        card: 'oklch(1 0 0)',
        'card-foreground': 'oklch(0.145 0 0)',
        popover: 'oklch(1 0 0)',
        'popover-foreground': 'oklch(0.145 0 0)',
        primary: 'oklch(0.549 0.184 250.847)',
        'primary-foreground': 'oklch(0.985 0.005 250.847)',
        secondary: 'oklch(0.97 0 0)',
        'secondary-foreground': 'oklch(0.205 0 0)',
        muted: 'oklch(0.97 0 0)',
        'muted-foreground': 'oklch(0.556 0 0)',
        accent: 'oklch(0.97 0 0)',
        'accent-foreground': 'oklch(0.205 0 0)',
        destructive: 'oklch(0.577 0.245 27.325)',
        'destructive-foreground': 'oklch(0.98 0 0)',
        border: 'oklch(0.922 0 0)',
        input: 'oklch(0.922 0 0)',
        ring: 'oklch(0.549 0.184 250.847)',
        'chart-1': 'oklch(0.549 0.184 250.847)',
        'chart-2': 'oklch(0.645 0.168 250.847)',
        'chart-3': 'oklch(0.445 0.204 250.847)',
        'chart-4': 'oklch(0.349 0.184 250.847)',
        'chart-5': 'oklch(0.749 0.124 250.847)',
        radius: '0.5rem',
      },
      dark: {
        background: 'oklch(0.145 0 0)',
        foreground: 'oklch(0.985 0 0)',
        card: 'oklch(0.205 0 0)',
        'card-foreground': 'oklch(0.985 0 0)',
        popover: 'oklch(0.269 0 0)',
        'popover-foreground': 'oklch(0.985 0 0)',
        primary: 'oklch(0.645 0.168 250.847)',
        'primary-foreground': 'oklch(0.145 0.005 250.847)',
        secondary: 'oklch(0.269 0 0)',
        'secondary-foreground': 'oklch(0.985 0 0)',
        muted: 'oklch(0.269 0 0)',
        'muted-foreground': 'oklch(0.708 0 0)',
        accent: 'oklch(0.371 0 0)',
        'accent-foreground': 'oklch(0.985 0 0)',
        destructive: 'oklch(0.704 0.191 22.216)',
        'destructive-foreground': 'oklch(0.98 0 0)',
        border: 'oklch(1 0 0 / 10%)',
        input: 'oklch(1 0 0 / 15%)',
        ring: 'oklch(0.645 0.168 250.847)',
        'chart-1': 'oklch(0.645 0.168 250.847)',
        'chart-2': 'oklch(0.549 0.184 250.847)',
        'chart-3': 'oklch(0.445 0.204 250.847)',
        'chart-4': 'oklch(0.749 0.124 250.847)',
        'chart-5': 'oklch(0.849 0.084 250.847)',
        radius: '0.5rem',
      },
    },
  },
  
  'neon-extended': {
    label: 'Neon Cyberpunk (Extended)',
    value: 'neon-extended',
    styles: {
      light: {
        background: 'oklch(1 0 0)',
        foreground: 'oklch(0.145 0 0)',
        card: 'oklch(1 0 0)',
        'card-foreground': 'oklch(0.145 0 0)',
        popover: 'oklch(1 0 0)',
        'popover-foreground': 'oklch(0.145 0 0)',
        primary: 'oklch(0.628 0.258 328.363)',
        'primary-foreground': 'oklch(0.985 0.015 328.363)',
        secondary: 'oklch(0.97 0 0)',
        'secondary-foreground': 'oklch(0.205 0 0)',
        muted: 'oklch(0.97 0 0)',
        'muted-foreground': 'oklch(0.556 0 0)',
        accent: 'oklch(0.749 0.168 305.365)',
        'accent-foreground': 'oklch(0.985 0.015 305.365)',
        destructive: 'oklch(0.577 0.245 27.325)',
        'destructive-foreground': 'oklch(0.98 0 0)',
        border: 'oklch(0.922 0 0)',
        input: 'oklch(0.922 0 0)',
        ring: 'oklch(0.628 0.258 328.363)',
        'chart-1': 'oklch(0.628 0.258 328.363)',
        'chart-2': 'oklch(0.749 0.168 305.365)',
        'chart-3': 'oklch(0.645 0.234 286.897)',
        'chart-4': 'oklch(0.545 0.298 328.363)',
        'chart-5': 'oklch(0.845 0.118 305.365)',
        radius: '0.75rem',
      },
      dark: {
        background: 'oklch(0.125 0.028 305.365)',
        foreground: 'oklch(0.985 0.015 305.365)',
        card: 'oklch(0.185 0.028 305.365)',
        'card-foreground': 'oklch(0.985 0.015 305.365)',
        popover: 'oklch(0.245 0.028 305.365)',
        'popover-foreground': 'oklch(0.985 0.015 305.365)',
        primary: 'oklch(0.749 0.168 305.365)',
        'primary-foreground': 'oklch(0.125 0.028 305.365)',
        secondary: 'oklch(0.245 0.028 305.365)',
        'secondary-foreground': 'oklch(0.985 0.015 305.365)',
        muted: 'oklch(0.245 0.028 305.365)',
        'muted-foreground': 'oklch(0.708 0.015 305.365)',
        accent: 'oklch(0.628 0.258 328.363)',
        'accent-foreground': 'oklch(0.125 0.028 328.363)',
        destructive: 'oklch(0.704 0.191 22.216)',
        'destructive-foreground': 'oklch(0.98 0 0)',
        border: 'oklch(1 0 0 / 15%)',
        input: 'oklch(1 0 0 / 20%)',
        ring: 'oklch(0.749 0.168 305.365)',
        'chart-1': 'oklch(0.749 0.168 305.365)',
        'chart-2': 'oklch(0.628 0.258 328.363)',
        'chart-3': 'oklch(0.645 0.234 286.897)',
        'chart-4': 'oklch(0.845 0.118 305.365)',
        'chart-5': 'oklch(0.945 0.068 305.365)',
        radius: '0.75rem',
      },
    },
  },
  
  'solar-extended': {
    label: 'Solar Warmth (Extended)',
    value: 'solar-extended',
    styles: {
      light: {
        background: 'oklch(0.985 0.01 83.124)',
        foreground: 'oklch(0.145 0 0)',
        card: 'oklch(1 0 0)',
        'card-foreground': 'oklch(0.145 0 0)',
        popover: 'oklch(1 0 0)',
        'popover-foreground': 'oklch(0.145 0 0)',
        primary: 'oklch(0.656 0.214 53.877)',
        'primary-foreground': 'oklch(0.985 0.015 53.877)',
        secondary: 'oklch(0.97 0 0)',
        'secondary-foreground': 'oklch(0.205 0 0)',
        muted: 'oklch(0.97 0 0)',
        'muted-foreground': 'oklch(0.556 0 0)',
        accent: 'oklch(0.745 0.188 83.124)',
        'accent-foreground': 'oklch(0.145 0 0)',
        destructive: 'oklch(0.577 0.245 27.325)',
        'destructive-foreground': 'oklch(0.98 0 0)',
        border: 'oklch(0.922 0 0)',
        input: 'oklch(0.922 0 0)',
        ring: 'oklch(0.656 0.214 53.877)',
        'chart-1': 'oklch(0.656 0.214 53.877)',
        'chart-2': 'oklch(0.745 0.188 83.124)',
        'chart-3': 'oklch(0.556 0.234 53.877)',
        'chart-4': 'oklch(0.845 0.148 83.124)',
        'chart-5': 'oklch(0.456 0.254 53.877)',
        radius: '0.625rem',
      },
      dark: {
        background: 'oklch(0.125 0.015 53.877)',
        foreground: 'oklch(0.985 0.015 83.124)',
        card: 'oklch(0.185 0.015 53.877)',
        'card-foreground': 'oklch(0.985 0.015 83.124)',
        popover: 'oklch(0.245 0.015 53.877)',
        'popover-foreground': 'oklch(0.985 0.015 83.124)',
        primary: 'oklch(0.745 0.188 83.124)',
        'primary-foreground': 'oklch(0.125 0.015 83.124)',
        secondary: 'oklch(0.245 0.015 53.877)',
        'secondary-foreground': 'oklch(0.985 0.015 83.124)',
        muted: 'oklch(0.245 0.015 53.877)',
        'muted-foreground': 'oklch(0.708 0.015 83.124)',
        accent: 'oklch(0.656 0.214 53.877)',
        'accent-foreground': 'oklch(0.985 0.015 53.877)',
        destructive: 'oklch(0.704 0.191 22.216)',
        'destructive-foreground': 'oklch(0.98 0 0)',
        border: 'oklch(1 0 0 / 12%)',
        input: 'oklch(1 0 0 / 18%)',
        ring: 'oklch(0.745 0.188 83.124)',
        'chart-1': 'oklch(0.745 0.188 83.124)',
        'chart-2': 'oklch(0.656 0.214 53.877)',
        'chart-3': 'oklch(0.845 0.148 83.124)',
        'chart-4': 'oklch(0.556 0.234 53.877)',
        'chart-5': 'oklch(0.945 0.088 83.124)',
        radius: '0.625rem',
      },
    },
  },
}

/**
 * Convert extended theme to CSS variables
 */
export function extendedThemeToCSSVariables(
  theme: ExtendedThemePreset,
  mode: 'light' | 'dark' = 'light'
): string {
  const tokens = theme.styles[mode]
  const cssVars: string[] = []
  
  Object.entries(tokens).forEach(([key, value]) => {
    cssVars.push(`  --${key}: ${value};`)
  })
  
  return cssVars.join('\n')
}

/**
 * Generate complete CSS for an extended theme
 */
export function generateExtendedThemeCSS(theme: ExtendedThemePreset): string {
  const lightCSS = extendedThemeToCSSVariables(theme, 'light')
  const darkCSS = extendedThemeToCSSVariables(theme, 'dark')
  
  return `:root {
${lightCSS}
}

.dark {
${darkCSS}
}

[data-theme-mode="dark"] {
${darkCSS}
}`
}
