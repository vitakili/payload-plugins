import type { Config, Plugin } from 'payload'
import { createLocalizedSlugField } from './fields/localizedSlugField.js'
import { createPopulateLocalizedSlugsHook } from './hooks/populateLocalizedSlugs.js'

export interface LocalizedSlugsPluginOptions {
  /** Whether the plugin is enabled */
  enabled?: boolean
  /** Array of supported locales */
  locales?: ('cs' | 'en')[]
  /** Collections to apply localized slugs to */
  collections?: {
    /** Collection slug */
    collection: string
    /** Field name that contains the slug (default: 'slug') */
    slugField?: string
    /** Field name that contains the full path (default: 'fullPath') */
    fullPathField?: string
  }[]
  /** Whether to enable console logging */
  enableLogging?: boolean
}

export const localizedSlugsPlugin = (options: LocalizedSlugsPluginOptions = {}): Plugin => {
  return (config: Config): Config => {
    const {
      enabled = true,
      locales = [], // Allow any locale
      collections = [],
      enableLogging = false,
    } = options

    if (!enabled) {
      return config
    }

    if (enableLogging) {
      // eslint-disable-next-line no-console
      console.log('🌐 Localized Slugs Plugin: Initializing with options:', {
        locales,
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

      if (enableLogging) {
        // eslint-disable-next-line no-console
        console.log(`🌐 Enhancing collection "${collection.slug}" with localized slugs`)
      }

      const localizedSlugField = createLocalizedSlugField(locales)

      const populateLocalizedSlugsHook = createPopulateLocalizedSlugsHook({
        locales,
        slugField: collectionConfig.slugField || 'slug',
        fullPathField: collectionConfig.fullPathField || 'fullPath',
        enableLogging,
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
export { createLocalizedSlugField } from './fields/localizedSlugField.js'
// Export providers with explicit .js extension so compiled output points to the correct runtime file
// Note: providers are client-only components and are exported via the package subpath
// (see package.json './providers' export). Do NOT re-export providers from the
// main server entry to avoid bundling client components into server builds.
