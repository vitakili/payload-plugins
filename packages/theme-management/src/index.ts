import type { CollectionConfig, Config, Field, Plugin } from 'payload'
import { createThemeConfigurationField } from './fields/themeConfigurationField.js'
import type { SiteThemeConfiguration } from './payload-types.js'
import type { ThemePreset } from './presets.js'
import { defaultThemePresets } from './presets.js'
import type {
  FetchThemeConfigurationOptions,
  ThemeManagementPluginOptions,
} from './types.js'

const THEME_TAB_NAME = 'themeConfiguration'

interface TabConfig {
  name: string
  label: { en: string; cs: string }
  description?: { en: string; cs: string }
  fields: Field[]
}

/**
 * Remove existing theme tab from tabs field
 */
const removeExistingThemeTab = (tabs: TabConfig[]): TabConfig[] =>
  tabs.filter((tab) => tab?.name !== THEME_TAB_NAME)

/**
 * Add theme configuration tab to existing tabs field or create fields array
 */
const upsertThemeTab = (
  fields: Field[] | undefined,
  themeTabConfig: TabConfig,
  enableLogging: boolean,
): Field[] => {
  const existingFields = fields ?? []

  // Find existing tabs field
  const tabsFieldIndex = existingFields.findIndex(
    (field) => 'type' in field && field.type === 'tabs',
  )

  if (tabsFieldIndex === -1) {
    // No tabs field exists - add theme configuration as group field instead
    if (enableLogging) {
      console.log(
        '🎨 Theme Management Plugin: No tabs field found, adding theme configuration as group field',
      )
    }

    return [
      ...existingFields,
      {
        name: THEME_TAB_NAME,
        type: 'group',
        label: themeTabConfig.label,
        admin: {
          description: themeTabConfig.description,
        },
        fields: themeTabConfig.fields,
      },
    ]
  }

  // Tabs field exists - inject our tab into it
  if (enableLogging) {
    console.log(
      '🎨 Theme Management Plugin: Adding theme configuration tab to existing tabs',
    )
  }

  const tabsField = existingFields[tabsFieldIndex]
  
  if (!('tabs' in tabsField)) {
    console.warn('🎨 Theme Management Plugin: Found tabs field but it has no tabs property')
    return existingFields
  }

  const existingTabs = (tabsField.tabs as TabConfig[]) || []

  // Remove existing theme tab if present
  const sanitizedTabs = removeExistingThemeTab(existingTabs)

  // Create new tabs field with our tab added
  const updatedTabsField = {
    ...tabsField,
    tabs: [...sanitizedTabs, themeTabConfig],
  }

  // Return fields array with updated tabs field
  const newFields = [...existingFields]
  newFields[tabsFieldIndex] = updatedTabsField

  return newFields
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

    const themeTabConfig = createThemeConfigurationField({
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

      const fields = upsertThemeTab(existingFields, themeTabConfig, enableLogging)

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
export { 
  extendedThemePresets,
  extendedThemeToCSSVariables,
} from './extended-presets.js'
export type { ExtendedThemePreset, ShadcnColorTokens } from './extended-presets.js'
export {
  applyExtendedTheme,
  generateExtendedThemeCSS,
  resetExtendedTheme,
  getExtendedThemeTokens,
  createUseExtendedTheme,
  getTailwindVarReferences,
} from './utils/extendedThemeHelpers.js'
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