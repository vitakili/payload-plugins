import type { CollectionAfterChangeHook } from 'payload'

export interface PopulateLocalizedSlugsOptions {
  locales: string[]
  slugField: string
  fullPathField: string
  enableLogging: boolean
  generateFromTitle?: boolean
  titleField?: string
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
/**
 * Helper: Generate slug from title using simple slugification
 */
function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '')
    .replace(/-+/g, '-')
}

/**
 * Helper: Extract slug and fullPath for a single locale from existing fields
 */
function extractExistingValues(
  docData: Record<string, unknown>,
  locales: string[],
  slugField: string,
  fullPathField: string,
  _enableLogging: boolean,
): Record<string, { slug?: string; fullPath?: string }> {
  const localizedSlugs: Record<string, { slug?: string; fullPath?: string }> = {}
  const slugFieldValue = docData[slugField]
  const fullPathFieldValue = docData[fullPathField]

  const slugIsLocalized = isLocalizedField(slugFieldValue)
  const fullPathIsLocalized = isLocalizedField(fullPathFieldValue)

  for (const locale of locales) {
    let slugVal: string | undefined
    let fullPathVal: string | undefined

    if (slugIsLocalized) {
      slugVal = (slugFieldValue as Record<string, string>)?.[locale]
    } else {
      slugVal = locale === locales[0] ? (slugFieldValue as string) : undefined
    }

    if (fullPathIsLocalized) {
      fullPathVal = (fullPathFieldValue as Record<string, string>)?.[locale]
    } else {
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
 * Helper: Generate slug and fullPath from title field
 */
function generateFromTitleField(
  docData: Record<string, unknown>,
  locales: string[],
  titleField: string,
  _enableLogging: boolean,
): Record<string, { slug?: string; fullPath?: string }> {
  const localizedSlugs: Record<string, { slug?: string; fullPath?: string }> = {}
  const titleFieldValue = docData[titleField]

  if (!titleFieldValue) {
    return localizedSlugs
  }

  const titleIsLocalized = isLocalizedField(titleFieldValue)

  for (const locale of locales) {
    let titleVal: string | undefined

    if (titleIsLocalized) {
      titleVal = (titleFieldValue as Record<string, string>)?.[locale]
    } else {
      titleVal = locale === locales[0] ? (titleFieldValue as string) : undefined
    }

    if (titleVal) {
      const generatedSlug = slugify(titleVal)
      localizedSlugs[locale] = {
        slug: generatedSlug,
        fullPath: `/${generatedSlug}`,
      }
    }
  }

  return localizedSlugs
}

function populateLocalizedSlugsField(
  docData: Record<string, unknown>,
  locales: string[],
  slugField: string,
  fullPathField: string,
  enableLogging: boolean,
  generateFromTitle: boolean = false,
  titleField: string = 'title',
): Record<string, { slug?: string; fullPath?: string }> {
  if (generateFromTitle) {
    return generateFromTitleField(docData, locales, titleField, enableLogging)
  }

  return extractExistingValues(docData, locales, slugField, fullPathField, enableLogging)
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
    const { locales, slugField, fullPathField, enableLogging, generateFromTitle, titleField } =
      options

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

      // Populate the localizedSlugs field
      updatedDoc.localizedSlugs = populateLocalizedSlugsField(
        docData,
        locales,
        slugField,
        fullPathField,
        enableLogging,
        generateFromTitle,
        titleField,
      )

      // Only proceed if we actually have localizedSlugs data to populate
      const hasLocalizedSlugsData = Object.keys(updatedDoc.localizedSlugs).length > 0

      if (!hasLocalizedSlugsData) {
        if (enableLogging) {
          // eslint-disable-next-line no-console
          console.log(
            `🌐 No localizedSlugs data for ${collection.slug} (source fields not populated yet)`,
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
