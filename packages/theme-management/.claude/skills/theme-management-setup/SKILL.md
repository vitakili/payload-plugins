---
name: theme-management-setup
description: Install, register and wire up the @kilivi-dev/payloadcms-theme-management plugin in a Payload CMS v3 + Next.js App Router project — collection tab vs standalone collection, live preview, cache revalidation, and rendering the resolved theme on the front-end.
---

# Theme Management — setup & wiring

Use this skill when adding the `@kilivi-dev/payloadcms-theme-management` plugin to a
Payload v3 project, or when debugging why a configured theme is not showing on the
front-end.

## 1. Register the plugin

In `payload.config.ts`:

```ts
import { themeManagementPlugin } from '@kilivi-dev/payloadcms-theme-management'

export default buildConfig({
  plugins: [
    themeManagementPlugin({
      // Adds an "Appearance Settings" tab to an existing collection…
      targetCollection: 'site-settings',
      useStandaloneCollection: false,

      // …or set useStandaloneCollection: true to create a dedicated collection
      // standaloneCollectionSlug: 'appearance-settings',

      includeColorModeToggle: true, // light / dark / auto toggle
      includeCustomCSS: true,       // raw CSS escape hatch
      enableAdvancedFeatures: true, // animation level etc.

      // Native Payload Live Preview (iframe). `true` enables sensible defaults,
      // including mobile/tablet/desktop breakpoints out of the box.
      livePreview: true,

      // Append project-specific controls inside the themeConfiguration group:
      customThemeConfigurationFields: [/* Field[] */],
      customThemeConfigurationSections: [
        { label: { en: 'Booking Widget', cs: 'Rezervační widget' }, fields: [/* … */] },
      ],
    }),
  ],
})
```

Key options (full list in `ThemeManagementPluginOptions`, `src/types.ts`):
- `targetCollection` / `useStandaloneCollection` / `standaloneCollectionSlug`
- `themePresets`, `defaultTheme`
- `livePreview?: boolean | ThemeManagementLivePreviewOptions`
- `cacheRevalidation?: boolean | ThemeManagementCacheRevalidationOptions`
- `customThemeConfigurationFields` / `customThemeConfigurationSections`

After changing field components, regenerate the import map:
`payload generate:importmap`.

## 2. Render the theme on the front-end (App Router)

In the tenant/root layout (server component):

```tsx
import { ServerThemeInjector } from '@kilivi-dev/payloadcms-theme-management/server'
import { resolveThemeConfiguration, ThemeProvider } from '@kilivi-dev/payloadcms-theme-management'
import { getThemeHtmlAttributes } from '@kilivi-dev/payloadcms-theme-management'

const settings = await fetchSiteSettings() // your own fetch
const themeConfig = resolveThemeConfiguration(settings?.themeConfiguration)

return (
  <html {...getThemeHtmlAttributes(themeConfig)}>
    <head>
      <ServerThemeInjector themeConfiguration={settings?.themeConfiguration} />
    </head>
    <body>
      <ThemeProvider>{children}</ThemeProvider>
    </body>
  </html>
)
```

`ServerThemeInjector` emits the `<style>` with all CSS custom properties +
`html[data-*]` effect selectors at SSR time (no flash). `getThemeHtmlAttributes`
sets `data-theme`, `data-theme-mode`, `data-effect-style`, `data-card-style`, etc.

To fetch the stored config from a client/edge context use `fetchThemeConfiguration`
(supports collection or global via `useGlobal`, plus `tenantSlug`, `locale`, `draft`).

## 3. Cache revalidation (Next.js `unstable_cache`)

From `@kilivi-dev/payloadcms-theme-management/server`:
- `createCachedThemeFetcher`, `revalidateThemeCache`, `getThemeCacheTag`.

The plugin can also inject a Payload endpoint (default `/api/theme/revalidate`,
optional `secret`) when `cacheRevalidation` is enabled.

## Common pitfalls
- **Theme not applied on front-end** → `ServerThemeInjector` not in `<head>`, or
  `data-*` attributes missing on `<html>` (use `getThemeHtmlAttributes`).
- **Field components 404 in admin** → import map stale; run `payload generate:importmap`.
- **Don't re-export client field components from the root entry** — import them via
  the `./fields/*` subpath so `generate:importmap` stays server-safe.

Related: [theme-color-fields], [theme-live-preview].
