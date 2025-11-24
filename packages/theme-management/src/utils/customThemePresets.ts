import type { ThemePreset } from '../presets.js'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function normalizeBorderRadius(value: unknown): ThemePreset['borderRadius'] {
  if (
    value === 'none' ||
    value === 'small' ||
    value === 'medium' ||
    value === 'large' ||
    value === 'xl'
  ) {
    return value
  }
  return 'medium'
}

export function sanitizeThemePreset(candidate: unknown, fallbackName?: string): ThemePreset | null {
  if (!isRecord(candidate)) {
    return null
  }

  const nameCandidate = typeof candidate.name === 'string' ? candidate.name.trim() : fallbackName
  if (!nameCandidate || nameCandidate.length === 0) {
    return null
  }

  const labelCandidate =
    typeof candidate.label === 'string' && candidate.label.trim().length > 0
      ? candidate.label.trim()
      : nameCandidate

  const lightMode = isRecord(candidate.lightMode)
    ? (candidate.lightMode as Record<string, string>)
    : {}
  const darkMode = isRecord(candidate.darkMode)
    ? (candidate.darkMode as Record<string, string>)
    : {}

  return {
    ...candidate,
    name: nameCandidate,
    label: labelCandidate,
    borderRadius: normalizeBorderRadius(candidate.borderRadius),
    lightMode,
    darkMode,
  } as ThemePreset
}

export function parseThemePresetInput(value: unknown): ThemePreset[] {
  if (!value) return []

  const presets: ThemePreset[] = []

  const pushPreset = (candidate: unknown, fallbackName?: string) => {
    const preset = sanitizeThemePreset(candidate, fallbackName)
    if (preset) {
      presets.push(preset)
    }
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      return parseThemePresetInput(parsed)
    } catch {
      return []
    }
  }

  if (Array.isArray(value)) {
    value.forEach((candidate, index) => pushPreset(candidate, `custom-${index + 1}`))
    return presets
  }

  if (isRecord(value)) {
    Object.entries(value).forEach(([key, candidate]) => {
      if (isRecord(candidate)) {
        pushPreset({ ...candidate, name: candidate.name ?? key }, key)
      } else {
        pushPreset(candidate, key)
      }
    })
    return presets
  }

  return []
}

export function mergeThemePresets(base: ThemePreset[], extras: ThemePreset[]): ThemePreset[] {
  if (!extras.length) return base
  const map = new Map<string, ThemePreset>()
  base.forEach((preset) => {
    if (preset?.name) {
      map.set(preset.name, preset)
    }
  })
  extras.forEach((preset) => {
    if (preset?.name) {
      map.set(preset.name, preset)
    }
  })
  return Array.from(map.values())
}
