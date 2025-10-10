# Extended Themes Usage Guide

> **shadcn/ui-compatible theme system** - Works exactly like [silicondeck/shadcn-dashboard-landing-template](https://github.com/silicondeck/shadcn-dashboard-landing-template)

## Overview

The extended theme system provides:

- ✅ **OKLCH colors** - Better color perception than HSL
- ✅ **30+ semantic tokens** - background, foreground, primary, secondary, accent, muted, destructive, border, card, popover, etc.
- ✅ **Chart colors** - 5-color sets for data visualization (chart-1 through chart-5)
- ✅ **Light & Dark modes** - Complete configurations for each
- ✅ **Tailwind-ready** - Use semantic classes like `bg-primary`, `text-card-foreground`
- ✅ **Client-side switching** - Change themes dynamically via JavaScript
- ✅ **No SSR overhead** - Base styles in CSS, dynamic switching via JS

## How It Works (Like silicondeck)

1. **Define base CSS variables** in `globals.css` (`:root` and `.dark`)
2. **Client-side JS** sets CSS variables on `document.documentElement` for dynamic theme switching
3. **Use semantic Tailwind classes** in your components

**No inline styles on `<html>` tag!**

---

## Available Themes

### 1. `cool-extended`
- **Style**: Clean, professional blue tones
- **Use Case**: Business applications, dashboards
- **Colors**: Blue primary, neutral grays
- **Best For**: Corporate, SaaS, B2B products

### 2. `neon-extended`
- **Style**: Vibrant cyberpunk aesthetic
- **Use Case**: Creative/tech brands, gaming
- **Colors**: Pink/purple accents, dark backgrounds
- **Best For**: Creative agencies, tech startups, portfolio sites

### 3. `solar-extended`
- **Style**: Warm, inviting orange/yellow tones
- **Use Case**: Friendly applications, communities
- **Colors**: Orange primary, warm neutrals
- **Best For**: Social networks, community platforms, educational apps

---

## Setup

### Step 1: Generate Base CSS

```bash
# In your project
pnpm add @kilivi/payloadcms-theme-management@latest
```

Create a script to generate CSS:

```ts
// scripts/generate-theme-css.ts
import { extendedThemePresets, generateExtendedThemeCSS } from '@kilivi/payloadcms-theme-management'

const theme = extendedThemePresets['cool-extended'] // or 'neon-extended', 'solar-extended'
const css = generateExtendedThemeCSS(theme)

console.log(css)
```

Run it:

```bash
npx tsx scripts/generate-theme-css.ts
```

### Step 2: Add to `globals.css`

Copy the generated CSS to your `globals.css`:

```css
/* app/globals.css */
@import "tailwindcss";

/* Extended Theme: Cool */
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.2 0 0);
  --card: oklch(0.98 0 0);
  --card-foreground: oklch(0.2 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.2 0 0);
  --primary: oklch(0.5 0.2 250);
  --primary-foreground: oklch(0.98 0 250);
  --secondary: oklch(0.95 0.01 250);
  --secondary-foreground: oklch(0.3 0.02 250);
  --muted: oklch(0.96 0.01 250);
  --muted-foreground: oklch(0.5 0.02 250);
  --accent: oklch(0.94 0.02 250);
  --accent-foreground: oklch(0.3 0.02 250);
  --destructive: oklch(0.6 0.25 30);
  --destructive-foreground: oklch(0.98 0 30);
  --border: oklch(0.92 0.01 250);
  --input: oklch(0.92 0.01 250);
  --ring: oklch(0.5 0.2 250);
  --chart-1: oklch(0.55 0.22 250);
  --chart-2: oklch(0.65 0.18 200);
  --chart-3: oklch(0.7 0.15 280);
  --chart-4: oklch(0.6 0.2 220);
  --chart-5: oklch(0.75 0.12 260);
  --radius: 0.5rem;
}

.dark {
  --background: oklch(0.15 0.01 250);
  --foreground: oklch(0.95 0.01 250);
  --card: oklch(0.18 0.01 250);
  --card-foreground: oklch(0.95 0.01 250);
  --popover: oklch(0.18 0.01 250);
  --popover-foreground: oklch(0.95 0.01 250);
  --primary: oklch(0.6 0.25 250);
  --primary-foreground: oklch(0.98 0.01 250);
  --secondary: oklch(0.25 0.02 250);
  --secondary-foreground: oklch(0.95 0.01 250);
  --muted: oklch(0.25 0.02 250);
  --muted-foreground: oklch(0.7 0.02 250);
  --accent: oklch(0.28 0.03 250);
  --accent-foreground: oklch(0.95 0.01 250);
  --destructive: oklch(0.65 0.28 30);
  --destructive-foreground: oklch(0.98 0 30);
  --border: oklch(0.28 0.02 250);
  --input: oklch(0.28 0.02 250);
  --ring: oklch(0.6 0.25 250);
  --chart-1: oklch(0.65 0.25 250);
  --chart-2: oklch(0.7 0.2 200);
  --chart-3: oklch(0.75 0.15 280);
  --chart-4: oklch(0.68 0.22 220);
  --chart-5: oklch(0.8 0.12 260);
  --radius: 0.5rem;
}
```

### Step 3: Configure Tailwind

```ts
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
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
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [],
}

export default config
```

---

## Usage

### Basic Layout (No Changes Needed!)

```tsx
// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="antialiased">
      <body className="bg-background">
        <ThemeProvider defaultTheme="system" storageKey="app-theme">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### Using Semantic Colors

```tsx
export function MyCard() {
  return (
    <div className="bg-card text-card-foreground p-6 rounded-lg border border-border">
      <h2 className="text-2xl font-bold text-foreground mb-4">Card Title</h2>
      <p className="text-muted-foreground mb-4">
        This uses semantic colors that automatically adapt to light/dark mode
      </p>
      <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md">
        Primary Action
      </button>
      <button className="bg-secondary text-secondary-foreground px-4 py-2 rounded-md ml-2">
        Secondary Action
      </button>
    </div>
  )
}
```

### Chart Example

```tsx
import { Bar, BarChart } from "recharts"

const data = [
  { month: "Jan", sales: 100 },
  { month: "Feb", sales: 200 },
  { month: "Mar", sales: 150 },
]

export function SalesChart() {
  return (
    <BarChart data={data}>
      <Bar dataKey="sales" className="fill-chart-1" />
    </BarChart>
  )
}
```

---

## Dynamic Theme Switching (Client-Side)

### Simple Theme Switcher

```tsx
// components/ThemeSwitcher.tsx
'use client'

import { useEffect, useState } from 'react'
import { extendedThemePresets, applyExtendedTheme } from '@kilivi/payloadcms-theme-management'

export function ThemeSwitcher() {
  const [theme, setTheme] = useState('cool-extended')
  const [mode, setMode] = useState<'light' | 'dark'>('light')

  // Detect dark mode from document
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark')
    setMode(isDark ? 'dark' : 'light')

    // Watch for class changes
    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains('dark')
      setMode(isDark ? 'dark' : 'light')
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    return () => observer.disconnect()
  }, [])

  // Apply theme when changed
  useEffect(() => {
    const themePreset = extendedThemePresets[theme]
    if (themePreset) {
      applyExtendedTheme(themePreset, mode)
    }
  }, [theme, mode])

  return (
    <div className="bg-card p-4 rounded-lg border border-border">
      <label className="block text-sm font-medium mb-2">Theme</label>
      <select
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
        className="w-full p-2 bg-background border border-input rounded"
      >
        {Object.entries(extendedThemePresets).map(([key, preset]) => (
          <option key={key} value={key}>
            {preset.label}
          </option>
        ))}
      </select>
    </div>
  )
}
```

---

## API Reference

### `generateExtendedThemeCSS(theme)`

Generates CSS content for `globals.css`.

```ts
import { extendedThemePresets, generateExtendedThemeCSS } from '@kilivi/payloadcms-theme-management'

const css = generateExtendedThemeCSS(extendedThemePresets['cool-extended'])
console.log(css) // Copy to globals.css
```

### `applyExtendedTheme(theme, mode)`

Apply theme dynamically via JavaScript (client-side only).

```ts
import { extendedThemePresets, applyExtendedTheme } from '@kilivi/payloadcms-theme-management'

// Apply cool theme in dark mode
applyExtendedTheme(extendedThemePresets['cool-extended'], 'dark')
```

### `resetExtendedTheme()`

Remove all extended theme CSS variables.

```ts
import { resetExtendedTheme } from '@kilivi/payloadcms-theme-management'

// Reset to base styles
resetExtendedTheme()
```

### `getExtendedThemeTokens(theme, mode, keys)`

Extract specific tokens from a theme.

```ts
import { extendedThemePresets, getExtendedThemeTokens } from '@kilivi/payloadcms-theme-management'

const chartColors = getExtendedThemeTokens(
  extendedThemePresets['neon-extended'],
  'dark',
  ['chart-1', 'chart-2', 'chart-3']
)
```

---

## Migration from Original System

The extended theme system works **alongside** your existing themes:

- ✅ Original `defaultThemePresets` still work
- ✅ `ServerThemeInjector` still works
- ✅ `resolveThemeConfiguration` still works
- ✅ No breaking changes

You can use both systems in the same project!

---

## Troubleshooting

### Colors not applying?

1. Check `globals.css` has the CSS variables
2. Verify Tailwind config has the color mappings
3. Make sure you're using `className` not inline styles

### Dark mode not working?

1. Ensure ThemeProvider adds `.dark` class to `<html>`
2. Check `.dark` selector exists in `globals.css`
3. Verify applyExtendedTheme receives correct mode

### shadcn/ui components not styled?

Extended themes are **compatible** with shadcn/ui out of the box. Just make sure you're using the same CSS variable names.

---

## Examples

- [Quick Start Guide](./QUICK_START_EXTENDED.md)
- [Full Documentation](./EXTENDED_THEMES_GUIDE.md)
- [Comparison with silicondeck repo](https://github.com/silicondeck/shadcn-dashboard-landing-template)
