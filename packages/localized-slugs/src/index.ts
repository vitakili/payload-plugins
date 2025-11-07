import type { Config, Plugin } from 'payload'
import { createLocalizedSlugField } from './fields/localizedSlugField.js'
import { createPopulateLocalizedSlugsHook } from './hooks/populateLocalizedSlugs.js'

export interface LocalizedSlugsCollectionConfig {
  /** Collection slug */
  collection: string
  /** Generate slugs from title field instead of copying from slug/fullPath */
  generateFromTitle?: boolean
  /** Field to generate slug from (used when generateFromTitle is true, default: 'title') */
  titleField?: string
  /** Field name that contains the slug (default: 'slug') */
  slugField?: string
  /** Field name that contains the full path (default: 'fullPath' or 'path') */
  fullPathField?: string
}

export interface LocalizedSlugsPluginOptions {
  /** Whether the plugin is enabled (default: true) */
  enabled?: boolean
  /** Array of supported locales */
  locales: string[]
  /** Default locale (kept for config consistency, not used in logic) */
  defaultLocale?: string
  /** Collections to apply localized slugs to */
  collections: (string | LocalizedSlugsCollectionConfig)[]
  /** Whether to enable console logging (default: false) */
  enableLogging?: boolean
}

export const localizedSlugsPlugin = (options: LocalizedSlugsPluginOptions): Plugin => {
  return (config: Config): Config => {
    const { enabled = true, locales, collections, enableLogging = false } = options

    if (!enabled) {
      return config
    }

    if (enableLogging) {
      // eslint-disable-next-line no-console
      console.log('🌐 Localized Slugs Plugin: Initializing with options:', {
        locales,
        collections: collections.map((c) => (typeof c === 'string' ? c : c.collection)),
      })
    }

    if (!locales?.length) {
      throw new Error(
        '🌐 Localized Slugs Plugin: No locales provided. Please specify at least one locale.',
      )
    }

    // Enhance collections with localized slug fields and hooks
    const enhancedCollections = config.collections?.map((collection) => {
      const collectionConfig = collections.find((c) => {
        const slug = typeof c === 'string' ? c : c.collection
        return slug === collection.slug
      })

      if (!collectionConfig) {
        return collection
      }

      if (enableLogging) {
        // eslint-disable-next-line no-console
        console.log(`🌐 Enhancing collection "${collection.slug}" with localized slugs`)
      }

      // Normalize collection config
      const normalizedConfig: LocalizedSlugsCollectionConfig =
        typeof collectionConfig === 'string'
          ? {
              collection: collectionConfig,
              generateFromTitle: false,
              slugField: 'slug',
              fullPathField: 'fullPath',
            }
          : {
              collection: collectionConfig.collection,
              generateFromTitle: collectionConfig.generateFromTitle || false,
              titleField: collectionConfig.titleField || 'title',
              slugField: collectionConfig.slugField || 'slug',
              fullPathField: collectionConfig.fullPathField || 'fullPath',
            }

      const localizedSlugField = createLocalizedSlugField(locales)

      const populateLocalizedSlugsHook = createPopulateLocalizedSlugsHook({
        locales,
        slugField: normalizedConfig.slugField || 'slug',
        fullPathField: normalizedConfig.fullPathField || 'fullPath',
        enableLogging,
        generateFromTitle: normalizedConfig.generateFromTitle,
        titleField: normalizedConfig.titleField || 'title',
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
