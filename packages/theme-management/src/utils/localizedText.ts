/**
 * Payload field labels, descriptions and placeholders arrive either as plain
 * strings or as `{ en, cs, … }` objects. Resolve them against the active admin
 * language (full tag, then base language), falling back to English and then to
 * the first available translation.
 */
export function resolveLocalizedText(
  value: unknown,
  language: string,
  fallback = '',
): string {
  if (typeof value === 'string') return value
  if (!value || typeof value !== 'object') return fallback

  const localized = value as Record<string, unknown>
  const base = language.split('-')[0]
  const candidates = [localized[language], localized[base], localized.en, ...Object.values(localized)]
  const resolved = candidates.find((candidate): candidate is string => typeof candidate === 'string')
  return resolved ?? fallback
}
