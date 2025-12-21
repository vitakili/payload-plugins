export function getAdminLanguage(): string {
  // Prefer explicit lang attribute on document root (admin UI typically sets it)
  if (typeof document !== 'undefined') {
    const htmlLang = document.documentElement?.lang
    if (htmlLang && htmlLang.length >= 2) return htmlLang.split('-')[0]
  }

  // Fallback to navigator.language if available
  if (typeof navigator !== 'undefined') {
    if (
      'language' in navigator &&
      typeof navigator.language === 'string' &&
      navigator.language.length >= 2
    ) {
      return navigator.language.split('-')[0]
    }

    const maybeUserLang = navigator as unknown as { userLanguage?: string }
    if (typeof maybeUserLang.userLanguage === 'string' && maybeUserLang.userLanguage.length >= 2) {
      return maybeUserLang.userLanguage.split('-')[0]
    }
  }

  // Default to English
  return 'en'
}
