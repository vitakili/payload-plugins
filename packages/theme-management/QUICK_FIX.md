# 🔧 Quick Fix for Your Build Error

## The Error You're Seeing

```
Export ServerThemeInjector doesn't exist in target module
./src/app/(app)/[tenant]/[locale]/layout.tsx (1:1)

> 1 | import { resolveThemeConfiguration, ServerThemeInjector } from '@kilivi/payloadcms-theme-management'
```

## Why This Happens

✅ **This is expected!** The package was fixed to properly separate server and client code. `ServerThemeInjector` now lives in a separate `/server` entry point to prevent the `fs/promises` error.

## The Fix (2 Steps)

### Step 1: Update Your Import

**File:** `src/app/(app)/[tenant]/[locale]/layout.tsx`

**Before (❌ Current - Broken):**
```typescript
import { resolveThemeConfiguration, ServerThemeInjector } from '@kilivi/payloadcms-theme-management'
```

**After (✅ Fixed):**
```typescript
import { resolveThemeConfiguration } from '@kilivi/payloadcms-theme-management'
import { ServerThemeInjector } from '@kilivi/payloadcms-theme-management/server'
```

### Step 2: Clear Next.js Cache

```bash
rm -rf .next
pnpm dev
# or npm run dev
```

## Detailed Fix

Open your file at:
```
src/app/(app)/[tenant]/[locale]/layout.tsx
```

Replace line 1 with:

```typescript
import { resolveThemeConfiguration } from '@kilivi/payloadcms-theme-management'
import { ServerThemeInjector } from '@kilivi/payloadcms-theme-management/server'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import React from 'react'
// ... rest of your imports
```

## Why Split the Imports?

### Main Entry (`@kilivi/payloadcms-theme-management`)
**Can be used in both client and server components:**
- ✅ `resolveThemeConfiguration` - Pure utility function
- ✅ `generateThemeColorsCss` - Pure utility function
- ✅ `ThemeProvider` - Client component
- ✅ `fetchThemeConfiguration` - Uses fetch API

### Server Entry (`@kilivi/payloadcms-theme-management/server`)
**Can ONLY be used in server components:**
- 🔒 `ServerThemeInjector` - Uses `fs/promises`
- 🔒 `getThemeCriticalCSS` - Uses `fs/promises`
- 🔒 `getThemeCSSPath` - Server-only utility

## What if I Have Multiple Files?

### Find All Files That Need Fixing

**On macOS/Linux:**
```bash
grep -r "ServerThemeInjector.*from '@kilivi/payloadcms-theme-management'" src/
```

**On Windows (PowerShell):**
```powershell
Get-ChildItem -Recurse -Include *.ts,*.tsx | Select-String "ServerThemeInjector.*from '@kilivi/payloadcms-theme-management'"
```

### Automatic Fix (Use with Caution)

**On macOS/Linux:**
```bash
# Preview changes first
grep -rl "ServerThemeInjector" src/ | xargs grep "from '@kilivi/payloadcms-theme-management'"

# Then manually update each file
```

**Recommended:** Update each file manually to avoid breaking combined imports.

## Example: Full Layout File

Here's how your layout file should look:

```typescript
import { resolveThemeConfiguration } from '@kilivi/payloadcms-theme-management'
import { ServerThemeInjector } from '@kilivi/payloadcms-theme-management/server'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import React from 'react'

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { tenant: string; locale: string }
}) {
  // Fetch your site settings
  const siteSettings = await fetchSiteSettings(params.tenant)
  
  // Resolve theme configuration
  const themeConfig = resolveThemeConfiguration(siteSettings?.themeConfiguration)

  return (
    <html lang={params.locale}>
      <head>
        {/* Server-side theme injection */}
        <ServerThemeInjector themeConfiguration={siteSettings?.themeConfiguration} />
      </head>
      <body className={`${GeistSans.variable} ${GeistMono.variable}`}>
        {children}
      </body>
    </html>
  )
}
```

## After Fixing

Once you've updated the import:

1. ✅ No more build error
2. ✅ No `fs/promises` error
3. ✅ Server/client separation working correctly
4. ✅ Smaller client bundle (server code excluded)

## Still Having Issues?

### Clear Everything

```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules cache
rm -rf node_modules/.cache

# Reinstall dependencies (optional)
rm -rf node_modules
pnpm install

# Start fresh
pnpm dev
```

### Verify Package Version

```bash
pnpm list @kilivi/payloadcms-theme-management
# Should show: 0.1.9 or higher
```

If it's not 0.1.9+:

```bash
pnpm update @kilivi/payloadcms-theme-management@latest
```

### Check for Other Server-Only Imports

If you're importing these anywhere, they also need to come from `/server`:

```typescript
// ❌ Wrong
import { getThemeCriticalCSS } from '@kilivi/payloadcms-theme-management'

// ✅ Correct
import { getThemeCriticalCSS } from '@kilivi/payloadcms-theme-management/server'
```

## TypeScript Errors?

If TypeScript complains after fixing:

```bash
# Restart TypeScript server in VS Code
# Press: Ctrl+Shift+P (or Cmd+Shift+P on Mac)
# Type: "TypeScript: Restart TS Server"
# Press Enter
```

## Summary

**One-line fix:**
```typescript
import { ServerThemeInjector } from '@kilivi/payloadcms-theme-management/server'
```

That's it! 🎉
