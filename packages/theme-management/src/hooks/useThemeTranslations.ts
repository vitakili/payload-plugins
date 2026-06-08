'use client'

import { useTranslation } from '@payloadcms/ui'
import { getTranslations, type PluginTranslations } from '../translations.js'

/**
 * Resolve the current Payload admin language using Payload's native i18n context
 * (instead of sniffing `navigator.language`). Falls back to English.
 */
export function useThemeLanguage(): string {
  // Tolerate `useTranslation()` returning undefined (e.g. outside an i18n provider
  // or in unit tests with reset mocks) by falling back to English.
  const result = useTranslation() as { i18n?: { language?: string } } | undefined
  const language = result?.i18n?.language
  return typeof language === 'string' && language.length >= 2 ? language : 'en'
}

/**
 * Return the plugin's translations for the active admin language, with English
 * used as the fallback for any missing key. Use this in client field components
 * so the strings follow the admin's selected locale natively.
 */
export function useThemeTranslations(): PluginTranslations {
  return getTranslations(useThemeLanguage())
}
