import type { CollectionAfterChangeHook } from 'payload'

export interface PopulateLocalizedSlugsOptions {
  locales: string[]
  slugField: string
  fullPathField: string
  enableLogging: boolean
  generateFromTitle?: boolean
  titleField?: string
}

// Flag to prevent infinite recursion
const SKIP_LOCALIZED_SLUG_HOOK = 'skipLocalizedSlugHook'

/**
 * Simple slug generation from title
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
 * Helper: Extract slug and fullPath from a document (handles both fetch and direct pass)
 */
function extractSlugData(
  localizedDoc: Record<string, unknown>,
  slugField: string,
  fullPathField: string,
  generateFromTitle: boolean,
  titleField: string | undefined,
  locale: string,
): { slug?: string; fullPath?: string } {
  let slug: string | undefined
  let fullPath: string | undefined

  if (generateFromTitle && titleField) {
    const titleValue = localizedDoc[titleField]
    // Handle both localized object and plain string
    if (titleValue && typeof titleValue === 'object' && !Array.isArray(titleValue)) {
      const titleObj = titleValue as Record<string, unknown>
      const val = titleObj[locale]
      if (val && typeof val === 'string') {
        slug = slugify(val)
        fullPath = `/${slug}`
      }
    } else if (titleValue && typeof titleValue === 'string') {
      slug = slugify(titleValue)
      fullPath = `/${slug}`
    }
  } else {
    const slugValue = localizedDoc[slugField]
    const fullPathValue = localizedDoc[fullPathField]

    // Handle both localized fields (objects) and plain fields (strings)
    if (slugValue && typeof slugValue === 'object' && !Array.isArray(slugValue)) {
      const slugObj = slugValue as Record<string, unknown>
      if (typeof slugObj[locale] === 'string') {
        slug = slugObj[locale] as string
      }
    } else if (typeof slugValue === 'string') {
      slug = slugValue
    }

    if (fullPathValue && typeof fullPathValue === 'object' && !Array.isArray(fullPathValue)) {
      const pathObj = fullPathValue as Record<string, unknown>
      if (typeof pathObj[locale] === 'string') {
        fullPath = pathObj[locale] as string
      }
    } else if (typeof fullPathValue === 'string') {
      fullPath = fullPathValue
    }
  }

  return { slug, fullPath }
}

/**
 * Creates a hook that populates localized slugs by fetching each locale's version of the document.
 *
 * THIS IS THE CRITICAL PATTERN:
 * 1. Check if we're in a recursive call (context flag)
 * 2. Fetch the document in EACH locale using req.payload.findByID()
 * 3. Extract slug/fullPath from each locale's version
 * 4. Build the localizedSlugs object
 * 5. Return updated doc (Payload persists it automatically)
 */
export const createPopulateLocalizedSlugsHook = (
  options: PopulateLocalizedSlugsOptions,
): CollectionAfterChangeHook => {
  return async ({ doc, operation, req, collection }) => {
    const { locales, slugField, fullPathField, enableLogging, generateFromTitle, titleField } =
      options

    try {
      // Skip if this is a recursive call to prevent infinite loops
      if (req?.context?.[SKIP_LOCALIZED_SLUG_HOOK]) {
        if (enableLogging) {
          // eslint-disable-next-line no-console
          console.log(`🌐 [${collection.slug}] Skipping (recursive call)`)
        }
        return doc
      }

      // Only process on create/update operations
      if (operation !== 'create' && operation !== 'update') {
        return doc
      }

      // Don't process if document is not published
      if ('_status' in doc && doc._status !== 'published') {
        if (enableLogging) {
          // eslint-disable-next-line no-console
          console.log(`🌐 [${collection.slug}] Skipping unpublished document`)
        }
        return doc
      }

      const docId = doc.id
      const localizedSlugs: Record<string, { slug?: string; fullPath?: string }> = {}

      // CRITICAL: Fetch the document in EACH locale (or use provided doc if req.payload not available)
      for (const locale of locales) {
        try {
          let localizedDoc: Record<string, unknown>

          // Check if req.payload.findByID is available (production) or fallback to doc (tests/fallback)
          if (req?.payload?.findByID) {
            // Production: Fetch from Payload
            const fetched = await req.payload.findByID({
              collection: collection.slug,
              id: docId,
              locale,
            })

            if (fetched) {
              localizedDoc = fetched as Record<string, unknown>
            } else {
              // Fallback to provided doc if fetch returns null
              localizedDoc = doc as Record<string, unknown>
            }
          } else {
            // Fallback: Use the provided document (for tests or when req.payload not available)
            localizedDoc = doc as Record<string, unknown>
          }

          const data = extractSlugData(
            localizedDoc,
            slugField,
            fullPathField,
            generateFromTitle || false,
            titleField,
            locale,
          )

          if (data.slug || data.fullPath) {
            localizedSlugs[locale] = data

            if (enableLogging) {
              // eslint-disable-next-line no-console
              console.log(
                `🌐 [${collection.slug}] Locale ${locale}: slug="${data.slug}", fullPath="${data.fullPath}"`,
              )
            }
          }
        } catch (error) {
          if (enableLogging) {
            // eslint-disable-next-line no-console
            console.warn(
              `🌐 [${collection.slug}] Failed to fetch locale ${locale}:`,
              error instanceof Error ? error.message : error,
            )
          }
        }
      }

      // If no slugs were populated, return original document
      if (Object.keys(localizedSlugs).length === 0) {
        if (enableLogging) {
          // eslint-disable-next-line no-console
          console.log(`🌐 [${collection.slug}] No slug data found in any locale`)
        }
        return doc
      }

      const updatedDoc = {
        ...doc,
        localizedSlugs,
      }

      if (enableLogging) {
        // eslint-disable-next-line no-console
        console.log(
          `🌐 [${collection.slug}] ✅ Populated localizedSlugs:`,
          JSON.stringify(localizedSlugs, null, 2),
        )
      }

      // Return updated document - Payload CMS will automatically persist it
      return updatedDoc
    } catch (error) {
      if (enableLogging) {
        // eslint-disable-next-line no-console
        console.error(`🌐 [${collection.slug}] Error in populateLocalizedSlugsHook:`, error)
      }
      return doc
    }
  }
}
