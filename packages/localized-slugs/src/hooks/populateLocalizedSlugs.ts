import type { CollectionAfterChangeHook } from 'payload'

export interface PopulateLocalizedSlugsOptions {
  locales: string[]
  slugField: string
  fullPathField: string
  enableLogging: boolean
}

// Const pro označení, že jsme již prošli hook
const LOCALIZED_SLUGS_PROCESSING = '__localized_slugs_processing__'

/**
 * Detects whether a field is localized (object with locale keys) or not
 */
function isLocalizedField(fieldValue: unknown): boolean {
  return (
    typeof fieldValue === 'object' &&
    fieldValue !== null &&
    !Array.isArray(fieldValue) &&
    !(fieldValue instanceof Date)
  )
}

/**
 * Populates the localizedSlugs field from existing slug and fullPath fields
 */
function populateLocalizedSlugsField(
  docData: Record<string, unknown>,
  locales: string[],
  slugField: string,
  fullPathField: string,
  enableLogging: boolean,
): Record<string, { slug?: string; fullPath?: string }> {
  const localizedSlugs: Record<string, { slug?: string; fullPath?: string }> = {}
  const slugFieldValue = docData[slugField]
  const fullPathFieldValue = docData[fullPathField]

  if (enableLogging) {
    // eslint-disable-next-line no-console
    console.log(`🌐 Field check - ${slugField}:`, {
      type: typeof slugFieldValue,
      isLocalized: isLocalizedField(slugFieldValue),
      value: slugFieldValue,
    })
    // eslint-disable-next-line no-console
    console.log(`🌐 Field check - ${fullPathField}:`, {
      type: typeof fullPathFieldValue,
      isLocalized: isLocalizedField(fullPathFieldValue),
      value: fullPathFieldValue,
    })
  }

  // Check if fields are localized
  const slugIsLocalized = isLocalizedField(slugFieldValue)
  const fullPathIsLocalized = isLocalizedField(fullPathFieldValue)

  if (enableLogging) {
    // eslint-disable-next-line no-console
    console.log(`🌐 Localization status: slug=${slugIsLocalized}, fullPath=${fullPathIsLocalized}`)
  }

  for (const locale of locales) {
    let slugVal: string | undefined
    let fullPathVal: string | undefined

    // Extract values based on whether fields are localized
    if (slugIsLocalized) {
      slugVal = (slugFieldValue as Record<string, string>)?.[locale]
    } else {
      // If not localized, use the same value for all locales (only for first locale to avoid duplication)
      slugVal = locale === locales[0] ? (slugFieldValue as string) : undefined
    }

    if (fullPathIsLocalized) {
      fullPathVal = (fullPathFieldValue as Record<string, string>)?.[locale]
    } else {
      // If not localized, use the same value for all locales (only for first locale to avoid duplication)
      fullPathVal = locale === locales[0] ? (fullPathFieldValue as string) : undefined
    }

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
 * Creates a hook that populates localized slugs and full paths for a collection
 *
 * IMPORTANT: This hook ONLY modifies the in-memory document that gets saved.
 * It does NOT call req.payload.update() to prevent infinite loops in multitenant environments.
 * Payload CMS will automatically persist the returned document.
 */
export const createPopulateLocalizedSlugsHook = (
  options: PopulateLocalizedSlugsOptions,
): CollectionAfterChangeHook => {
  return async ({ doc, operation, req, collection }) => {
    const { locales, slugField, fullPathField, enableLogging } = options

    try {
      // Only process on create/update operations
      if (operation !== 'create' && operation !== 'update') {
        return doc
      }

      // Prevent infinite loops - if we're already processing, skip
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((req as any)?.[LOCALIZED_SLUGS_PROCESSING]) {
        if (enableLogging) {
          // eslint-disable-next-line no-console
          console.log(`🌐 Already processing for document ${doc.id}, skipping to prevent loops`)
        }
        return doc
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const docData = doc as any
      const updatedDoc = { ...docData }

      // Mark that we're processing this document
      if (req) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(req as any)[LOCALIZED_SLUGS_PROCESSING] = true
      }

      // Populate the localizedSlugs field from existing slug and fullPath fields
      updatedDoc.localizedSlugs = populateLocalizedSlugsField(
        docData,
        locales,
        slugField,
        fullPathField,
        enableLogging,
      )

      // Only proceed if we actually have localizedSlugs data to populate
      const hasLocalizedSlugsData = Object.keys(updatedDoc.localizedSlugs).length > 0

      if (!hasLocalizedSlugsData) {
        if (enableLogging) {
          // eslint-disable-next-line no-console
          console.log(
            `🌐 No localizedSlugs data for ${collection.slug} (${slugField}/${fullPathField} not populated yet)`,
          )
        }
        return doc
      }

      if (enableLogging) {
        // eslint-disable-next-line no-console
        console.log(
          `🌐 Populated localizedSlugs for ${collection.slug}:`,
          updatedDoc.localizedSlugs,
        )
      }

      // IMPORTANT: Return the modified document without calling req.payload.update()
      // Payload CMS will automatically persist this returned document in the afterChange hook
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
