import type { CollectionConfig, Config, Field, Plugin } from 'payload'
import { createThemeConfigurationField } from './fields/themeConfigurationField.js'
import type { SiteThemeConfiguration } from './payload-types.js'
import type { ThemePreset } from './presets.js'
import { defaultThemePresets } from './presets.js'
import type {
  FetchThemeConfigurationOptions,
  ThemeManagementPluginOptions,
} from './types.js'

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
  console.log('🎨 Theme Management Plugin: injecting theme configuration field')
  }

  return [...sanitized, themeField]
}

const ensureCollectionsArray = (collections: Config['collections']): CollectionConfig[] =>
  Array.isArray(collections) ? collections : []

export const themeManagementPlugin = (options: ThemeManagementPluginOptions = {}): Plugin => {
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
  console.log('🎨 Theme Management Plugin: disabled via options, skipping.')
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
          `🎨 Theme Management Plugin: enhancing collection "${collection.slug}"`,
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
          `🎨 Theme Management Plugin: collection "${targetCollection}" was not found, leaving config untouched.`,
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



export { defaultThemePresets } from './presets.js'
export type { ThemePreset, ThemeTypographyPreset } from './presets.js'
export type { ThemeManagementPluginOptions, FetchThemeConfigurationOptions } from './types.js'
export {
  DEFAULT_THEME_CONFIGURATION,
  resolveThemeConfiguration,
} from './utils/resolveThemeConfiguration.js'
export type { ResolvedThemeConfiguration } from './utils/resolveThemeConfiguration.js'
export { generateThemeColorsCss, hexToHsl } from './utils/themeColors.js'
export { generateThemeCSS, getThemeStyles } from './utils/themeUtils.js'
export { getThemeHtmlAttributes } from './utils/themeHtmlAttributes.js'

export type { Mode, ThemeDefaults } from './providers/Theme/types.js'
export { ThemeProvider } from './providers/Theme/index.js'

export const ThemeManagementPlugin = themeManagementPlugin
/** @deprecated use {@link themeManagementPlugin} */
export const themeConfigurationPlugin = themeManagementPlugin

export default themeManagementPlugin