import type { CollectionConfig, Config, Field, Plugin, TabsField } from 'payload'
import { createThemeConfigurationField } from './fields/themeConfigurationField.js'
import type { ThemeTab } from './fields/themeConfigurationField.js'
import type { SiteThemeConfiguration } from './payload-types.js'
import type { ThemePreset } from './presets.js'
import { allThemePresets } from './presets.js'
import type { FetchThemeConfigurationOptions, ThemeManagementPluginOptions } from './types.js'

const THEME_FIELD_NAME = 'themeConfiguration'

/**
 * Removes existing theme configuration from a group field (legacy)
 */
const removeExistingThemeField = (fields: Field[] = []): Field[] =>
  fields.filter((field) => {
    const candidate = field as { name?: unknown }
    return candidate?.name !== THEME_FIELD_NAME
  })

/**
 * Finds the tabs field in the collection fields array
 */
const findTabsField = (fields: Field[] = []): TabsField | null => {
  for (const field of fields) {
    if (field.type === 'tabs') {
      return field as TabsField
    }
  }
  return null
}

/**
 * Removes existing Appearance Settings tab if it exists
 */
const removeExistingThemeTab = (
  tabs: NonNullable<TabsField['tabs']>,
): NonNullable<TabsField['tabs']> => {
  return tabs.filter((tab) => {
    const labelEn =
      typeof tab.label === 'object' && tab.label !== null
        ? (tab.label as { en?: string }).en
        : tab.label
    return labelEn !== '🎨 Appearance Settings' && labelEn !== 'Appearance Settings'
  })
}

/**
 * Injects theme tab into existing tabs field
 */
const injectThemeTab = (
  fields: Field[] | undefined,
  themeTab: ThemeTab,
  enableLogging: boolean,
): Field[] => {
  // First, remove any legacy theme field (group-based)
  const sanitizedFields = removeExistingThemeField(fields ?? [])

  // Find the tabs field
  const tabsField = findTabsField(sanitizedFields)

  if (!tabsField || !tabsField.tabs) {
    if (enableLogging) {
      console.warn(
        '🎨 Theme Management Plugin: No tabs field found. Creating a new tabs structure.',
      )
    }

    // If no tabs exist, create a basic tabs structure with just the theme tab
    const newTabsField: TabsField = {
      type: 'tabs',
      tabs: [themeTab],
    }

    return [...sanitizedFields, newTabsField]
  }

  // Remove existing theme tab if present
  const sanitizedTabs = removeExistingThemeTab(tabsField.tabs)

  // Add theme tab to the end
  const updatedTabs = [...sanitizedTabs, themeTab]

  if (enableLogging) {
    console.log('🎨 Theme Management Plugin: injecting Appearance Settings tab')
  }

  // Update the tabs field
  const updatedTabsField: TabsField = {
    ...tabsField,
    tabs: updatedTabs,
  }

  // Replace the old tabs field with the updated one
  return sanitizedFields.map((field) => (field.type === 'tabs' ? updatedTabsField : field))
}

const ensureCollectionsArray = (collections: Config['collections']): CollectionConfig[] =>
  Array.isArray(collections) ? collections : []

export const themeManagementPlugin = (options: ThemeManagementPluginOptions = {}): Plugin => {
  return (config: Config): Config => {
    const {
      enabled = true,
      targetCollection = 'site-settings',
      themePresets = allThemePresets,
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

    const themeTab = createThemeConfigurationField({
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
        console.log(`🎨 Theme Management Plugin: enhancing collection "${collection.slug}"`)
      }

      const existingFields = Array.isArray(collection.fields) ? collection.fields : []

      const fields = injectThemeTab(existingFields, themeTab, enableLogging)

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
  const normalizedOptions = typeof options === 'string' ? { tenantSlug: options } : (options ?? {})

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
  return allThemePresets.find((preset) => preset.name === themeName) || null
}

export const getAvailableThemePresets = (): ThemePreset[] => {
  return allThemePresets
}

export { defaultThemePresets, allThemePresets } from './presets.js'
export type { ThemePreset, ThemeTypographyPreset } from './presets.js'
export type { ThemeTab } from './fields/themeConfigurationField.js'
export {
  extendedThemePresets,
  allExtendedThemePresets,
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

// Dynamic theme CSS generation
export {
  generateThemeCSS as generatePresetCSS,
  generateAllThemesCSS,
} from './utils/generateThemeCSS.js'
export { getThemeDynamicCSS, getAllDynamicThemesCSS } from './utils/themeCSS.js'

export type { Mode, ThemeDefaults } from './providers/Theme/types.js'
export { ThemeProvider } from './providers/Theme/index.js'

// Font loading utilities for Next.js integration
export {
  getFontLoaderCode,
  getThemeFontFamilies,
  ThemeFontProvider,
  useThemeFonts,
  FONT_IMPORT_MAP,
} from './providers/font-loader.js'

// Note: Do NOT re-export client components from the root entry to avoid
// server-side evaluation during `payload generate:importmap`.
// If needed, import directly from subpath: `@kilivi/payloadcms-theme-management/fields/ThemeLivePreview`

export const ThemeManagementPlugin = themeManagementPlugin
/** @deprecated use {@link themeManagementPlugin} */
export const themeConfigurationPlugin = themeManagementPlugin

export default themeManagementPlugin
