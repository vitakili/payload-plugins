# Theme Management Plugin - CMS to Frontend Integration

## Overview

This plugin provides **ZERO-CONFIG** theme management from Payload CMS to your Next.js frontend. All settings configured in the CMS are automatically available to your frontend application.

---

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    PAYLOAD CMS                          │
│  (Admin configures theme via UI)                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. Select Theme Preset                                 │
│     └─ Auto-populates colors                           │
│                                                         │
│  2. Extended Theme (Advanced)                           │
│     └─ Auto-populates 36+ OKLCH colors                 │
│                                                         │
│  3. Typography                                          │
│     └─ Select fonts (rendered in actual fonts)         │
│                                                         │
│  4. Customization                                       │
│     └─ Fine-tune colors, borders, shadows              │
│                                                         │
└─────────────────────────────────────────────────────────┘
                        ↓
                    SAVES TO
                        ↓
┌─────────────────────────────────────────────────────────┐
│                   DATABASE                              │
│  (SiteThemeConfiguration document)                      │
└─────────────────────────────────────────────────────────┘
                        ↓
                   FETCHED BY
                        ↓
┌─────────────────────────────────────────────────────────┐
│                  NEXT.JS FRONTEND                       │
│                                                         │
│  Step 1: Fetch theme config from CMS API               │
│  Step 2: Apply theme using plugin utilities            │
│  Step 3: Load fonts using plugin helpers               │
│                                                         │
└─────────────────────────────────────────────────────────┘
                        ↓
                   RESULTS IN
                        ↓
┌─────────────────────────────────────────────────────────┐
│               STYLED WEBSITE                            │
│  ✅ Colors applied via CSS variables                   │
│  ✅ Fonts loaded and applied                           │
│  ✅ Dark mode support                                  │
│  ✅ Typography, borders, shadows configured            │
└─────────────────────────────────────────────────────────┘
```

---

## Plugin Configuration (One-Time Setup)

### In Payload Config

```typescript
// payload.config.ts
import { themeManagementPlugin } from '@kilivi/payloadcms-theme-management'

export default buildConfig({
  // ... other config
  plugins: [
    themeManagementPlugin({
      collections: ['site-settings'], // Collection to add theme tab
      themePresets: defaultThemePresets, // Optional: custom presets
      enableAdvancedFeatures: true, // Enable extended OKLCH themes
    }),
  ],
})
```

**That's it for Payload!** The plugin automatically:

- ✅ Adds theme configuration tab to specified collection
- ✅ Provides theme presets with auto-population
- ✅ Includes font selectors with preview
- ✅ Adds color pickers with swatches
- ✅ Stores all settings in the collection document

---

## Frontend Integration (No Extra Config Needed)

### Step 1: Fetch Theme Configuration

```typescript
// lib/getThemeConfig.ts
import type { SiteThemeConfiguration } from '@kilivi/payloadcms-theme-management'

export async function getThemeConfig(): Promise<SiteThemeConfiguration | null> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_PAYLOAD_URL}/api/site-settings`)

  if (!response.ok) return null

  const data = await response.json()
  return data.themeConfiguration || null
}
```

### Step 2: Apply Theme in Root Layout

```typescript
// app/layout.tsx
import { getThemeConfig } from '@/lib/getThemeConfig'
import { generateThemeCSS } from '@kilivi/payloadcms-theme-management'

export default async function RootLayout({ children }) {
  const themeConfig = await getThemeConfig()

  // Generate CSS from theme config - NO MANUAL MAPPING!
  const themeCSS = themeConfig
    ? generateThemeCSS(themeConfig)
    : ''

  return (
    <html lang="en">
      <head>
        <style dangerouslySetInnerHTML={{ __html: themeCSS }} />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

**That's it!** All theme settings are now applied:

- ✅ Colors (light & dark mode)
- ✅ Typography scales
- ✅ Border radius
- ✅ Shadows (if extended theme used)
- ✅ All CSS variables set

### Step 3: Load Fonts (Optional but Recommended)

#### Option A: Static Import (Best Performance)

```typescript
// app/layout.tsx
import { Inter, Playfair_Display } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
})

export default async function RootLayout({ children }) {
  return (
    <html className={`${inter.variable} ${playfair.variable}`}>
      <body>{children}</body>
    </html>
  )
}
```

#### Option B: Dynamic with Plugin Helper

```typescript
// app/layout.tsx
import { getThemeConfig } from '@/lib/getThemeConfig'
import { getFontLoaderCode } from '@kilivi/payloadcms-theme-management'

export default async function RootLayout({ children }) {
  const themeConfig = await getThemeConfig()

  // Get font loading code - copy to imports if you want
  if (themeConfig?.typography) {
    const fontCode = getFontLoaderCode(themeConfig.typography)
    console.log('Font loading code:\n', fontCode)
  }

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
```

#### Option C: CSS Variable Provider

```typescript
// app/layout.tsx
import { ThemeFontProvider } from '@kilivi/payloadcms-theme-management'

export default async function RootLayout({ children }) {
  const themeConfig = await getThemeConfig()

  return (
    <html lang="en">
      <body>
        <ThemeFontProvider
          bodyFont={themeConfig?.typography?.bodyFont}
          headingFont={themeConfig?.typography?.headingFont}
          bodyFontCustom={themeConfig?.typography?.bodyFontCustom}
          headingFontCustom={themeConfig?.typography?.headingFontCustom}
        >
          {children}
        </ThemeFontProvider>
      </body>
    </html>
  )
}
```

---

## Available CSS Variables (Set Automatically)

### Basic Theme Variables

```css
:root {
  /* Colors - Light Mode */
  --theme-background: ...;
  --theme-foreground: ...;
  --theme-primary: ...;
  --theme-secondary: ...;
  --theme-accent: ...;
  --theme-muted: ...;
  --theme-border: ...;

  /* Typography */
  --font-body: ...;
  --font-heading: ...;
  --font-size-base: ...;
  --line-height: ...;

  /* Layout */
  --border-radius: ...;
  --border-radius-sm: ...;
  --border-radius-lg: ...;
}

[data-theme='dark'] {
  /* Colors - Dark Mode */
  --theme-background: ...;
  --theme-foreground: ...;
  /* ... all colors for dark mode */
}
```

### Extended Theme Variables (if enabled)

```css
:root {
  /* shadcn/ui compatible - OKLCH colors */
  --background: ...;
  --foreground: ...;
  --card: ...;
  --card-foreground: ...;
  --popover: ...;
  --primary: ...;
  --secondary: ...;
  --muted: ...;
  --accent: ...;
  --destructive: ...;
  --border: ...;
  --input: ...;
  --ring: ...;
  --chart-1: ...;
  --chart-2: ...;
  /* ... 18+ color tokens */

  /* Shadows */
  --shadow-sm: ...;
  --shadow-md: ...;
  --shadow-lg: ...;
}
```

---

## Using Theme in Components

### Basic Usage

```tsx
// components/Button.tsx
export function Button({ children }) {
  return (
    <button
      style={{
        backgroundColor: 'var(--theme-primary)',
        color: 'var(--theme-primary-foreground)',
        borderRadius: 'var(--border-radius)',
        fontFamily: 'var(--font-body)',
      }}
    >
      {children}
    </button>
  )
}
```

### With Tailwind CSS

```tsx
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: 'var(--primary)',
        secondary: 'var(--secondary)',
        // ... map all CSS variables
      },
    },
  },
}

// Component
<button className="bg-primary text-primary-foreground rounded-md">
  Click me
</button>
```

### Client-Side Theme Hook

```tsx
'use client'

import { useThemeFonts } from '@kilivi/payloadcms-theme-management'

export function MyComponent() {
  const { bodyFont, headingFont } = useThemeFonts()

  return (
    <div style={{ fontFamily: bodyFont }}>
      <h1 style={{ fontFamily: headingFont }}>Title</h1>
      <p>Body text</p>
    </div>
  )
}
```

---

## Features Automatically Handled

### ✅ From CMS Admin

- Theme preset selection → Colors auto-populate
- Extended theme selection → 36+ OKLCH colors auto-populate
- Font selection → Font names shown in actual fonts
- Color customization → Color picker with swatches
- Border radius → Visual preview
- All fields saved to database

### ✅ In Frontend

- `generateThemeCSS()` → Generates all CSS variables
- `ThemeProvider` → Provides theme context
- `useThemeFonts()` → Access fonts in client components
- `getFontLoaderCode()` → Get Next.js font import code
- Dark mode support → Automatic [data-theme="dark"] styles
- No manual color mapping needed!

---

## Advanced: Extended Theme System

The extended theme system provides **shadcn/ui compatible OKLCH colors** with full support for:

- ✅ 18+ color tokens (primary, secondary, accent, destructive, muted, etc.)
- ✅ Chart colors (chart-1 through chart-5)
- ✅ Light & dark mode for all colors
- ✅ TweakCN compatibility
- ✅ Auto-population from theme presets

### Using Extended Themes

```typescript
// Generate CSS for server
import {
  allExtendedThemePresets,
  applyExtendedTheme,
  generateExtendedThemeCSS,
} from '@kilivi/payloadcms-theme-management'

// Apply theme on client
applyExtendedTheme(allExtendedThemePresets['cool-extended'], 'light')

const css = generateExtendedThemeCSS(allExtendedThemePresets['cool-extended'])
```

---

## Troubleshooting

### Colors Not Applying?

1. Check `generateThemeCSS()` is called
2. Verify theme CSS is injected in `<head>`
3. Check browser DevTools → Elements → Computed styles for CSS variables

### Fonts Not Loading?

1. Verify Next.js font imports are correct
2. Check `className` is applied to `<html>` tag
3. Verify CSS variables: `--font-body`, `--font-heading`
4. Check Network tab for font file loading

### Theme Not Updating?

1. Clear browser cache
2. Check CMS API returns updated config
3. Verify `generateThemeCSS()` receives new config
4. Rebuild Next.js app (if using static generation)

---

## Summary

**NO additional configuration needed in the plugin!**

1. ✅ Add plugin to Payload config → DONE
2. ✅ Configure theme in CMS admin → Colors auto-populate
3. ✅ Fetch config in frontend → Use `generateThemeCSS()`
4. ✅ Everything works automatically!

The plugin handles:

- Theme preset system with auto-population
- Extended OKLCH theme system
- Font selection with preview
- Color management with swatches
- CSS variable generation
- Dark mode support
- Font loading helpers

**Zero manual configuration. Zero hassle. Everything via CMS!**
