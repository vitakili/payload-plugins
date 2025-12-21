import type { CollectionConfig, Config, Field, GlobalConfig, Plugin, TabsField } from 'payload'
import { createThemeConfigurationField } from './fields/themeConfigurationField.js'
import type { ThemeTab } from './fields/themeConfigurationField.js'
import type { SiteThemeConfiguration } from './payload-types.js'
import type { ThemePreset } from './presets.js'
import { allThemePresets } from './presets.js'
import { getTranslations, translations } from './translations.js'
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
  const knownLabels = Object.values(translations).map((t) => t.tabLabel)
  return tabs.filter((tab) => {
    // Normalize label to string (support localized object or plain string)
    let labelValues: string[] = []
    if (typeof tab.label === 'object' && tab.label !== null) {
      labelValues = Object.values(tab.label as Record<string, string>)
    } else if (typeof tab.label === 'string') {
      labelValues = [tab.label]
    }

    // If any of the label values match a known plugin tab label, remove it
    const matchesKnown = labelValues.some((v) => knownLabels.includes(v))

    return !matchesKnown
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
      useStandaloneCollection = false,
      standaloneCollectionSlug = 'appearance-settings',
      // Allow either string or localized object; default comes from plugin translations
      standaloneCollectionLabel = getTranslations().standaloneCollectionLabel,
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

    // If using standalone collection, create a new global
    if (useStandaloneCollection) {
      if (enableLogging) {
        console.log(
          `🎨 Theme Management Plugin: creating standalone global "${standaloneCollectionSlug}"`,
        )
      }

      // Extract the fields from the tab directly (no wrapping in group)
      const tabFields = (themeTab.fields ?? []) as Field[]

      /**
       * Hook to auto-populate lightMode and darkMode colors when theme changes
       */
      type BeforeChangeArgs = {
        data?: {
          themeConfiguration?: {
            theme?: string
            lightMode?: Record<string, unknown>
            darkMode?: Record<string, unknown>
          }
        }
      }

      const beforeChangeHook = async (args: BeforeChangeArgs) => {
        const { data } = args

        // If theme is being changed, auto-populate color modes
        if (data?.themeConfiguration?.theme) {
          const themeName = data.themeConfiguration.theme
          const selectedPreset = themePresets.find((p) => p.name === themeName)

          if (selectedPreset) {
            // Initialize light and dark mode colors from preset if not already set
            if (!data.themeConfiguration.lightMode) {
              data.themeConfiguration.lightMode = {}
            }
            if (!data.themeConfiguration.darkMode) {
              data.themeConfiguration.darkMode = {}
            }

            // Only populate if not manually edited (first time or empty)
            const isLightModeEmpty = !data.themeConfiguration.lightMode?.background
            const isDarkModeEmpty = !data.themeConfiguration.darkMode?.background

            if (isLightModeEmpty && selectedPreset.lightMode) {
              data.themeConfiguration.lightMode = { ...selectedPreset.lightMode }
            }

            if (isDarkModeEmpty && selectedPreset.darkMode) {
              data.themeConfiguration.darkMode = { ...selectedPreset.darkMode }
            }
          }
        }

        return data
      }

      const standaloneGlobal: GlobalConfig = {
        slug: standaloneCollectionSlug,
        label: standaloneCollectionLabel,
        admin: {
          group: 'Settings',
        },
        // Provide a broad access object but cast to GlobalConfig['access'] to satisfy types
        access: ((): GlobalConfig['access'] => {
          const accessObj = {
            read: () => true,
            create: ({ req }: { req?: { user?: unknown } }) => !!req?.user,
            update: ({ req }: { req?: { user?: unknown } }) => !!req?.user,
            delete: ({ req }: { req?: { user?: unknown } }) => !!req?.user,
          } as unknown as GlobalConfig['access']
          return accessObj
        })(),
        fields: tabFields,
        hooks: {
          beforeChange: [beforeChangeHook],
        },
      }

      const globals = Array.isArray(config.globals) ? config.globals : []

      // Check if global already exists
      const existingIndex = globals.findIndex((g) => g.slug === standaloneCollectionSlug)

      if (existingIndex !== -1) {
        if (enableLogging) {
          console.warn(
            `🎨 Theme Management Plugin: global "${standaloneCollectionSlug}" already exists, skipping creation.`,
          )
        }
        return config
      }

      return {
        ...config,
        globals: [...globals, standaloneGlobal],
      }
    }

    // Otherwise, add as tab to existing collection
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
    collectionSlug = 'site-settings', // Can be overridden to 'appearance-settings' if using standalone
    depth,
    locale,
    draft,
    queryParams = {},
    useGlobal = false, // Set to true if using standalone global instead of collection
  } = normalizedOptions

  try {
    if (useGlobal) {
      // Fetch from global endpoint
      const params = new URLSearchParams()

      if (typeof depth === 'number') params.set('depth', String(depth))
      if (tenantSlug) params.set('tenant', tenantSlug)
      if (locale) params.set('locale', locale)
      if (draft) params.set('draft', 'true')

      Object.entries(queryParams).forEach(([key, value]) => {
        if (value === undefined) return
        params.set(key, String(value))
      })

      const queryString = params.toString()
      const url = `/api/globals/${collectionSlug}${queryString ? `?${queryString}` : ''}`

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to fetch theme global (status ${response.status})`)
      }

      const data = (await response.json()) as {
        themeConfiguration?: SiteThemeConfiguration
      }

      return data?.themeConfiguration ?? null
    } else {
      // Fetch from collection endpoint (legacy/default behavior)
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

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to fetch theme configuration (status ${response.status})`)
      }

      const data = (await response.json()) as {
        docs?: Array<{ themeConfiguration?: SiteThemeConfiguration }>
      }

      const doc = data.docs?.[0]

      return doc?.themeConfiguration ?? null
    }
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

// Export plugin translations for consumers to merge into their payload translations
export {
  translations,
  getTranslations,
  registerTranslations,
  availableLanguages,
} from './translations.js'

export default themeManagementPlugin
