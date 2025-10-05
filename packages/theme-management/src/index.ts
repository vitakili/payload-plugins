import type { CollectionConfig, Config, Field, Plugin } from 'payload'
import { createThemeConfigurationField } from './fields/themeConfigurationField'
import type { SiteThemeConfiguration } from './payload-types'
import type { ThemePreset } from './presets'
import { defaultThemePresets } from './presets'
import type {
  FetchThemeConfigurationOptions,
  ThemeConfigurationPluginOptions,
} from './types'

const THEME_FIELD_NAME = 'themeConfiguration'

const removeExistingThemeField = (fields: Field[] = []): Field[] =>
  fields.filter((field) => {
    const candidate = field as { name?: unknown }
    return candidate?.name !== THEME_FIELD_NAME
  })

const upsertThemeField = (
  fields: Field[] | undefined,
  themeField: Field,
  enableLogging: boolean,
): Field[] => {
  const sanitized = removeExistingThemeField(fields ?? [])

  if (enableLogging) {
    console.log('🎨 Theme Configuration Plugin: injecting theme configuration field')
  }

  return [...sanitized, themeField]
}

const ensureCollectionsArray = (collections: Config['collections']): CollectionConfig[] =>
  Array.isArray(collections) ? collections : []

export const themeConfigurationPlugin = (options: ThemeConfigurationPluginOptions = {}): Plugin => {
  return (config: Config): Config => {
    const {
      enabled = true,
      targetCollection = 'site-settings',
      themePresets = defaultThemePresets,
      defaultTheme = 'cool',
      includeColorModeToggle = true,
      includeCustomCSS = true,
      includeBrandIdentity = false,
      enableAdvancedFeatures = true,
      enableLogging = false,
    } = options

    if (!enabled) {
      if (enableLogging) {
        console.log('🎨 Theme Configuration Plugin: disabled via options, skipping.')
      }
      return config
    }

    const themeField = createThemeConfigurationField({
      themePresets,
      defaultTheme,
      includeColorModeToggle,
      includeCustomCSS,
      includeBrandIdentity: includeBrandIdentity ?? false,
      enableAdvancedFeatures,
    })

    let collectionTouched = false

    const collections = ensureCollectionsArray(config.collections).map((collection) => {
      if (collection.slug !== targetCollection) {
        return collection
      }

      collectionTouched = true

      if (enableLogging) {
        console.log(
          `🎨 Theme Configuration Plugin: enhancing collection "${collection.slug}"`,
        )
      }

      const existingFields = Array.isArray(collection.fields) ? collection.fields : []

      const fields = upsertThemeField(existingFields, themeField, enableLogging)

      return {
        ...collection,
        fields,
      }
    })

    if (!collectionTouched) {
      if (enableLogging) {
        console.warn(
          `🎨 Theme Configuration Plugin: collection "${targetCollection}" was not found, leaving config untouched.`,
        )
      }
      return config
    }

    return {
      ...config,
      collections,
    }
  }
}

type FetchOptionsInput = string | FetchThemeConfigurationOptions

export const fetchThemeConfiguration = async (
  options?: FetchOptionsInput,
): Promise<SiteThemeConfiguration | null> => {
  const normalizedOptions =
    typeof options === 'string'
      ? { tenantSlug: options }
      : options ?? {}

  const {
    tenantSlug,
    collectionSlug = 'site-settings',
    depth,
    locale,
    draft,
    queryParams = {},
  } = normalizedOptions

  const params = new URLSearchParams({ limit: '1' })

  if (typeof depth === 'number') params.set('depth', String(depth))
  if (tenantSlug) params.set('tenant', tenantSlug)
  if (locale) params.set('locale', locale)
  if (draft) params.set('draft', 'true')

  Object.entries(queryParams).forEach(([key, value]) => {
    if (value === undefined) return
    params.set(key, String(value))
  })

  const url = `/api/${collectionSlug}?${params.toString()}`

  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch theme configuration (status ${response.status})`)
    }

    const data = (await response.json()) as {
      docs?: Array<{ themeConfiguration?: SiteThemeConfiguration }>
    }

    const doc = data.docs?.[0]

    return doc?.themeConfiguration ?? null
  } catch (error) {
    console.warn('Failed to fetch theme configuration:', error)
    return null
  }
}

export const getThemePreset = (themeName: string): ThemePreset | null => {
  return defaultThemePresets.find((preset) => preset.name === themeName) || null
}

export const getAvailableThemePresets = (): ThemePreset[] => {
  return defaultThemePresets
}

export const ThemeConfigurationPlugin = themeConfigurationPlugin
export const themeManagementPlugin = themeConfigurationPlugin

export default themeConfigurationPlugin

export { defaultThemePresets } from './presets'
export type { ThemePreset, ThemeTypographyPreset } from './presets'
export type { ThemeConfigurationPluginOptions, FetchThemeConfigurationOptions } from './types'
export {
  DEFAULT_THEME_CONFIGURATION,
  resolveThemeConfiguration,
} from './utils/resolveThemeConfiguration'
export { generateThemeColorsCss, hexToHsl } from './utils/themeColors'
export { generateThemeCSS, getThemeStyles } from './utils/themeUtils'
export { ServerThemeInjector } from './components/ServerThemeInjector'
