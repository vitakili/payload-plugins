# Migration Guide for v0.1.9

## Critical Breaking Changes

### Server-Only Exports Moved

To fix the `Module not found: Can't resolve 'fs/promises'` error, **server-only components and utilities have been moved to a separate entry point**.

## Required Changes in Your Next.js App

### 1. Update Package Version

```bash
pnpm update @kilivi/payloadcms-theme-management@latest
# or
pnpm add @kilivi/payloadcms-theme-management@0.1.9
```

### 2. Update Server Component Imports

**BEFORE (❌ OLD - Will cause errors):**

```typescript
import { ServerThemeInjector } from '@kilivi/payloadcms-theme-management'
```

**AFTER (✅ NEW - Correct):**

```typescript
import { ServerThemeInjector } from '@kilivi/payloadcms-theme-management/server'
```

### 3. Clear Next.js Cache

```bash
rm -rf .next
```

### 4. Restart Your Dev Server

```bash
pnpm dev
```

## What Changed?

### Server-Only Exports (Now in `/server`)

These exports are now **only available** from `@kilivi/payloadcms-theme-management/server`:

- `ServerThemeInjector` - Server component for SSR theme injection
- `getThemeCriticalCSS()` - Read CSS files from filesystem
- `getThemeCSSPath()` - Generate theme CSS paths
- `generateThemePreloadLinks()` - Generate preload link tags
- `createFallbackCriticalCSS()` - Create fallback CSS

**Why?** These use Node.js APIs like `fs/promises` and `path` which cannot run in the browser.

### Client-Safe Exports (Still in main entry)

These remain available from `@kilivi/payloadcms-theme-management`:

- `themeManagementPlugin` - Payload plugin
- `ThemeProvider` - Client component
- `fetchThemeConfiguration()` - Fetch theme config
- `generateThemeColorsCss()` - Generate CSS from theme colors
- `generateThemeCSS()` - Generate full theme CSS
- `getThemeStyles()` - Get theme style object
- All type exports

### Subpath Exports (Unchanged)

These continue to work as before:

- `@kilivi/payloadcms-theme-management/fields/*`
- `@kilivi/payloadcms-theme-management/components/*`
- `@kilivi/payloadcms-theme-management/utils/*`
- `@kilivi/payloadcms-theme-management/providers/*`

## Example: Correct Usage in Next.js

### Server Component (layout.tsx)

```tsx
import { ServerThemeInjector } from '@kilivi/payloadcms-theme-management/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const payload = await getPayload({ config: configPromise })
  
  const siteSettings = await payload.findGlobal({
    slug: 'site-settings',
    depth: 1,
  })

  return (
    <html lang="en">
      <head>
        <ServerThemeInjector siteSettings={siteSettings} />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

### Client Component

```tsx
'use client'

import { ThemeProvider } from '@kilivi/payloadcms-theme-management'
import { generateThemeColorsCss } from '@kilivi/payloadcms-theme-management'

export function MyClientComponent() {
  const css = generateThemeColorsCss({
    primary: { h: 200, s: 70, l: 50 },
    // ... other colors
  })
  
  return <div>...</div>
}
```

## Why This Change Was Necessary

### The Problem

When `ServerThemeInjector` was exported from the main entry point:

1. Client components imported from the main entry
2. Next.js tried to create a browser bundle for ALL exports
3. `ServerThemeInjector` imported `fs/promises` (Node.js only)
4. Browser bundle failed with: `Module not found: Can't resolve 'fs/promises'`

### The Solution

By moving server-only code to a separate entry point (`/server`):

1. Client components only import from the main entry
2. Server components explicitly import from `/server`
3. Next.js knows not to bundle `/server` exports for the browser
4. The `server-only` package enforces this at runtime

## Troubleshooting

### Still seeing `fs/promises` error?

1. Clear node_modules and reinstall:
   ```bash
   rm -rf node_modules .pnpm-store
   pnpm install
   ```

2. Verify you're importing from `/server`:
   ```bash
   grep -r "from '@kilivi/payloadcms-theme-management'" src/
   # Should NOT see ServerThemeInjector in results
   
   grep -r "from '@kilivi/payloadcms-theme-management/server'" src/
   # Should see ServerThemeInjector here
   ```

3. Clear Next.js cache:
   ```bash
   rm -rf .next
   ```

### TypeScript errors?

The type definitions are automatically resolved. If you see type errors:

```bash
# Restart TypeScript server in VS Code
# Press: Ctrl+Shift+P → "TypeScript: Restart TS Server"
```

## Additional Notes

- **No changes needed** to `payload.config.ts` - the plugin import remains the same
- **No changes needed** to field imports - they remain at `/fields/*`
- **No breaking changes** to the Payload plugin API itself
