import type { CollectionAfterChangeHook } from 'payload'

export interface PopulateLocalizedSlugsOptions {
  locales: string[]
  slugField: string
  fullPathField: string
  enableLogging: boolean
  generateFromTitle?: boolean
  titleField?: string
}

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
 * Helper: Extract slug and fullPath from a document
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
 * Creates a hook that populates localized slugs by fetching each locale's version and UPDATING with req.payload.update()
 *
 * CRITICAL PATTERN (from your working hook):
 * 1. Check context flag to prevent recursion
 * 2. Fetch document in EACH locale using req.payload.findByID()
 * 3. Extract slug/fullPath from each locale
 * 4. Build localizedSlugs object
 * 5. Call req.payload.update() with context: { skipLocalizedSlugHook: true } to persist
 * 6. Update all OTHER locales too
 */
export const createPopulateLocalizedSlugsHook = (
  options: PopulateLocalizedSlugsOptions,
): CollectionAfterChangeHook => {
  return async ({ doc, operation, req, context, collection }) => {
    const { locales, slugField, fullPathField, enableLogging, generateFromTitle, titleField } =
      options

    try {
      // ✅ CRITICAL: Skip if recursive call
      if (context?.skipLocalizedSlugHook) {
        if (enableLogging) {
          // eslint-disable-next-line no-console
          console.log(`🌐 [${collection.slug}] Skipping recursive call`)
        }
        return doc
      }

      // Only process create/update
      if (operation !== 'create' && operation !== 'update') {
        return doc
      }

      // Skip unpublished
      if ('_status' in doc && doc._status !== 'published') {
        if (enableLogging) {
          // eslint-disable-next-line no-console
          console.log(`🌐 [${collection.slug}] Skipping unpublished document`)
        }
        return doc
      }

      const docId = doc.id
      const localizedSlugs: Record<string, { slug?: string; fullPath?: string }> = {}

      // ✅ CRITICAL: Fetch EACH locale and build localizedSlugs
      for (const locale of locales) {
        try {
          let localizedDoc: Record<string, unknown>

          if (req?.payload?.findByID) {
            // Fetch this locale's version
            const fetched = await req.payload.findByID({
              collection: collection.slug,
              id: docId,
              locale,
            })

            // Use fetched if available, otherwise fall back to doc
            localizedDoc = (fetched || doc) as Record<string, unknown>
          } else {
            // Fallback for tests
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

          // Always set the data (even if empty strings)
          if (data.slug || data.fullPath) {
            localizedSlugs[locale] = data
          }

          if (enableLogging) {
            // eslint-disable-next-line no-console
            console.log(
              `🌐 [${collection.slug}] Locale ${locale}: slug="${data.slug}", fullPath="${data.fullPath}"`,
            )
          }
        } catch (error) {
          if (enableLogging) {
            // eslint-disable-next-line no-console
            console.warn(`🌐 [${collection.slug}] Error fetching locale ${locale}:`, error)
          }
          localizedSlugs[locale] = { slug: '', fullPath: '' }
        }
      }

      // ✅ CRITICAL: Build updated document with localizedSlugs
      const updatedDoc = {
        ...doc,
        localizedSlugs,
      }

      // Try to use req.payload.update() if available (production)
      if (req?.payload?.update && docId) {
        try {
          const currentLocale = req?.locale || locales[0]

          await req.payload.update({
            collection: collection.slug,
            id: docId,
            locale: currentLocale,
            overrideAccess: true,
            data: { localizedSlugs } as {
              localizedSlugs: Record<string, { slug?: string; fullPath?: string }>
            },
            context: {
              skipLocalizedSlugHook: true,
            },
          })

          // Update other locales too
          for (const locale of locales) {
            if (locale !== currentLocale) {
              try {
                await req.payload.update({
                  collection: collection.slug,
                  id: docId,
                  locale,
                  overrideAccess: true,
                  data: { localizedSlugs } as {
                    localizedSlugs: Record<string, { slug?: string; fullPath?: string }>
                  },
                  context: {
                    skipLocalizedSlugHook: true,
                  },
                })
              } catch (error) {
                if (enableLogging) {
                  // eslint-disable-next-line no-console
                  console.warn(`🌐 [${collection.slug}] Error updating locale ${locale}:`, error)
                }
              }
            }
          }
        } catch (error) {
          if (enableLogging) {
            // eslint-disable-next-line no-console
            console.warn(`🌐 [${collection.slug}] Error calling update:`, error)
          }
          // Continue - return doc with localizedSlugs anyway
        }
      }

      if (enableLogging) {
        // eslint-disable-next-line no-console
        console.log(
          `🌐 [${collection.slug}] ✅ Updated localizedSlugs:`,
          JSON.stringify(localizedSlugs, null, 2),
        )
      }

      // ✅ Return updated document with localizedSlugs
      return updatedDoc
    } catch (error) {
      if (enableLogging) {
        // eslint-disable-next-line no-console
        console.error(`🌐 [${collection.slug}] Error:`, error)
      }
      return doc
    }
  }
}
