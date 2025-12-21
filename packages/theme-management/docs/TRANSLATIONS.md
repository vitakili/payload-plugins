# Translations / i18n

This plugin ships with built-in English (`en`) and Czech (`cs`) translations.

## Extending translations

Use `registerTranslations` to add or override translations at runtime. Translations will be deep-merged into existing keys and any missing keys will fall back to English defaults.

Example:

```ts
import { registerTranslations } from '@kilivi/payloadcms-theme-management'

registerTranslations({
  fr: {
    tabLabel: 'Apparence',
    preview: {
      siteTitle: 'Votre site',
    },
  },
})
```

## Runtime language detection

The admin language is detected using `getAdminLanguage()` which checks:

1. `document.documentElement.lang`
2. `navigator.language` (or `navigator.userLanguage` fallback)
3. `en` (final fallback)

If you need to force a language for admin UI tests or in a specific environment, set `document.documentElement.lang` early in your admin script.

## API

- `getTranslations(lang?: string): PluginTranslations` - Get translations for the provided language (fall back to English)
- `registerTranslations(newTranslations: Record<string, Partial<PluginTranslations>>)` - Register or extend translations at runtime
- `availableLanguages(): string[]` - List available registered languages
