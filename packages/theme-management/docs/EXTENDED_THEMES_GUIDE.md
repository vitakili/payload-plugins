# Extended Theme System Guide

## 🎨 Shadcn-Style Extended Themes

Version 0.1.14+ includes a powerful extended theme system inspired by [shadcn/ui](https://ui.shadcn.com/themes) and [tweakcn](https://tweakcn.com/editor/theme).

### Key Features

✨ **Full shadcn/ui Color Tokens** - Complete set of semantic color tokens  
🎨 **OKLCH Color Format** - Modern color space for better perception  
📊 **Chart Colors** - 5 pre-configured chart colors per theme  
🌓 **Separate Light/Dark Modes** - Independent configurations  
⚡ **Tailwind Compatible** - Direct integration with Tailwind CSS  
🔄 **Backward Compatible** - Works alongside existing themes  

---

## 📦 What's Included

### Color Tokens

Every extended theme includes these tokens:

```typescript
interface ShadcnColorTokens {
  // Base
  background, foreground
  
  // Surfaces
  card, card-foreground
  popover, popover-foreground
  
  // Brand
  primary, primary-foreground
  secondary, secondary-foreground
  
  // States
  muted, muted-foreground
  accent, accent-foreground
  destructive, destructive-foreground
  
  // UI
  border, input, ring
  
  // Charts
  chart-1, chart-2, chart-3, chart-4, chart-5
  
  // Optional
  radius, font-sans, font-mono
}
```

### Available Themes

1. **cool-extended** - Cool & Professional with OKLCH
2. **neon-extended** - Neon Cyberpunk with vibrant colors
3. **solar-extended** - Solar Warmth with warm tones

More themes coming soon!

---

## 🚀 Usage

### Option 1: Server-Side Rendering (Recommended)

Use this for Next.js App Router or any SSR framework:

```tsx
// app/layout.tsx
import {
  extendedThemePresets,
  getExtendedThemeStyles,
} from '@kilivi/payloadcms-theme-management'

export default function RootLayout({ children }) {
  // Get the theme you want
  const theme = extendedThemePresets['cool-extended']
  
  // Generate inline styles for SSR (prevents FOUC)
  const lightStyles = getExtendedThemeStyles(theme, 'light')
  const darkStyles = getExtendedThemeStyles(theme, 'dark')
  
  return (
    <html lang="en">
      <head>
        {/* Inject theme variables as inline styles */}
        <style dangerouslySetInnerHTML={{
          __html: `
            :root {
              ${Object.entries(lightStyles).map(([k, v]) => `${k}: ${v};`).join('\n  ')}
            }
            
            .dark, [data-theme-mode="dark"] {
              ${Object.entries(darkStyles).map(([k, v]) => `${k}: ${v};`).join('\n  ')}
            }
          `
        }} />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

### Option 2: Client-Side Application

For client-side theme switching:

```tsx
// components/ThemeSwitcher.tsx
'use client'

import { useEffect, useState } from 'react'
import {
  extendedThemePresets,
  applyExtendedTheme,
  type ExtendedThemePreset,
} from '@kilivi/payloadcms-theme-management'

export function ThemeSwitcher() {
  const [selectedTheme, setSelectedTheme] = useState<string>('cool-extended')
  const [mode, setMode] = useState<'light' | 'dark'>('light')
  
  useEffect(() => {
    const theme = extendedThemePresets[selectedTheme]
    if (theme) {
      applyExtendedTheme(theme, mode)
    }
  }, [selectedTheme, mode])
  
  return (
    <div className="space-y-4">
      <div>
        <label>Theme:</label>
        <select
          value={selectedTheme}
          onChange={(e) => setSelectedTheme(e.target.value)}
          className="ml-2 p-2 border rounded"
        >
          {Object.keys(extendedThemePresets).map((key) => (
            <option key={key} value={key}>
              {extendedThemePresets[key].label}
            </option>
          ))}
        </select>
      </div>
      
      <div>
        <button
          onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}
          className="px-4 py-2 bg-primary text-primary-foreground rounded"
        >
          {mode === 'light' ? '🌙' : '☀️'} Toggle {mode} mode
        </button>
      </div>
    </div>
  )
}
```

### Option 3: Hybrid Approach (Best of Both Worlds)

Server-render for initial load, client-side for switching:

```tsx
// app/layout.tsx
import { extendedThemePresets, getExtendedThemeStyles } from '@kilivi/payloadcms-theme-management'
import { ThemeProvider } from './theme-provider' // Your custom provider

export default function RootLayout({ children }) {
  const theme = extendedThemePresets['cool-extended']
  const lightStyles = getExtendedThemeStyles(theme, 'light')
  
  return (
    <html lang="en" style={lightStyles}>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
```

```tsx
// theme-provider.tsx
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { extendedThemePresets, applyExtendedTheme } from '@kilivi/payloadcms-theme-management'

const ThemeContext = createContext<{
  theme: string
  mode: 'light' | 'dark'
  setTheme: (theme: string) => void
  setMode: (mode: 'light' | 'dark') => void
}>({
  theme: 'cool-extended',
  mode: 'light',
  setTheme: () => {},
  setMode: () => {},
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState('cool-extended')
  const [mode, setMode] = useState<'light' | 'dark'>('light')
  
  useEffect(() => {
    const themePreset = extendedThemePresets[theme]
    if (themePreset) {
      applyExtendedTheme(themePreset, mode)
    }
  }, [theme, mode])
  
  return (
    <ThemeContext.Provider value={{ theme, mode, setTheme, setMode }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
```

---

## 🎨 Tailwind Integration

### Step 1: Configure tailwind.config.ts

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'
import { getTailwindVarReferences } from '@kilivi/payloadcms-theme-management'

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
        ...getTailwindVarReferences(), // ← Add this!
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

### Step 2: Use in Components

```tsx
// Now you can use semantic color classes!
function MyComponent() {
  return (
    <div className="bg-background text-foreground">
      <div className="bg-card text-card-foreground p-6 rounded-lg">
        <h1 className="text-primary">Hello World</h1>
        <p className="text-muted-foreground">This uses theme colors!</p>
        <button className="bg-primary text-primary-foreground px-4 py-2 rounded">
          Click Me
        </button>
      </div>
    </div>
  )
}
```

---

## 📊 Chart Colors

Each theme includes 5 chart colors perfect for data visualization:

```tsx
import { Chart } from 'recharts'

const chartColors = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
]

function MyChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <Bar dataKey="value1" fill={chartColors[0]} />
        <Bar dataKey="value2" fill={chartColors[1]} />
        <Bar dataKey="value3" fill={chartColors[2]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
```

---

## 🔧 Advanced Usage

### Generate CSS Files

Generate standalone CSS files for themes:

```typescript
import { extendedThemePresets, generateExtendedThemeCSS } from '@kilivi/payloadcms-theme-management'
import fs from 'fs'

const theme = extendedThemePresets['cool-extended']
const css = generateExtendedThemeCSS(theme)

fs.writeFileSync('public/themes/cool-extended.css', css)
```

### Get Specific Tokens

Extract only the tokens you need:

```typescript
import { getExtendedThemeTokens, extendedThemePresets } from '@kilivi/payloadcms-theme-management'

const theme = extendedThemePresets['cool-extended']
const colors = getExtendedThemeTokens(theme, 'light', ['primary', 'background', 'accent'])

console.log(colors)
// { primary: 'oklch(...)', background: 'oklch(...)', accent: 'oklch(...)' }
```

### Create Custom Extended Theme

```typescript
import type { ExtendedThemePreset } from '@kilivi/payloadcms-theme-management'

const myCustomTheme: ExtendedThemePreset = {
  label: 'My Brand',
  value: 'my-brand',
  styles: {
    light: {
      background: 'oklch(1 0 0)',
      foreground: 'oklch(0.145 0 0)',
      primary: 'oklch(0.549 0.184 250.847)',
      'primary-foreground': 'oklch(0.985 0.005 250.847)',
      // ... add all required tokens
      'chart-1': 'oklch(0.549 0.184 250.847)',
      'chart-2': 'oklch(0.645 0.168 250.847)',
      'chart-3': 'oklch(0.445 0.204 250.847)',
      'chart-4': 'oklch(0.349 0.184 250.847)',
      'chart-5': 'oklch(0.749 0.124 250.847)',
    },
    dark: {
      // ... dark mode variants
    },
  },
}

// Use it
applyExtendedTheme(myCustomTheme, 'light')
```

---

## 🔄 Compatibility

### Works With Existing Themes

Extended themes work alongside your existing theme system:

```tsx
// Use extended themes for colors
import { extendedThemePresets, getExtendedThemeStyles } from '@kilivi/payloadcms-theme-management'

// Use original themes for other features
import { resolveThemeConfiguration, getThemeHtmlAttributes } from '@kilivi/payloadcms-theme-management'

const extendedTheme = extendedThemePresets['cool-extended']
const themeConfig = resolveThemeConfiguration(siteSettings?.themeConfiguration)

// Combine both!
<html
  {...getThemeHtmlAttributes(themeConfig)}
  style={getExtendedThemeStyles(extendedTheme, 'light')}
>
```

### Migration Path

1. **Keep using original themes** - Nothing breaks
2. **Add extended themes gradually** - Start with colors
3. **Full migration (optional)** - Move completely to extended system

---

## 🎯 Best Practices

### 1. Server-Side Initial Load

Always inject theme CSS on the server to prevent FOUC:

```tsx
// ✅ Good - SSR
<html style={getExtendedThemeStyles(theme, mode)}>

// ❌ Bad - Client-only (causes FOUC)
useEffect(() => applyExtendedTheme(theme, mode), [])
```

### 2. Use Semantic Classes

```tsx
// ✅ Good - Uses semantic tokens
<div className="bg-card text-card-foreground">

// ❌ Avoid - Hard-coded colors
<div className="bg-white text-black">
```

### 3. Respect User Preferences

```tsx
// ✅ Good - Respects system preference
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
setMode(prefersDark ? 'dark' : 'light')

// ✅ Good - Remembers user choice
localStorage.setItem('theme-mode', mode)
```

### 4. Provide Fallbacks

```tsx
// ✅ Good - Fallback for older browsers
.my-element {
  background: #3b82f6; /* Fallback */
  background: oklch(0.549 0.184 250.847); /* Modern */
}
```

---

## 📚 Examples

Check the `/examples` folder for complete working examples:

- ✅ Next.js App Router with Extended Themes
- ✅ Next.js Pages Router with Extended Themes
- ✅ Vite + React with Extended Themes
- ✅ Tailwind Integration
- ✅ Chart Integration
- ✅ Theme Switcher Component

---

## 🆘 Troubleshooting

### Colors Not Applying

**Problem**: Theme colors don't show up

**Solution**: Make sure CSS variables are injected:

```tsx
// Check in browser console
getComputedStyle(document.documentElement).getPropertyValue('--primary')
```

### Tailwind Classes Not Working

**Problem**: `bg-primary` doesn't apply color

**Solution**: Add `getTailwindVarReferences()` to your Tailwind config

### FOUC (Flash of Unstyled Content)

**Problem**: Page flashes white before theme applies

**Solution**: Use SSR injection with `getExtendedThemeStyles()`

---

## 🚀 Next Steps

1. Try the examples
2. Integrate with your Tailwind config
3. Create custom themes
4. Share your themes with the community!

---

## 📖 API Reference

See [API.md](./API.md) for complete API documentation.
