# Quick Start: Extended Themes (shadcn/ui Style)

> This guide shows you how to use the extended theme system that works EXACTLY like [silicondeck/shadcn-dashboard-landing-template](https://github.com/silicondeck/shadcn-dashboard-landing-template)

## How It Works

Just like the silicondeck repo:

1. **Define base CSS variables** in your `globals.css` (`:root` and `.dark`)
2. **Apply themes client-side** using JavaScript to set CSS variables on `document.documentElement`
3. **Use semantic Tailwind classes** like `bg-primary`, `text-card-foreground`

**NO inline styles on `<html>` tag!** The layout stays clean.

---

## Step-by-Step Integration

### Step 1: Install/Update Package

```bash
pnpm update @kilivi/payloadcms-theme-management@latest
```

### Step 2: Add Base CSS to `globals.css`

Generate the CSS for your chosen theme and add it to your `globals.css`:

```tsx
// In a Node.js script or during setup
import { extendedThemePresets, generateExtendedThemeCSS } from '@kilivi/payloadcms-theme-management'

const css = generateExtendedThemeCSS(extendedThemePresets['cool-extended'])
console.log(css)
```

Then paste the output into your `globals.css`:

```css
/* app/globals.css or src/index.css */
@import "tailwindcss";

/* Extended Theme Variables */
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.2 0 0);
  --card: oklch(0.98 0 0);
  --card-foreground: oklch(0.2 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.2 0 0);
  --primary: oklch(0.5 0.2 250);
  --primary-foreground: oklch(0.98 0 250);
  /* ... rest of light mode variables */
}

.dark {
  --background: oklch(0.15 0 0);
  --foreground: oklch(0.95 0 0);
  --card: oklch(0.18 0 0);
  --card-foreground: oklch(0.95 0 0);
  /* ... rest of dark mode variables */
}
```

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Semantic color classes using CSS variables
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

### Step 4: Your Layout (NO Changes Needed!)

Your layout stays **exactly the same** as the silicondeck repo:

```tsx
// app/layout.tsx (or app/[tenant]/[locale]/layout.tsx)
import type { Metadata } from "next";
import "./globals.css";

import { ThemeProvider } from "@/components/theme-provider";
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'

export const metadata: Metadata = {
  title: "My App",
  description: "App with extended themes",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}>
      <body className="bg-background">
        <ThemeProvider defaultTheme="system" storageKey="my-app-theme">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

**That's it!** No inline styles, no SSR injection. Clean and simple.

### Step 5: Apply Themes Client-Side (Optional)

If you want to switch themes dynamically:

```tsx
// components/ExtendedThemeSwitcher.tsx
'use client'

import { useEffect, useState } from 'react'
import { extendedThemePresets, applyExtendedTheme } from '@kilivi/payloadcms-theme-management'

export function ExtendedThemeSwitcher() {
  const [theme, setTheme] = useState('cool-extended')
  const [mode, setMode] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    // Detect current mode from ThemeProvider
    const isDark = document.documentElement.classList.contains('dark')
    setMode(isDark ? 'dark' : 'light')
  }, [])

  useEffect(() => {
    const themePreset = extendedThemePresets[theme]
    if (themePreset) {
      // Apply theme dynamically (sets CSS variables via JS)
      applyExtendedTheme(themePreset, mode)
    }
  }, [theme, mode])

  // Listen for theme changes from ThemeProvider
  useEffect(() => {
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

  return (
    <div className="fixed bottom-4 right-4 bg-card p-4 rounded-lg shadow-lg border border-border">
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Extended Theme
          </label>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="w-full p-2 bg-background border border-input rounded text-foreground"
          >
            {Object.entries(extendedThemePresets).map(([key, preset]) => (
              <option key={key} value={key}>
                {preset.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
```

### Step 6: Use Semantic Colors

Now you can use semantic color classes anywhere:

```tsx
// Example component
export function MyCard() {
  return (
    <div className="bg-card text-card-foreground p-6 rounded-lg border border-border">
      <h2 className="text-2xl font-bold text-foreground mb-4">Card Title</h2>
      <p className="text-muted-foreground mb-4">
        This card uses semantic theme colors that automatically adapt to light/dark mode
      </p>
      <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:opacity-90">
        Primary Button
      </button>
      <button className="bg-secondary text-secondary-foreground px-4 py-2 rounded-md ml-2">
        Secondary Button
      </button>
    </div>
  )
}
```

---

## Available Themes

### 1. Cool Extended (`cool-extended`)
- Clean, professional blue theme
- Perfect for business applications
- Good contrast ratios

### 2. Neon Extended (`neon-extended`)
- Vibrant cyberpunk aesthetic
- Pink and purple accents
- Great for creative/tech brands

### 3. Solar Extended (`solar-extended`)
- Warm, inviting orange/yellow tones
- Excellent for friendly applications
- High energy feel

---

## Color Classes Available

After setup, these Tailwind classes work automatically:

### Backgrounds
- `bg-background` - Main background
- `bg-card` - Card backgrounds
- `bg-popover` - Popover backgrounds
- `bg-primary` - Primary brand color
- `bg-secondary` - Secondary color
- `bg-muted` - Muted backgrounds
- `bg-accent` - Accent backgrounds
- `bg-destructive` - Error/danger backgrounds

### Text
- `text-foreground` - Main text
- `text-card-foreground` - Card text
- `text-primary-foreground` - Primary button text
- `text-muted-foreground` - Muted text
- `text-accent-foreground` - Accent text

### Borders
- `border-border` - Standard borders
- `border-input` - Input borders
- `ring-ring` - Focus rings

### Charts
- `fill-chart-1` through `fill-chart-5` - For data visualization

---

## Benefits Over Original System

### ✅ Better for Tailwind
```tsx
// ❌ Before: Complex custom color setup
<div style={{ backgroundColor: 'var(--custom-primary)' }}>

// ✅ After: Simple Tailwind classes
<div className="bg-primary">
```

### ✅ More Semantic
```tsx
// ❌ Before: Generic colors
<div className="bg-blue-500">

// ✅ After: Semantic meaning
<div className="bg-primary">  // Changes with theme!
```

### ✅ OKLCH Colors
- Better color perception
- More uniform brightness
- Smoother gradients

### ✅ Ready for shadcn/ui
If you use shadcn/ui components, they work out of the box!

---

## Backward Compatibility

**Everything still works!** Your existing:
- ✅ Theme presets (cool, brutal, neon, etc.)
- ✅ Color customization
- ✅ Typography settings
- ✅ Border radius config
- ✅ Dark mode toggle

The extended themes are **additive** - they add new capabilities without breaking anything.

---

## Next Steps

1. ✅ Update your layout (copy example above)
2. ✅ Update Tailwind config
3. ✅ Start using semantic classes
4. ✅ (Optional) Add theme switcher
5. ✅ Enjoy beautiful, consistent theming!

---

## Questions?

- 📖 Full docs: [EXTENDED_THEMES_GUIDE.md](./EXTENDED_THEMES_GUIDE.md)
- 🐛 Issues: [GitHub Issues](https://github.com/vitakili/payload-plugins/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/vitakili/payload-plugins/discussions)
