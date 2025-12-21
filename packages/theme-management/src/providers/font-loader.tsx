/**
 * Next.js Font Loader Utilities
 *
 * This file provides utilities for loading Google Fonts in Next.js applications
 * based on theme configuration from the CMS.
 *
 * ## Usage Guide
 *
 * ### 1. Static Font Loading (Recommended)
 *
 * In your Next.js app's root layout:
 *
 * ```tsx
 * // app/layout.tsx
 * import { Inter, Playfair_Display } from 'next/font/google'
 *
 * const inter = Inter({
 *   subsets: ['latin'],
 *   variable: '--font-body',
 *   display: 'swap',
 * })
 *
 * const playfair = Playfair_Display({
 *   subsets: ['latin'],
 *   variable: '--font-heading',
 *   display: 'swap',
 * })
 *
 * export default function RootLayout({ children }: { children: React.ReactNode }) {
 *   return (
 *     <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
 *       <body>{children}</body>
 *     </html>
 *   )
 * }
 * ```
 *
 * ### 2. CSS Variables Usage
 *
 * In your global CSS:
 *
 * ```css
 * :root {
 *   --font-body: var(--font-inter), system-ui, sans-serif;
 *   --font-heading: var(--font-playfair), Georgia, serif;
 * }
 *
 * body {
 *   font-family: var(--font-body);
 * }
 *
 * h1, h2, h3, h4, h5, h6 {
 *   font-family: var(--font-heading);
 * }
 * ```
 *
 * ### 3. Dynamic Font Loading
 *
 * Use the helper functions below to generate font loader code:
 *
 * ```tsx
 * import { getFontLoaderCode } from '@kilivi/payloadcms-theme-management/providers/font-loader'
 *
 * const themeConfig = await getThemeConfig()
 * const fontCode = getFontLoaderCode(themeConfig)
 * console.log(fontCode) // Copy this to your layout.tsx
 * ```
 */

interface ThemeConfig {
  bodyFont?: string
  headingFont?: string
  bodyFontCustom?: string
  headingFontCustom?: string
}

/**
 * Font mapping for next/font/google imports
 * Maps theme font values to Next.js font imports
 */
export const FONT_IMPORT_MAP: Record<string, { import: string; variable: string }> = {
  Inter: {
    import: `import { Inter } from 'next/font/google'\nconst inter = Inter({ subsets: ['latin'], variable: '--font-body' })`,
    variable: 'inter.variable',
  },
  Roboto: {
    import: `import { Roboto } from 'next/font/google'\nconst roboto = Roboto({ weight: ['400', '500', '700'], subsets: ['latin'], variable: '--font-body' })`,
    variable: 'roboto.variable',
  },
  'Open Sans': {
    import: `import { Open_Sans } from 'next/font/google'\nconst openSans = Open_Sans({ subsets: ['latin'], variable: '--font-body' })`,
    variable: 'openSans.variable',
  },
  Lato: {
    import: `import { Lato } from 'next/font/google'\nconst lato = Lato({ weight: ['400', '700'], subsets: ['latin'], variable: '--font-body' })`,
    variable: 'lato.variable',
  },
  Montserrat: {
    import: `import { Montserrat } from 'next/font/google'\nconst montserrat = Montserrat({ subsets: ['latin'], variable: '--font-body' })`,
    variable: 'montserrat.variable',
  },
  Poppins: {
    import: `import { Poppins } from 'next/font/google'\nconst poppins = Poppins({ weight: ['400', '500', '600', '700'], subsets: ['latin'], variable: '--font-body' })`,
    variable: 'poppins.variable',
  },
  'Playfair Display': {
    import: `import { Playfair_Display } from 'next/font/google'\nconst playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-heading' })`,
    variable: 'playfair.variable',
  },
  Merriweather: {
    import: `import { Merriweather } from 'next/font/google'\nconst merriweather = Merriweather({ weight: ['400', '700'], subsets: ['latin'], variable: '--font-heading' })`,
    variable: 'merriweather.variable',
  },
  Lora: {
    import: `import { Lora } from 'next/font/google'\nconst lora = Lora({ subsets: ['latin'], variable: '--font-heading' })`,
    variable: 'lora.variable',
  },
  'Crimson Text': {
    import: `import { Crimson_Text } from 'next/font/google'\nconst crimsonText = Crimson_Text({ weight: ['400', '600', '700'], subsets: ['latin'], variable: '--font-heading' })`,
    variable: 'crimsonText.variable',
  },
}

/**
 * Generate Next.js font loader code for your layout
 *
 * @param config - Theme configuration from CMS
 * @returns String with complete Next.js font loading code
 *
 * @example
 * ```tsx
 * const code = getFontLoaderCode({ bodyFont: 'Inter', headingFont: 'Playfair Display' })
 * console.log(code)
 * // Copy the output to your app/layout.tsx file
 * ```
 */
export function getFontLoaderCode(config: ThemeConfig): string {
  const imports: string[] = []
  const variables: string[] = []

  if (config.bodyFont && config.bodyFont !== 'preset' && config.bodyFont !== 'custom') {
    const fontConfig = FONT_IMPORT_MAP[config.bodyFont]
    if (fontConfig) {
      imports.push(fontConfig.import)
      variables.push(fontConfig.variable)
    }
  }

  if (config.headingFont && config.headingFont !== 'preset' && config.headingFont !== 'custom') {
    const fontConfig = FONT_IMPORT_MAP[config.headingFont]
    if (fontConfig) {
      imports.push(fontConfig.import)
      variables.push(fontConfig.variable)
    }
  }

  return `// app/layout.tsx
${imports.join('\n\n')}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={\`${variables.join(' ')}\`}>
      <body>{children}</body>
    </html>
  )
}
`
}

/**
 * Get font family CSS strings for inline styles
 *
 * @param config - Theme configuration
 * @returns Object with bodyFont and headingFont CSS font-family strings
 */
export function getThemeFontFamilies(config: ThemeConfig): {
  bodyFont?: string
  headingFont?: string
} {
  const result: { bodyFont?: string; headingFont?: string } = {}

  // Body font
  if (config.bodyFont === 'custom' && config.bodyFontCustom) {
    result.bodyFont = config.bodyFontCustom
  } else if (config.bodyFont && config.bodyFont !== 'preset') {
    result.bodyFont = `var(--font-body), ${config.bodyFont}, sans-serif`
  }

  // Heading font
  if (config.headingFont === 'custom' && config.headingFontCustom) {
    result.headingFont = config.headingFontCustom
  } else if (config.headingFont && config.headingFont !== 'preset') {
    result.headingFont = `var(--font-heading), ${config.headingFont}, serif`
  }

  return result
}

/**
 * React component wrapper for font variables
 * Use this to inject font CSS variables into your app
 */
export function ThemeFontProvider({
  children,
  bodyFont,
  headingFont,
  bodyFontCustom,
  headingFontCustom,
}: {
  children: React.ReactNode | any
  bodyFont?: string
  headingFont?: string
  bodyFontCustom?: string
  headingFontCustom?: string
}) {
  const fonts = getThemeFontFamilies({ bodyFont, headingFont, bodyFontCustom, headingFontCustom })

  return (
    <div
      style={
        {
          '--font-body': fonts.bodyFont,
          '--font-heading': fonts.headingFont,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  )
}

/**
 * Client-side hook for accessing theme fonts
 * Use this in client components to read font CSS variables
 */
export function useThemeFonts() {
  if (typeof window === 'undefined') {
    return { bodyFont: undefined, headingFont: undefined }
  }

  const bodyFont = getComputedStyle(document.documentElement).getPropertyValue('--font-body')
  const headingFont = getComputedStyle(document.documentElement).getPropertyValue('--font-heading')

  return {
    bodyFont: bodyFont || undefined,
    headingFont: headingFont || undefined,
  }
}
