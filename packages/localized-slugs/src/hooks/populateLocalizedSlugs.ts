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
 * Checks if the localizedSlugs field is already correctly populated
 */
function isLocalizedSlugsAlreadyPopulated(
  currentLocalizedSlugs: Record<string, { slug?: string; fullPath?: string }>,
  newLocalizedSlugs: Record<string, { slug?: string; fullPath?: string }>,
): boolean {
  return JSON.stringify(newLocalizedSlugs) === JSON.stringify(currentLocalizedSlugs)
}

/**
 * Updates the document with localizedSlugs if needed
 */
async function updateLocalizedSlugsIfNeeded(
  doc: Record<string, unknown>,
  collection: { slug: string },
  req: { payload?: { update: (args: any) => Promise<any> }; locale?: string | null },
  newLocalizedSlugs: Record<string, { slug?: string; fullPath?: string }>,
  enableLogging: boolean,
): Promise<void> {
  const currentLocalizedSlugs =
    (doc.localizedSlugs as Record<string, { slug?: string; fullPath?: string }>) || {}

  if (isLocalizedSlugsAlreadyPopulated(currentLocalizedSlugs, newLocalizedSlugs)) {
    if (enableLogging) {
      // eslint-disable-next-line no-console
      console.log(`🌐 localizedSlugs already populated for document ${doc.id}, skipping update`)
    }
    return
  }

  if (!req?.payload) {
    return
  }

  try {
    await req.payload.update({
      collection: collection.slug,
      id: doc.id as string,
      data: { localizedSlugs: newLocalizedSlugs },
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

      // Update the document with localizedSlugs if needed (prevents infinite loops)
      await updateLocalizedSlugsIfNeeded(
        docData,
        collection,
        req,
        updatedDoc.localizedSlugs,
        enableLogging,
      )

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
