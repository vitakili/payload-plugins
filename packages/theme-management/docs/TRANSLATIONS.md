# Translations / i18n

The plugin ships with built-in **English (`en`)** and **Czech (`cs`)** translations and
integrates with Payload's native i18n system.

## How it works

There are two layers, both driven by the same built-in `en` / `cs` strings:

1. **Field schema labels** are defined as Payload localized label objects
   (`{ en: '…', cs: '…' }`) directly on the fields, so the admin schema is localized
   out of the box.
2. **Dynamic admin UI strings** (theme preview, font picker, style presets, …) are
   registered into Payload's native `config.i18n.translations` under the
   `theme-management` namespace, and the client field components read the active admin
   language through Payload's i18n context (`useTranslation`) — no `navigator` sniffing.

When the plugin runs, it merges its translations into `config.i18n.translations`,
following the official Payload plugin i18n pattern. Translations already present on your
config win over the plugin defaults, so you can override any string.

## Extending via plugin configuration

Add new languages or override individual strings through the `i18n` plugin option.
Each entry is deep-merged over the built-in translations, so you only provide the keys
you want to change. Missing keys fall back to English.

```ts
import { themeManagementPlugin } from '@kilivi-dev/payloadcms-theme-management'
// Bring real language packs only if you want the admin to offer a brand-new UI language
import { de } from '@payloadcms/translations/languages/de'

themeManagementPlugin({
  i18n: {
    translations: {
      // New language
      de: {
        tabLabel: 'Darstellung',
        ui: { lightMode: 'Heller Modus', darkMode: 'Dunkler Modus' },
      },
      // Override a built-in string
      en: { tabLabel: 'Theme' },
    },
    // Optional: register a brand-new admin language with Payload
    supportedLanguages: { de },
  },
})
```

## Using the translations in custom components

Inside client (`'use client'`) admin components, read the plugin strings with the
provided hooks — they resolve the active Payload admin language automatically:

```tsx
'use client'
import {
  useThemeTranslations,
  useThemeLanguage,
} from '@kilivi-dev/payloadcms-theme-management/hooks/useThemeTranslations'

function MyField() {
  const t = useThemeTranslations() // full translation object for the active language
  const lang = useThemeLanguage() // e.g. 'cs'
  return <span>{t.ui.lightMode}</span>
}
```

## Programmatic API

Server-side / build-time helpers exported from the package root:

- `getTranslations(lang?: string): PluginTranslations` — translations for a language (English fallback).
- `registerTranslations(newTranslations)` — register or extend translations at runtime (deep-merged).
- `availableLanguages(): string[]` — list registered languages.
- `getThemeManagementI18nTranslations()` — translations in Payload's `config.i18n.translations` shape.
- `mergeThemeManagementI18n(existing, options?)` — merge plugin translations into an existing `config.i18n`.
- `THEME_MANAGEMENT_I18N_NAMESPACE` — the `'theme-management'` namespace constant.
