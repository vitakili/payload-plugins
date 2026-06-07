---
name: theme-live-preview
description: Wire up and debug live theme preview for @kilivi-dev/payloadcms-theme-management — the native Payload Live Preview iframe (with mobile/tablet/desktop breakpoints), the in-admin device + light/dark preview panels, and the ThemeLivePreviewSync client component that applies theme CSS live without a full save.
---

# Theme live preview

Use this skill when configuring or debugging the theme preview experience.

There are three layers — know which one a problem belongs to:

## 1. In-admin preview panels (no front-end needed)

Two `ui` fields render inside the Appearance Settings tab and react instantly to
form changes:
- **`AppearancePreviewField`** — effects, component styles, navbar/footer/buttons.
  Has a **device switcher** (mobile / tablet / desktop) and a **light/dark** toggle.
- **`ThemePreviewField`** — colour + typography panels (light & dark `ModePreview`).

Device sizes come from `constants/devicePreviews.ts` (`DEVICE_PREVIEWS`). This is the
single source of truth shared with the native breakpoints below — edit it there.
Icons use `lucide-react` (the project standard); avoid emoji in admin UI.

## 2. Native Payload Live Preview (iframe of the real site)

Enabled via the plugin's `livePreview` option (`true` or an options object). The
plugin defaults `admin.livePreview.breakpoints` to
`DEFAULT_LIVE_PREVIEW_BREAKPOINTS` (mobile 390×844, tablet 768×1024, desktop
1440×900) when you don't pass your own, so editors get device sizes for free.

Customise via `ThemeManagementLivePreviewOptions`: `breakpoints`, `url` (custom URL
resolver), `pageCollection`, `pageSlug`, `tenantField`, `tenantQueryParam`.

## 3. Live CSS sync inside the previewed page

On the front-end, render `ThemeLivePreviewSync` (client) inside your live-preview
listener so theme edits apply **without a full save/refresh**:

```tsx
'use client'
import { RefreshRouteOnSave } from '@payloadcms/live-preview-react'
import { ThemeLivePreviewSync } from '@kilivi-dev/payloadcms-theme-management/components/ThemeLivePreviewSync'

// inside a component that only renders when in the preview iframe:
<>
  <RefreshRouteOnSave refresh={router.refresh} serverURL={serverURL} />
  <ThemeLivePreviewSync initialData={initialData} serverURL={serverURL} />
</>
```

`ThemeLivePreviewSync` uses `useLivePreview`, extracts the theme config **safely**
(`extractThemeConfigurationFromLiveData` ignores unrelated payloads like page form
data so it never flashes back to default theme), builds CSS via
`buildLivePreviewThemeRuntime`, and updates a `<style>` element + `data-theme` /
`data-color-mode` attributes on `<html>`.

Props: `initialData`, `serverURL`, optional `apiRoute`, `depth`,
`themeConfigurationKey` (default `'themeConfiguration'`), `styleElementId`.

> Don't keep a project-local "Safe" copy of this component — the plugin's
> `ThemeLivePreviewSync` already does the safe extraction. Import it instead.

## Debugging
- **Theme resets to default while editing another doc** → you're using a naive
  extractor; use the plugin's `ThemeLivePreviewSync` / `extractThemeConfigurationFromLiveData`.
- **No live updates** → the sync component must only render inside the preview
  iframe (`window.self !== window.top`) and needs a valid `serverURL`.
- **Device switcher missing in admin** → check `AppearancePreviewField` is the
  registered `ui` component and the import map is current.

Related: [theme-management-setup], [theme-color-fields].
