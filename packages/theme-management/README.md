# @kilivi/payloadcms-theme-management

Theme management for Payload CMS v3: 60+ presets, a live preview inside the admin, an accessibility audit, and theme CSS variables that are rendered server-side (SSR-ready) for your Next.js front-end. It is built so that a non-technical site owner can restyle a site from the Payload admin without breaking it.

**Repository:** [github.com/vitakili/payload-plugins → packages/theme-management](https://github.com/vitakili/payload-plugins/tree/main/packages/theme-management) · [Changelog](./CHANGELOG.md) · [Issues](https://github.com/vitakili/payload-plugins/issues)

> **Package name:** the plugin is published as **`@kilivi/payloadcms-theme-management`**. Versions 1.x–2.1.x were also published under `@kilivi-dev/payloadcms-theme-management`, which is no longer updated. See [Migrating from `@kilivi-dev`](#migrating-from-kilivi-dev).

## Features

- **Theme presets:** 60+ colour themes (including tweakcn and OKLCH styles) plus visual style presets that set effects, component styles, radius and typography.
- **"Keep my" locks:** lock *Colours*, *Fonts* or *Style* so that picking a theme, applying a style or generating a palette leaves those parts untouched.
- **One-step undo:** every bulk change (theme, style, generated palette) can be undone from an *Applied: … · Undo* bar.
- **One live preview:** colours, fonts and component styles in a single site mock-up with device widths and light/dark mode. On wide admin screens it stays in view in a column on the right while you edit.
- **Palette generator:** a full light and dark palette from one brand colour or an uploaded logo.
- **WCAG audit:** a live contrast check of the palette in both modes, with a one-click *Fix* for each failing pair. Paired colour fields (for example `primary` and `primaryForeground`) also show their contrast right in the field.
- **Export and import:** W3C design tokens (JSON), Tailwind v4 `@theme` and Tailwind v3 config. Custom presets can be imported as JSON and appear in the theme picker straight away.
- **Front-end rendering:** SSR theme injection (`ServerThemeInjector`), `<meta name="theme-color">`, cache revalidation and Payload Live Preview.
- **Visitor components:** `ColorModeToggle` (light/dark/auto) and `ThemeSwitcher`.
- **Native to Payload:** uses Payload's theme tokens, so it works in the dark admin, has keyboard-accessible pickers and respects `prefers-reduced-motion`. It ships with English and Czech admin translations, and you can add more.

## Installation

```bash
pnpm add @kilivi/payloadcms-theme-management
# or
npm i @kilivi/payloadcms-theme-management
# or
yarn add @kilivi/payloadcms-theme-management
```

**Peer dependencies:**

| Package | Versions |
| --- | --- |
| `payload`, `@payloadcms/ui` | `^3` |
| `next` | `14` / `15` / `16` |
| `react` | `18.3+` or `19` |
| `lucide-react` | `>=0.400` |

## Quick start

### 1) Register the plugin

#### A) As a tab in an existing collection (default)

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

#### B) As a standalone appearance global

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

After adding the plugin, regenerate the admin import map:

```bash
pnpm payload generate:importmap
```

### 2) Inject the theme in your Next.js layout

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

## The Appearance Settings tab

The tab is ordered as a **presets first, fine-tuning second** workflow:

1. **Theme selection:**
   - *Keep my: Colours · Fonts · Style* locks
   - the palette generator
   - the collapsible theme preset list
2. **Live preview:** one preview for colours, fonts and component styles. Once the settings group is at least 960 px wide (a container query, not the viewport width), it moves into a sticky right-hand column that stays visible while you edit anything below it.
3. **Style preset:** visual cards that set effects, component styles, radius and typography, but never colours.
4. **Border radius and spacing scale.**
5. **Fine-tuning sections:** these are collapsed by default.
   - Colour mode (all light and dark tokens, the WCAG audit and export)
   - Typography
   - Custom theme presets (JSON import)
   - Visual effects
   - Component styles
   - Advanced (animation level, custom CSS)

### Locks and undo

Each bulk action honours the locks:

| Action | Colours | Fonts | Style (effects, components, radius) |
| --- | --- | --- | --- |
| Pick a theme preset | writes colours | pins the current preset font instead of switching it | writes the theme's visual effects |
| Pick a style preset | never | writes the style's typography | writes effects, components, radius, motion and spacing |
| Generate a palette | writes colours (disabled while locked) | never | never |

- Locks last for the current editing session. They reset on reload and nothing extra is stored in your documents.
- After each bulk action an *Applied: … · Undo* bar appears for 10 seconds. It pauses while you hover it or it has focus.
- Undo restores exactly the fields that the action changed.

## Live Preview

Payload's Live Preview points at your client pages by slug:

- the `home` slug resolves to `/`
- any other slug resolves to `/{slug}`
- a tenant query is appended when one is available

```ts
themeManagementPlugin({
  livePreview: true,
})
```

### Advanced setup (with the injected endpoint)

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

With `livePreview.injectRoute` enabled, the plugin adds `GET /api/theme/preview` (or your custom `routePath`).

- **Query parameters:**
  - `pageSlug`
  - `previewSecret` (or `preview`)
  - `tenant`
- **Secret:** read from `PREVIEW_SECRET` or `PAYLOAD_PREVIEW_SECRET`.
- **Responses:**
  - `307` redirects to the resolved client page
  - `401` means a secret is configured but is missing or wrong

```txt
/api/theme/preview?pageSlug=home&previewSecret=your-secret              → /
/api/theme/preview?pageSlug=home&tenant=acme&previewSecret=your-secret  → /?tenant=acme
```

**Testing tip:** preview is most useful when the previewed page uses many theme tokens: buttons, cards, banners, links and several heading levels. The repository's `dev-local` app includes `pnpm seed:theme`, which fills the `home` page with blocks like these.

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

See [MULTI_TENANT_GUIDE.md](./MULTI_TENANT_GUIDE.md) for shared vs per-tenant setups.

## Cache revalidation

When `useStandaloneCollection: true`, the default cache tag is `global_{standaloneCollectionSlug}`. The plugin can inject `POST /api/theme/revalidate`:

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

### Next.js server caching helper

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

### Fetching the configuration

```ts
import { fetchThemeConfiguration } from '@kilivi/payloadcms-theme-management'

// Single tenant
const themeConfiguration = await fetchThemeConfiguration({
  useGlobal: true,
  collectionSlug: 'appearance-settings',
})

// Multi-tenant
const tenantThemeConfiguration = await fetchThemeConfiguration({
  useGlobal: true,
  collectionSlug: 'appearance-settings',
  tenantSlug: 'acme',
})
```

## Plugin options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `enabled` | `boolean` | `true` | Enables or disables the plugin |
| `targetCollection` | `string` | `'site-settings'` | Collection slug for tab mode |
| `useStandaloneCollection` | `boolean` | `false` | Creates a standalone global instead of injecting a tab |
| `standaloneCollectionSlug` | `string` | `'appearance-settings'` | Global slug in standalone mode |
| `standaloneCollectionLabel` | `string \| Record<string, string>` | translated label | Label of the standalone global |
| `themePresets` | `ThemePreset[]` | built-in presets | Custom preset list |
| `defaultTheme` | `string` | `'cool'` | Default preset name |
| `includeColorModeToggle` | `boolean` | `true` | Colour mode section (light/dark tokens, audit, export) |
| `includeCustomCSS` | `boolean` | `true` | Enables the custom CSS field |
| `enableAdvancedFeatures` | `boolean` | `true` | Advanced controls such as animation level |
| `customThemeConfigurationFields` | `Field[]` | `undefined` | Extra fields appended inside the `themeConfiguration` group |
| `customThemeConfigurationSections` | `Array<{ label; fields; initCollapsed?; description? }>` | `undefined` | Extra collapsible sections inside the group |
| `enableLogging` | `boolean` | `false` | Logs plugin actions |
| `livePreview` | `boolean \| ThemeManagementLivePreviewOptions` | `true` | Live preview URL behaviour |
| `cacheRevalidation` | `boolean \| ThemeManagementCacheRevalidationOptions` | on in standalone mode | Cache invalidation endpoint, tags and paths |
| `i18n` | `ThemeManagementI18nOptions` | `undefined` | Extend or override admin translations |
| `includeBrandIdentity` | `boolean` | `false` | Reserved for future use |

### `livePreview` options

| Option | Type | Default |
| --- | --- | --- |
| `enabled` | `boolean` | `true` |
| `injectRoute` | `boolean` | `false` |
| `routePath` | `string` | `'/theme/preview'` |
| `pageCollection` | `string` | `'pages'` |
| `pageSlug` | `string` | `'home'` |
| `fallbackToFirstPage` | `boolean` | `true` |
| `tenantField` | `string` | `'tenant'` |
| `tenantQueryParam` | `string` | `'tenant'` |
| `breakpoints` | `Array<{ name; label; width; height }>` | `undefined` |
| `url` | `(args) => string \| Promise<string>` | slug-based URL |

### `cacheRevalidation` options

| Option | Type | Default |
| --- | --- | --- |
| `enabled` | `boolean` | `true` in standalone mode, otherwise `false` |
| `injectRoute` | `boolean` | `true` |
| `routePath` | `string` | `'/theme/revalidate'` |
| `secret` | `string` | `undefined` |
| `tags` | `string[]` | `[global_{slug}]` |
| `paths` | `string[]` | `[]` |

## Internationalization

The plugin ships with **English (`en`)** and **Czech (`cs`)** admin translations. It registers them in Payload's native `config.i18n` under the `theme-management` namespace.

- Every admin string follows the active admin language, including field labels, the pickers, the audit, the import drawer and the font guides.
- Localised label objects (`{ en, cs, … }`) resolve to the admin language first, then to English.

To add languages or override strings, use the `i18n` option. It is deep-merged over the built-in strings, and missing keys fall back to English.

```ts
import { de } from '@payloadcms/translations/languages/de'

themeManagementPlugin({
  i18n: {
    translations: {
      de: { tabLabel: 'Darstellung', ui: { lightMode: 'Heller Modus' } },
      en: { tabLabel: 'Theme' }, // override a built-in string
    },
    supportedLanguages: { de }, // optional: register a new admin language
  },
})
```

Full guide: [docs/TRANSLATIONS.md](./docs/TRANSLATIONS.md)

## Appearance controls

| Section | Admin group | Fields |
| --- | --- | --- |
| Visual effects | `themeConfiguration.visualEffects` | effectStyle, shadowIntensity, backdropBlur, borderStyle, borderWidth, glassOpacity |
| Component styles | `themeConfiguration.componentStyles` | buttonVariant, buttonSize, cardStyle, cardHoverEffect, navbarStyle, footerStyle, imageStyle, linkStyle, enableScrollReveal, enableHoverAnimations |
| Typography | `themeConfiguration.typography` | bodyFont, headingFont, bodyFontCustom, headingFontCustom, baseFontSize, lineHeight |

`heroBackground` (hero style, patterns, dividers) is part of the `ThemeHeroBackground` type and the CSS generator, but the tab has no admin fields for it. Add them through `customThemeConfigurationSections` if you need them.

Full reference: [docs/APPEARANCE_CONTROLS.md](./docs/APPEARANCE_CONTROLS.md)

```tsx
import { fetchThemeConfiguration } from '@kilivi/payloadcms-theme-management'

const theme = await fetchThemeConfiguration({ collectionSlug: 'site-settings' })

const effect = theme?.visualEffects?.effectStyle ?? 'flat'
const button = theme?.componentStyles?.buttonVariant ?? 'filled'

return (
  <html data-effect={effect} data-button={button}>
    ...
  </html>
)
```

## Theme presets

Built-in presets are exported as `allThemePresets`, and style presets as `allStylePresets`:

```ts
import { allStylePresets, allThemePresets } from '@kilivi/payloadcms-theme-management'
```

Editors can also import extra presets as JSON (*Custom theme presets* section). They are merged into the theme picker, and they override built-in presets that have the same `name`.

Full preset reference: [docs/THEME_PRESETS_EXTENDED.md](./docs/THEME_PRESETS_EXTENDED.md)

## Visitor components

```tsx
import ColorModeToggle from '@kilivi/payloadcms-theme-management/components/ColorModeToggle'
import ThemeSwitcher from '@kilivi/payloadcms-theme-management/components/ThemeSwitcher'
```

## Public API

### Main package

```ts
import {
  allStylePresets,
  allThemePresets,
  fetchThemeConfiguration,
  generateThemeColorsCss,
  generateThemeCSS,
  getAvailableThemePresets,
  getThemeHtmlAttributes,
  getThemePreset,
  getThemeStyles,
  resolveThemeConfiguration,
  themeManagementPlugin,
  ThemeProvider,
} from '@kilivi/payloadcms-theme-management'

import type {
  SiteThemeConfiguration,
  ThemeComponentStyles,
  ThemeHeroBackground,
  ThemeVisualEffects,
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

Always import server-only helpers from `/server`.

## Migrating from `@kilivi-dev`

The API is unchanged. Only the package name differs.

1. Swap the dependency:

   ```bash
   pnpm remove @kilivi-dev/payloadcms-theme-management
   pnpm add @kilivi/payloadcms-theme-management
   ```

2. Replace the import prefix in your code: `@kilivi-dev/payloadcms-theme-management` → `@kilivi/payloadcms-theme-management`. This covers `/server`, `/components/*` and `/fields/*`.
3. Regenerate the admin import map so Payload resolves the admin components under the new name:

   ```bash
   pnpm payload generate:importmap
   ```

4. If you list the package in `next.config` under `transpilePackages`, rename it there too.

Stored data does not need a migration: field names and database columns stay the same.

## Notes

- For strict preview security, set `PREVIEW_SECRET` and enable `livePreview.injectRoute`.
- For multi-tenant apps, use `tenantField` and `tenantQueryParam` to keep preview URLs tenant-aware.
- Task-focused guides for AI coding assistants live in `.claude/skills/`.

## License

MIT
