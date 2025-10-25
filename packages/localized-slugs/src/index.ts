import type { Config, Plugin } from 'payload'
import { createLocalizedSlugField } from './fields/localizedSlugField.js'
import { createPopulateLocalizedSlugsHook } from './hooks/populateLocalizedSlugs.js'

export interface LocalizedSlugsPluginOptions {
  /** Whether the plugin is enabled */
  enabled?: boolean
  /** Array of supported locales */
  locales?: ('cs' | 'en')[]
  /** Default locale */
  defaultLocale?: 'cs' | 'en'
  /** Collections to apply localized slugs to */
  collections?: {
    /** Collection slug */
    collection: string
    /** Field name that contains the slug (default: 'slug') */
    slugField?: string
    /** Field name that contains the full path (default: 'fullPath') */
    fullPathField?: string
    /** Whether to auto-generate slugs from title */
    generateFromTitle?: boolean
    /** Title field name for auto-generation (default: 'title') */
    titleField?: string
  }[]
  /** Whether to enable console logging */
  enableLogging?: boolean
  /** Custom diacritics mapping for slug generation */
  customDiacriticsMap?: Record<string, string>
}

export const localizedSlugsPlugin = (options: LocalizedSlugsPluginOptions = {}): Plugin => {
  return (config: Config): Config => {
    const {
      enabled = true,
      locales = [], // Allow any locale
      defaultLocale = 'en', // Default to 'en' if not provided
      collections = [],
      enableLogging = false,
      customDiacriticsMap = {},
    } = options

    if (!enabled) {
      return config
    }

    if (enableLogging) {
      console.log('🌐 Localized Slugs Plugin: Initializing with options:', {
        locales,
        defaultLocale,
        collections: collections.map((c) => c.collection),
      })
    }

    if (!locales.length) {
      throw new Error(
        '🌐 Localized Slugs Plugin: No locales provided. Please specify at least one locale.',
      )
    }

    // Enhance collections with localized slug fields and hooks
    const enhancedCollections = config.collections?.map((collection) => {
      const collectionConfig = collections.find((c) => c.collection === collection.slug)

      if (!collectionConfig) {
        return collection
      }

      const localizedSlugField = createLocalizedSlugField(locales)

      const populateLocalizedSlugsHook = createPopulateLocalizedSlugsHook({
        locales,
        defaultLocale,
        slugField: collectionConfig.slugField || 'slug',
        fullPathField: collectionConfig.fullPathField || 'fullPath',
        generateFromTitle: collectionConfig.generateFromTitle || false,
        titleField: collectionConfig.titleField || 'title',
        enableLogging,
        customDiacriticsMap,
      })

      return {
        ...collection,
        fields: [...(collection.fields || []), localizedSlugField],
        hooks: {
          ...collection.hooks,
          afterChange: [...(collection.hooks?.afterChange || []), populateLocalizedSlugsHook],
        },
      }
    })

    return {
      ...config,
      collections: enhancedCollections,
    }
  }
}

export default localizedSlugsPlugin

export * from './utils/index.js'
export * from './providers/index.jsx'
export { createLocalizedSlugField } from './fields/localizedSlugField.js'
