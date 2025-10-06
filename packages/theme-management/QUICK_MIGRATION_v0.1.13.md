# Quick Migration Guide - v0.1.13

## What's New
Version 0.1.13 dramatically simplifies theme integration by handling more complexity internally.

## Update Your Layout in 3 Easy Steps

### Step 1: Update the Package
```bash
pnpm update @kilivi/payloadcms-theme-management@latest
```

### Step 2: Simplify Your Layout File

**Before:**
```tsx
import { resolveThemeConfiguration } from '@kilivi/payloadcms-theme-management'
import { ServerThemeInjector } from '@kilivi/payloadcms-theme-management/server'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import React from 'react'
import { InitTheme } from '@/providers/Theme/InitTheme' // ❌ Remove this
import { cn } from '@/utilities/ui'

export default async function Layout({ children, params }) {
  const siteSettings = await getCachedSiteSettings(...)()
  
  // ❌ Too verbose
  const resolvedThemeConfiguration = resolveThemeConfiguration(siteSettings?.themeConfiguration)
  
  const htmlClassName = cn(GeistSans.variable, GeistMono.variable)
  
  return (
    <html
      className={htmlClassName}
      suppressHydrationWarning
      // ❌ Too many manual attributes
      data-theme={resolvedThemeConfiguration.theme}
      data-theme-mode={resolvedThemeConfiguration.colorMode}
      data-border-radius={resolvedThemeConfiguration.borderRadius}
      data-font-scale={resolvedThemeConfiguration.fontScale}
      data-spacing={resolvedThemeConfiguration.spacing}
      data-animation-level={resolvedThemeConfiguration.animationLevel}
      data-allow-color-mode-toggle={
        resolvedThemeConfiguration.allowColorModeToggle ? 'true' : 'false'
      }
    >
      <head>
        <ServerThemeInjector themeConfiguration={siteSettings?.themeConfiguration} />
        <InitTheme /> {/* ❌ Remove this */}
      </head>
      <body>
        <Providers
          initialTheme={resolvedThemeConfiguration.theme}
          initialMode={resolvedThemeConfiguration.colorMode}
          allowColorModeToggle={resolvedThemeConfiguration.allowColorModeToggle}
        >
          {children}
        </Providers>
      </body>
    </html>
  )
}
```

**After (v0.1.13):**
```tsx
import { 
  resolveThemeConfiguration,
  getThemeHtmlAttributes  // ✅ New helper
} from '@kilivi/payloadcms-theme-management'
import { ServerThemeInjector } from '@kilivi/payloadcms-theme-management/server'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import React from 'react'
// ✅ No more custom InitTheme import!
import { cn } from '@/utilities/ui'

export default async function Layout({ children, params }) {
  const siteSettings = await getCachedSiteSettings(...)()
  
  // ✅ Simpler variable name
  const themeConfig = resolveThemeConfiguration(siteSettings?.themeConfiguration)
  
  const htmlClassName = cn(GeistSans.variable, GeistMono.variable)
  
  return (
    <html
      className={htmlClassName}
      {...getThemeHtmlAttributes(themeConfig)}  // ✅ One line instead of 8!
    >
      <head>
        <ServerThemeInjector themeConfiguration={siteSettings?.themeConfiguration} />
        {/* ✅ InitTheme is now included automatically! */}
      </head>
      <body>
        <Providers
          initialTheme={themeConfig.theme}
          initialMode={themeConfig.colorMode}
          allowColorModeToggle={themeConfig.allowColorModeToggle}
        >
          {children}
        </Providers>
      </body>
    </html>
  )
}
```

### Step 3: Delete Your Custom InitTheme File
You can now safely delete:
```bash
# Delete your custom InitTheme component (example path)
rm src/providers/Theme/InitTheme.tsx
```

## What Changed

### 1. ✨ Auto-Included `InitTheme`
The `ServerThemeInjector` now automatically includes the theme initialization script. No need to import or use a separate component.

### 2. 🎯 `getThemeHtmlAttributes()` Helper
New utility function that generates all HTML attributes in one line:
```tsx
// Instead of this:
<html
  suppressHydrationWarning
  data-theme={themeConfig.theme}
  data-theme-mode={themeConfig.colorMode}
  data-border-radius={themeConfig.borderRadius}
  // ... 3 more lines
>

// Use this:
<html {...getThemeHtmlAttributes(themeConfig)}>
```

### 3. 📘 Exported Types
New type export for better TypeScript support:
```tsx
import type { ResolvedThemeConfiguration } from '@kilivi/payloadcms-theme-management'
```

## Benefits

✅ **15 fewer lines** of boilerplate code  
✅ **No custom components** to maintain  
✅ **Cleaner imports** - one less import  
✅ **Less error-prone** - can't forget InitTheme  
✅ **Better DX** - more intuitive API  

## Verification

After updating, make sure:
- ✅ Dark mode toggle still works
- ✅ System preference detection works
- ✅ Theme applies correctly on page load
- ✅ No TypeScript errors
- ✅ No console errors

## Full Example: Your Exact Code

Here's how your layout should look after the update:

```tsx
import { 
  resolveThemeConfiguration,
  getThemeHtmlAttributes 
} from '@kilivi/payloadcms-theme-management'
import { ServerThemeInjector } from '@kilivi/payloadcms-theme-management/server'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import React from 'react'
import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { AdminBar } from '@/components/AdminBar'
import { RenderFooter } from '@/globals/Footer/RenderFooter'
import { Providers } from '@/providers'
// ✅ Remove InitTheme import
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { cn } from '@/utilities/ui'
import './globals.css'
import { themeFontVariables } from '@/config/fonts'
import { CustomCode } from '@/globals/CustomCode/Component'
import { Favicon } from '@/globals/Favicon/Component'
import { RenderHeader } from '@/globals/Header/RenderHeader'
import { RenderWidget } from '@/globals/Widget/RenderWidget'
import { getCachedSiteSettings } from '@/utilities/getGlobals'
import { getServerSideURL } from '@/utilities/getURL'

type Locale = 'cs' | 'en'

export default async function TenantLocaleLayout({
  children,
  params: paramsPromise,
}: {
  readonly children: React.ReactNode
  readonly params: Promise<{ tenant: string; locale: string }>
}) {
  const params = await paramsPromise
  const { isEnabled } = await draftMode()
  const customScripts = await CustomCode()
  const locale: Locale = params.locale as Locale
  const tenantSlug = params.tenant

  const siteSettings = await getCachedSiteSettings(2, locale, tenantSlug)()

  // ✅ Simpler: one line instead of manual resolution
  const themeConfig = resolveThemeConfiguration(siteSettings?.themeConfiguration)

  const htmlClassName = cn(GeistSans.variable, GeistMono.variable, ...themeFontVariables)
  
  return (
    <html
      className={htmlClassName}
      lang={locale}
      {...getThemeHtmlAttributes(themeConfig)}  // ✅ All attributes in one line!
    >
      <head>
        <ServerThemeInjector themeConfiguration={siteSettings?.themeConfiguration} />
        {/* ✅ InitTheme removed - now automatic! */}
        <Favicon />
        {customScripts?.headScripts}
        {siteSettings?.searchEngineVisibility?.allowIndexing === false && (
          <meta content="noindex,nofollow" name="robots" />
        )}
      </head>
      <body className={'bg-background'}>
        <Providers
          initialTheme={themeConfig.theme}
          initialMode={themeConfig.colorMode}
          allowColorModeToggle={themeConfig.allowColorModeToggle}
          locale={locale}
        >
          <AdminBar adminBarProps={{ preview: isEnabled }} locale={locale} />
          {customScripts?.bodyStartScripts}
          <RenderHeader currentLocale={locale} tenantSlug={tenantSlug} />
          {children}
          <RenderWidget type="consentBanner" tenantSlug={tenantSlug} locale={locale} />
          <RenderWidget type="whatsapp" tenantSlug={tenantSlug} locale={locale} />
          <RenderFooter currentLocale={locale} tenantSlug={tenantSlug} />
          {customScripts?.bodyEndScripts}
        </Providers>
      </body>
    </html>
  )
}

export const generateMetadata = async ({
  params: paramsPromise,
}: {
  params: Promise<{ tenant: string; locale: string }>
}): Promise<Metadata> => {
  const params = await paramsPromise
  const locale: Locale = params.locale as Locale
  const tenantSlug = params.tenant
  const siteSettings = await getCachedSiteSettings(2, locale, tenantSlug)()
  const baseUrl = getServerSideURL()

  return {
    metadataBase: new URL(baseUrl),
    title: siteSettings?.title,
    description: siteSettings?.description,
    openGraph: mergeOpenGraph({
      title: siteSettings?.title,
      description: siteSettings?.description,
      locale: locale === 'en' ? 'en_US' : 'cs_CZ',
      alternateLocale: locale === 'en' ? ['cs_CZ'] : ['en_US'],
    }),
    twitter: { card: 'summary_large_image', creator: '@payloadcms' },
    robots:
      siteSettings?.searchEngineVisibility?.allowIndexing === false
        ? { index: false, follow: false }
        : undefined,
    alternates: {
      languages: {
        en: baseUrl,
        cs: baseUrl,
        'x-default': baseUrl,
      },
    },
  }
}
```

## Summary of Changes

1. ✅ Add `getThemeHtmlAttributes` to imports
2. ✅ Remove `InitTheme` import
3. ✅ Use `{...getThemeHtmlAttributes(themeConfig)}` on `<html>`
4. ✅ Remove `<InitTheme />` from `<head>`
5. ✅ Delete your custom `InitTheme.tsx` file

That's it! Your theme management is now simpler and cleaner. 🎉
