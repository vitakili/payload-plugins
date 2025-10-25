import type { CollectionAfterChangeHook } from 'payload'
import { generateSlugFromTitle } from '../utils/slugUtils.js'

export interface PopulateLocalizedSlugsOptions {
  locales: string[]
  defaultLocale: string
  slugField: string
  fullPathField: string
  generateFromTitle: boolean
  titleField: string
  enableLogging: boolean
  customDiacriticsMap: Record<string, string>
}

/**
 * Creates a hook that populates localized slugs and full paths for a collection
 */
export const createPopulateLocalizedSlugsHook = (
  options: PopulateLocalizedSlugsOptions,
): CollectionAfterChangeHook => {
  return async ({ doc, operation, req, collection }) => {
    const {
      locales,
      slugField,
      fullPathField,
      generateFromTitle,
      titleField,
      enableLogging,
      customDiacriticsMap,
    } = options

    try {
      // Only process creates and updates
      if (operation !== 'create' && operation !== 'update') {
        return doc
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const docData = doc as any
      const updatedDoc = { ...docData }
      let slugsModified = false

      // Generate slugs for each locale
      if (generateFromTitle && docData[titleField]) {
        updatedDoc[slugField] = updatedDoc[slugField] || {}

        for (const locale of locales) {
          const titleValue =
            docData[titleField]?.[locale] || docData[titleField]?.en || docData[titleField]

          if (titleValue && typeof titleValue === 'string') {
            updatedDoc[slugField][locale] = generateSlugFromTitle(titleValue, customDiacriticsMap)
            slugsModified = true
          }
        }
      }

      // Generate full paths for each locale
      if (updatedDoc[slugField]) {
        updatedDoc[fullPathField] = updatedDoc[fullPathField] || {}

        for (const locale of locales) {
          const slug = updatedDoc[slugField][locale]

          if (slug) {
            let fullPath = slug

            // Check if document has a parent for hierarchical path
            if (docData.parent && typeof docData.parent === 'object') {
              const parentId =
                typeof docData.parent === 'string' ? docData.parent : docData.parent.id

              if (parentId && req?.payload) {
                try {
                  // Fetch parent document to get its full path
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const parentDoc = await (req.payload as any).findByID({
                    collection: collection.slug,
                    id: parentId,
                    locale,
                  })

                  if (parentDoc && parentDoc[fullPathField]?.[locale]) {
                    const parentPath = parentDoc[fullPathField][locale]
                    fullPath = `${parentPath}/${slug}`.replace(/\/+/g, '/')
                  }
                } catch (error) {
                  if (enableLogging) {
                    // eslint-disable-next-line no-console
                    console.log(`🌐 Could not fetch parent document for locale ${locale}`)
                  }
                  fullPath = `/${slug}`
                }
              }
            } else {
              fullPath = `/${slug}`
            }

            updatedDoc[fullPathField][locale] = fullPath
            slugsModified = true
          }
        }
      }

      if (enableLogging && slugsModified) {
        // eslint-disable-next-line no-console
        console.log(`🌐 Generated localized slugs for ${collection.slug}:`, updatedDoc[slugField])
        // eslint-disable-next-line no-console
        console.log(`🌐 Generated full paths for ${collection.slug}:`, updatedDoc[fullPathField])
      }

      return updatedDoc
    } catch (error) {
      if (enableLogging) {
        // eslint-disable-next-line no-console
        console.error('🌐 Error in populateLocalizedSlugsHook:', error)
      }
      return doc
    }
  }
}
