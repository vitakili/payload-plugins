# Theme Management Plugin - Developer Quick Start

## Installation

```bash
pnpm add @kilivi/payloadcms-theme-management
```

## Payload Setup (One Time)

```typescript
// payload.config.ts
import { themeManagementPlugin } from '@kilivi/payloadcms-theme-management'

export default buildConfig({
  plugins: [
    themeManagementPlugin({
      collections: ['site-settings'],
    }),
  ],
})
```

## Frontend Setup (3 Steps)

### Step 1: Fetch Theme

```typescript
// lib/theme.ts
export async function getTheme() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_PAYLOAD_URL}/api/site-settings`)
  const data = await res.json()
  return data.themeConfiguration
}
```

### Step 2: Apply Theme

```typescript
// app/layout.tsx
import { generateThemeCSS } from '@kilivi/payloadcms-theme-management'
import { getTheme } from '@/lib/theme'

export default async function Layout({ children }) {
  const theme = await getTheme()
  const css = generateThemeCSS(theme)

  return (
    <html>
      <head>
        <style dangerouslySetInnerHTML={{ __html: css }} />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

### Step 3: Load Fonts

```typescript
// app/layout.tsx
import { Inter, Playfair_Display } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body'
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-heading'
})

export default async function Layout({ children }) {
  return (
    <html className={`${inter.variable} ${playfair.variable}`}>
      <body>{children}</body>
    </html>
  )
}
```

## Use Theme in Components

```tsx
// Any component
<button
  style={{
    backgroundColor: 'var(--theme-primary)',
    color: 'var(--theme-primary-foreground)',
    fontFamily: 'var(--font-body)',
    borderRadius: 'var(--border-radius)',
  }}
>
  Click me
</button>
```

## Available CSS Variables

```css
/* Colors */
--theme-background
--theme-foreground
--theme-primary
--theme-primary-foreground
--theme-secondary
--theme-accent
--theme-muted
--theme-border

/* Typography */
--font-body
--font-heading
--font-size-base
--line-height

/* Layout */
--border-radius
--border-radius-sm
--border-radius-lg

/* Extended Theme (if enabled) */
--background
--foreground
--primary
--secondary
--accent
--muted
--destructive
--border
--input
--ring
--chart-1, --chart-2, etc.
```

## Dark Mode

Automatically handled via `[data-theme="dark"]` attribute.

```tsx
// Toggle dark mode
<button onClick={() => (document.documentElement.dataset.theme = 'dark')}>Dark Mode</button>
```

## Helper Functions

```typescript
// Generate font loading code
import { getFontLoaderCode, useThemeFonts } from '@kilivi/payloadcms-theme-management'

const code = getFontLoaderCode(themeConfig.typography)
console.log(code) // Copy to layout

// Use font hook in client components
;('use client')

const { bodyFont, headingFont } = useThemeFonts()
```

## That's It!

✅ Zero configuration
✅ Auto-generated CSS
✅ Type-safe
✅ Dark mode support
✅ Font optimization

For full documentation, see:

- `CMS_TO_FRONTEND_INTEGRATION.md` - Complete guide
- `VERIFICATION_COMPLETE.md` - Technical details
