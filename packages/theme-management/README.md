# @kilivi/payloadcms-theme-management

Theme Management plugin for Payload CMS v3 with SSR-ready theme variables, standalone appearance settings, cache revalidation, and Live Preview support.

## Version 2.0.0

### Highlights

- Standard Payload Live Preview flow for client pages (`/`, `/{slug}`)
- Optional injected preview endpoint (`GET /api/theme/preview`)
- Optional injected revalidation endpoint (`POST /api/theme/revalidate`)
- Standalone global mode with automatic theme cache invalidation
- Professional color picker and extended preset/token support
- Full TypeScript support and server/client-safe exports

## Installation

```bash
pnpm add @kilivi/payloadcms-theme-management
# or
npm i @kilivi/payloadcms-theme-management
# or
yarn add @kilivi/payloadcms-theme-management
```

## Quick Start

### 1) Register plugin in Payload

#### A) Inject as tab into existing collection (default)

```ts
import { themeManagementPlugin } from '@kilivi/payloadcms-theme-management'
import { buildConfig } from 'payload'

export default buildConfig({
  collections: [
    {
      slug: 'site-settings',
      fields: [{ name: 'siteName', type: 'text' }],
    },
  ],
  plugins: [
    themeManagementPlugin({
      targetCollection: 'site-settings',
      defaultTheme: 'cool',
      livePreview: true,
    }),
  ],
})
```

#### B) Create standalone appearance global

```ts
import { themeManagementPlugin } from '@kilivi/payloadcms-theme-management'
import { buildConfig } from 'payload'

export default buildConfig({
  plugins: [
    themeManagementPlugin({
      useStandaloneCollection: true,
      standaloneCollectionSlug: 'appearance-settings',
      standaloneCollectionLabel: 'Appearance Settings',
      defaultTheme: 'cool',
      livePreview: true,
    }),
  ],
})
```

### 2) Inject theme variables in Next.js layout

```tsx
import { ServerThemeInjector } from '@kilivi/payloadcms-theme-management/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const payload = await getPayload({ config: configPromise })

  const appearance = await payload.findGlobal({
    slug: 'appearance-settings',
  })

  return (
    <html lang="en">
      <head>
        <ServerThemeInjector themeConfiguration={appearance?.themeConfiguration} />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

## Live Preview (v2.0.0)

Plugin now supports Payload-style preview targeting your client pages by slug.

- `home` slug resolves to `/`
- any other slug resolves to `/{slug}`
- optional tenant query is appended when available

### Basic setup

```ts
themeManagementPlugin({
  livePreview: true,
})
```

### Advanced setup (with injected endpoint)

```ts
themeManagementPlugin({
  livePreview: {
    enabled: true,
    injectRoute: true,
    routePath: '/theme/preview',
    pageCollection: 'pages',
    pageSlug: 'home',
    fallbackToFirstPage: true,
    tenantField: 'tenant',
    tenantQueryParam: 'tenant',
    breakpoints: [
      { name: 'tablet', label: 'Tablet', width: 1024, height: 768 },
      { name: 'desktop', label: 'Desktop', width: 1440, height: 900 },
    ],
  },
})
```

### Injected preview endpoint

If `livePreview.injectRoute` is enabled, plugin injects:

- `GET /api/theme/preview` (or custom `routePath`)

Query params:

- `pageSlug`
- `previewSecret` (or `preview`)
- `tenant`

Secret resolution:

- `PREVIEW_SECRET`
- `PAYLOAD_PREVIEW_SECRET`

Example:

```txt
/api/theme/preview?pageSlug=home&previewSecret=your-secret
```

Response:

- `307` redirect to resolved client page path
- `401` when secret is configured but invalid/missing

### Single-tenant example (recommended baseline)

```ts
themeManagementPlugin({
  useStandaloneCollection: true,
  standaloneCollectionSlug: 'appearance-settings',
  livePreview: {
    enabled: true,
    injectRoute: true,
    routePath: '/theme/preview',
    pageCollection: 'pages',
    pageSlug: 'home',
  },
})
```

Preview request example:

```txt
/api/theme/preview?pageSlug=home&previewSecret=your-secret
```

Result:

- redirects to `/`

### Multi-tenant example

```ts
themeManagementPlugin({
  useStandaloneCollection: true,
  standaloneCollectionSlug: 'appearance-settings',
  livePreview: {
    enabled: true,
    injectRoute: true,
    routePath: '/theme/preview',
    pageCollection: 'pages',
    pageSlug: 'home',
    tenantField: 'tenant',
    tenantQueryParam: 'tenant',
  },
  cacheRevalidation: {
    enabled: true,
    injectRoute: true,
    routePath: '/theme/revalidate',
    secret: process.env.THEME_REVALIDATE_SECRET,
    tags: ['tenant:acme'],
    paths: ['/'],
  },
})
```

Preview request example:

```txt
/api/theme/preview?pageSlug=home&tenant=acme&previewSecret=your-secret
```

Result:

- redirects to `/?tenant=acme`

## Cache Revalidation

When `useStandaloneCollection: true`, default cache tag is:

- `global_{standaloneCollectionSlug}`

Plugin can inject endpoint:

- `POST /api/theme/revalidate`

```ts
themeManagementPlugin({
  useStandaloneCollection: true,
  cacheRevalidation: {
    enabled: true,
    injectRoute: true,
    routePath: '/theme/revalidate',
    secret: process.env.THEME_REVALIDATE_SECRET,
    tags: ['tenant:default'],
    paths: ['/'],
  },
})
```

## Next.js server caching helper

```tsx
import {
  createCachedThemeFetcher,
  ServerThemeInjector,
} from '@kilivi/payloadcms-theme-management/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

const getCachedTheme = createCachedThemeFetcher({
  globalSlug: 'appearance-settings',
  revalidate: 3600,
  loadAppearanceSettings: async () => {
    const payload = await getPayload({ config: configPromise })
    return payload.findGlobal({ slug: 'appearance-settings' })
  },
})

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const themeConfiguration = await getCachedTheme()

  return (
    <html lang="en">
      <head>
        <ServerThemeInjector themeConfiguration={themeConfiguration} />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

### Data fetch examples (`fetchThemeConfiguration`)

Single-tenant:

```ts
import { fetchThemeConfiguration } from '@kilivi/payloadcms-theme-management'

const themeConfiguration = await fetchThemeConfiguration({
  useGlobal: true,
  collectionSlug: 'appearance-settings',
})
```

Multi-tenant:

```ts
import { fetchThemeConfiguration } from '@kilivi/payloadcms-theme-management'

const tenantThemeConfiguration = await fetchThemeConfiguration({
  useGlobal: true,
  collectionSlug: 'appearance-settings',
  tenantSlug: 'acme',
})
```

## Plugin options

| Option                      | Type                                                 | Default                      | Description                                        |
| --------------------------- | ---------------------------------------------------- | ---------------------------- | -------------------------------------------------- |
| `enabled`                   | `boolean`                                            | `true`                       | Enables/disables plugin                            |
| `targetCollection`          | `string`                                             | `'site-settings'`            | Collection slug for tab mode                       |
| `useStandaloneCollection`   | `boolean`                                            | `false`                      | Creates standalone global instead of tab injection |
| `standaloneCollectionSlug`  | `string`                                             | `'appearance-settings'`      | Global slug for standalone mode                    |
| `standaloneCollectionLabel` | `string \| Record<string, string>`                   | translated label             | Label for standalone global                        |
| `themePresets`              | `ThemePreset[]`                                      | built-in presets             | Custom preset list                                 |
| `defaultTheme`              | `string`                                             | `'cool'`                     | Default preset name                                |
| `includeColorModeToggle`    | `boolean`                                            | `true`                       | Exposes light/dark/auto toggle                     |
| `includeCustomCSS`          | `boolean`                                            | `true`                       | Enables custom CSS field                           |
| `includeBrandIdentity`      | `boolean`                                            | `false`                      | Reserved for brand identity support                |
| `enableAdvancedFeatures`    | `boolean`                                            | `true`                       | Enables advanced theme controls                    |
| `enableLogging`             | `boolean`                                            | `false`                      | Logs plugin actions                                |
| `livePreview`               | `boolean \| ThemeManagementLivePreviewOptions`       | `true`                       | Live preview URL behavior                          |
| `cacheRevalidation`         | `boolean \| ThemeManagementCacheRevalidationOptions` | auto (standalone default on) | Cache invalidation endpoint/tags/paths             |

### `livePreview` options

| Option                | Type                                    | Default                |
| --------------------- | --------------------------------------- | ---------------------- |
| `enabled`             | `boolean`                               | `true`                 |
| `injectRoute`         | `boolean`                               | `false`                |
| `routePath`           | `string`                                | `'/theme/preview'`     |
| `pageCollection`      | `string`                                | `'pages'`              |
| `pageSlug`            | `string`                                | `'home'`               |
| `fallbackToFirstPage` | `boolean`                               | `true`                 |
| `tenantField`         | `string`                                | `'tenant'`             |
| `tenantQueryParam`    | `string`                                | `'tenant'`             |
| `breakpoints`         | `Array<{ name; label; width; height }>` | `undefined`            |
| `url`                 | `(args) => string \| Promise<string>`   | default slug-based URL |

### `cacheRevalidation` options

| Option        | Type       | Default                                 |
| ------------- | ---------- | --------------------------------------- |
| `enabled`     | `boolean`  | `true` in standalone mode, else `false` |
| `injectRoute` | `boolean`  | `true`                                  |
| `routePath`   | `string`   | `'/theme/revalidate'`                   |
| `secret`      | `string`   | `undefined`                             |
| `tags`        | `string[]` | `[global_{slug}]`                       |
| `paths`       | `string[]` | `[]`                                    |

## Public API

### Main package

```ts
import {
  fetchThemeConfiguration,
  generateThemeColorsCss,
  generateThemeCSS,
  getAvailableThemePresets,
  getThemePreset,
  getThemeStyles,
  resolveThemeConfiguration,
  themeManagementPlugin,
  ThemeProvider,
} from '@kilivi/payloadcms-theme-management'
```

### Server package

```ts
import {
  createCachedThemeFetcher,
  getThemeCacheTag,
  getThemeCriticalCSS,
  getThemeCSS,
  revalidateThemeCache,
  ServerThemeInjector,
} from '@kilivi/payloadcms-theme-management/server'
```

## Notes

- For server components, always import server-only helpers from `@kilivi/payloadcms-theme-management/server`.
- If your team uses strict preview security, set `PREVIEW_SECRET` and enable `livePreview.injectRoute`.
- For multi-tenant apps, use `tenantField` + `tenantQueryParam` to keep preview URLs tenant-aware.

## License

MIT
