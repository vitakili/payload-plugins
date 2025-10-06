# Test App Setup Guide

This guide will help you create a minimal Next.js app to test the `@kilivi/payloadcms-theme-management` plugin.

## Quick Start

### 1. Create a New Next.js + Payload App

```bash
npx create-payload-app@latest my-theme-test
```

**During setup, choose:**
- ✅ Next.js
- ✅ MongoDB or PostgreSQL
- ✅ TypeScript
- ✅ Blank template (or any template)

### 2. Install the Theme Plugin

```bash
cd my-theme-test
pnpm add @kilivi/payloadcms-theme-management@latest
```

### 3. Configure Payload

**Edit `src/payload.config.ts`:**

```typescript
import { buildConfig } from 'payload'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { themeManagementPlugin } from '@kilivi/payloadcms-theme-management'

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET || 'your-secret-here',
  
  collections: [
    // Your other collections
  ],
  
  globals: [
    {
      slug: 'site-settings',
      fields: [
        {
          name: 'siteName',
          type: 'text',
          required: true,
        },
        // themeConfiguration field will be added by the plugin
      ],
    },
  ],
  
  plugins: [
    themeManagementPlugin({
      enabled: true,
      targetCollection: 'site-settings', // or your global slug
      defaultTheme: 'cool',
      includeColorModeToggle: true,
      enableLogging: true, // See what the plugin is doing
    }),
  ],
  
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || 'mongodb://localhost/theme-test',
  }),
  
  editor: lexicalEditor(),
  
  typescript: {
    outputFile: 'src/payload-types.ts',
  },
})
```

### 4. Add Server Theme Injection

**Edit `src/app/(app)/layout.tsx`:**

```tsx
import { ServerThemeInjector } from '@kilivi/payloadcms-theme-management/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Theme Test App',
  description: 'Testing theme management plugin',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const payload = await getPayload({ config: configPromise })
  
  // Fetch site settings with theme configuration
  const { docs } = await payload.find({
    collection: 'site-settings',
    limit: 1,
    depth: 1,
  })
  
  const siteSettings = docs[0] || null

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Inject critical theme CSS during SSR */}
        <ServerThemeInjector siteSettings={siteSettings} />
      </head>
      <body>
        <div className="min-h-screen bg-background text-foreground">
          {children}
        </div>
      </body>
    </html>
  )
}
```

### 5. Create a Test Page

**Create `src/app/(app)/theme-test/page.tsx`:**

```tsx
import configPromise from '@payload-config'
import { getPayload } from 'payload'

export default async function ThemeTestPage() {
  const payload = await getPayload({ config: configPromise })
  
  const { docs } = await payload.find({
    collection: 'site-settings',
    limit: 1,
  })
  
  const theme = docs[0]?.themeConfiguration

  return (
    <div className="container mx-auto p-8 space-y-8">
      <h1 className="text-4xl font-bold">Theme Test Page</h1>
      
      {/* Test Theme Colors */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Color Palette</h2>
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-primary text-primary-foreground p-4 rounded-lg">
            Primary
          </div>
          <div className="bg-secondary text-secondary-foreground p-4 rounded-lg">
            Secondary
          </div>
          <div className="bg-accent text-accent-foreground p-4 rounded-lg">
            Accent
          </div>
          <div className="bg-muted text-muted-foreground p-4 rounded-lg">
            Muted
          </div>
        </div>
      </section>

      {/* Test Border Radius */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Border Radius</h2>
        <div className="flex gap-4">
          <div className="bg-primary p-4 rounded">Rounded</div>
          <div className="bg-secondary p-4 rounded-md">Rounded MD</div>
          <div className="bg-accent p-4 rounded-lg">Rounded LG</div>
        </div>
      </section>

      {/* Test Typography */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Typography</h2>
        <div className="space-y-2">
          <h1 className="text-5xl font-heading">Heading 1</h1>
          <h2 className="text-4xl font-heading">Heading 2</h2>
          <h3 className="text-3xl font-heading">Heading 3</h3>
          <p className="text-lg font-body">
            Body text using the configured font family. Lorem ipsum dolor sit amet.
          </p>
          <code className="text-sm font-code bg-muted p-2 rounded">
            Code font example
          </code>
        </div>
      </section>

      {/* Debug Info */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Theme Configuration</h2>
        <pre className="bg-muted p-4 rounded-lg overflow-auto text-xs">
          {JSON.stringify(theme, null, 2)}
        </pre>
      </section>
    </div>
  )
}
```

### 6. Run the App

```bash
# Generate types
pnpm payload generate:types

# Start dev server
pnpm dev
```

### 7. Test the Plugin

1. **Open Payload Admin:** http://localhost:3000/admin

2. **Login** (create account if first time)

3. **Go to Site Settings:**
   - Navigate to Globals → Site Settings
   - You should see a "Theme Configuration" field group
   - Try changing:
     - Theme preset (Cool, Brutal, Neon, etc.)
     - Color mode toggle
     - Custom colors
     - Border radius
     - Typography

4. **View Test Page:** http://localhost:3000/theme-test
   - Should see your theme applied
   - Colors, fonts, and radius should match your configuration

5. **Test SSR (No FOUC):**
   - Disable JavaScript in DevTools
   - Reload the page
   - Theme should still be applied (proves SSR is working)

## Common Test Scenarios

### Test 1: Theme Preset Switching

1. Go to Site Settings in Payload Admin
2. Change theme preset from "Cool" to "Brutal"
3. Save
4. Visit `/theme-test`
5. Verify colors changed

### Test 2: Custom Colors

1. In Site Settings, expand "Primary Color"
2. Use color picker to choose a custom color
3. Save
4. Verify the primary color changed on test page

### Test 3: Dark Mode

1. Enable "Color Mode Toggle" in theme settings
2. Set default mode to "dark"
3. Save
4. Page should use dark theme automatically

### Test 4: Typography

1. Change "Heading Font" to "Inter"
2. Change "Body Font" to "Roboto"
3. Save
4. Headings and body text should use different fonts

## Troubleshooting

### Plugin Not Showing in Config

**Check console for errors:**
```bash
# You should see this when plugin loads:
# 🎨 Theme Management Plugin: injecting theme configuration field
# 🎨 Theme Management Plugin: enhancing collection "site-settings"
```

**Enable logging:**
```typescript
themeManagementPlugin({
  enableLogging: true, // <-- Add this
})
```

### Theme Not Applied

**Check these:**

1. `ServerThemeInjector` is in `<head>`
2. Imported from `/server` not main entry
3. CSS classes match Tailwind config
4. Site settings exist and have theme configuration

### TypeScript Errors

```bash
# Regenerate Payload types
pnpm payload generate:types

# Restart TypeScript server in VS Code
# Ctrl+Shift+P → "TypeScript: Restart TS Server"
```

### Build Errors

**If you see `fs/promises` error:**

Make sure you're using v0.1.9 or later:

```bash
pnpm add @kilivi/payloadcms-theme-management@latest
rm -rf .next
pnpm dev
```

## Advanced: Integrate with Tailwind

**Edit `tailwind.config.ts`:**

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // CSS variables injected by ServerThemeInjector
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
        code: ['var(--font-code)', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
}

export default config
```

## Next Steps

Once the test app works:

1. ✅ Verify theme switching works
2. ✅ Test custom colors
3. ✅ Test typography changes
4. ✅ Test border radius presets
5. ✅ Test dark mode toggle
6. ✅ Verify SSR (no FOUC)
7. ✅ Test production build

Then integrate into your main application with confidence!
