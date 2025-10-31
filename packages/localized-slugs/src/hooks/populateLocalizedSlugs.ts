import type { CollectionAfterChangeHook } from 'payload'

export interface PopulateLocalizedSlugsOptions {
  locales: string[]
  slugField: string
  fullPathField: string
  enableLogging: boolean
}

/**
 * Populates the localizedSlugs field from existing slug and fullPath fields
 */
function populateLocalizedSlugsField(
  docData: Record<string, unknown>,
  locales: string[],
  slugField: string,
  fullPathField: string,
): Record<string, { slug?: string; fullPath?: string }> {
  const localizedSlugs: Record<string, { slug?: string; fullPath?: string }> = {}

  for (const locale of locales) {
    const slugVal = (docData[slugField] as Record<string, string> | undefined)?.[locale]
    const fullPathVal = (docData[fullPathField] as Record<string, string> | undefined)?.[locale]

    if (slugVal || fullPathVal) {
      localizedSlugs[locale] = {
        slug: slugVal,
        fullPath: fullPathVal,
      }
    }
  }

  return localizedSlugs
}

/**
 * Creates a hook that populates localized slugs and full paths for a collection
 */
export const createPopulateLocalizedSlugsHook = (
  options: PopulateLocalizedSlugsOptions,
): CollectionAfterChangeHook => {
  return async ({ doc, operation, req, collection }) => {
    const { locales, slugField, fullPathField, enableLogging } = options

    try {
      if (operation !== 'create' && operation !== 'update') {
        return doc
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const docData = doc as any
      const updatedDoc = { ...docData }

      // Populate the localizedSlugs field from existing slug and fullPath fields
      updatedDoc.localizedSlugs = populateLocalizedSlugsField(
        docData,
        locales,
        slugField,
        fullPathField,
      )

      if (enableLogging) {
        // eslint-disable-next-line no-console
        console.log(
          `🌐 Populated localizedSlugs for ${collection.slug}:`,
          updatedDoc.localizedSlugs,
        )
      }

      // Save the updated document back to the database
      if (req?.payload) {
        try {
          await req.payload.update({
            collection: collection.slug,
            id: doc.id,
            data: { localizedSlugs: updatedDoc.localizedSlugs },
            locale: req.locale,
            depth: 0,
          })

          if (enableLogging) {
            // eslint-disable-next-line no-console
            console.log(`🌐 Successfully saved localizedSlugs for document ${doc.id}`)
          }
        } catch (error) {
          if (enableLogging) {
            // eslint-disable-next-line no-console
            console.error(`🌐 Failed to save localizedSlugs for document ${doc.id}:`, error)
          }
        }
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
