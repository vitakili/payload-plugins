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
      defaultLocale,
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

      // Normalize slug/fullPath fields: support both per-locale objects and single string values
      // If collection stores slug as a single string (e.g. slug: 'kontaktujte-nas'), expand it to all locales
      const ensureLocaleMap = (fieldName: string) => {
        let src = docData[fieldName]

        // If primary field is absent, check common alternate/top-level fields
        if (!src) {
          if (fieldName === slugField) {
            // page-level slug often stored as 'slug'
            src = docData['slug']
          }

          if (fieldName === fullPathField) {
            // try common names for path-like fields
            src = docData['fullPath'] ?? docData['path'] ?? docData['urlPath']
          }
        }

        if (!src) {
          updatedDoc[fieldName] = updatedDoc[fieldName] || {}
          return
        }

        // If it's already an object (localized field), ensure we copy it
        if (typeof src === 'object' && !Array.isArray(src)) {
          updatedDoc[fieldName] = { ...(src as Record<string, unknown>) }
          return
        }

        // If it's a primitive (string), expand to all locales
        if (typeof src === 'string') {
          // If configured to generate from title and a title exists, try to generate
          // locale-specific values instead of blindly copying the single string.
          if (generateFromTitle && docData[titleField]) {
            const map: Record<string, string> = {}
            const titleIsObject =
              typeof docData[titleField] === 'object' && !Array.isArray(docData[titleField])

            for (const locale of locales) {
              let generatedForLocale: string | undefined

              if (titleIsObject) {
                const titleValue =
                  docData[titleField]?.[locale] ?? docData[titleField]?.[defaultLocale]
                if (titleValue && typeof titleValue === 'string') {
                  const gen = generateSlugFromTitle(String(titleValue), customDiacriticsMap)
                  generatedForLocale = fieldName === fullPathField ? `/${gen}` : gen
                }
              } else {
                // title is a single string; only use it for the defaultLocale, keep src for others
                if (locale === defaultLocale) {
                  const gen = generateSlugFromTitle(
                    String(docData[titleField]),
                    customDiacriticsMap,
                  )
                  generatedForLocale = fieldName === fullPathField ? `/${gen}` : gen
                }
              }

              map[locale] = generatedForLocale ?? src
            }

            updatedDoc[fieldName] = map
            return
          }

          const map: Record<string, string> = {}
          for (const locale of locales) {
            map[locale] = src
          }
          updatedDoc[fieldName] = map
          return
        }

        // Fallback: set empty object
        updatedDoc[fieldName] = updatedDoc[fieldName] || {}
      }

      // Normalize both slug and fullPath fields so later logic can assume an object per-locale
      ensureLocaleMap(slugField)
      ensureLocaleMap(fullPathField)

      // Generate slugs for each locale from title if requested
      if (generateFromTitle && docData[titleField]) {
        const titleIsObject =
          typeof docData[titleField] === 'object' && !Array.isArray(docData[titleField])
        for (const locale of locales) {
          // If title is localized object, pick per-locale; if title is a single string, only apply to defaultLocale
          let titleValue: string | undefined
          if (titleIsObject) {
            titleValue = docData[titleField]?.[locale] ?? docData[titleField]?.[defaultLocale]
          } else if (locale === defaultLocale) {
            titleValue = docData[titleField]
          }

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

      // Also populate the group's `localizedSlugs` field (if present in the collection)
      try {
        updatedDoc.localizedSlugs = updatedDoc.localizedSlugs || {}

        for (const locale of locales) {
          const slugVal = updatedDoc[slugField]?.[locale]
          const fullPathVal = updatedDoc[fullPathField]?.[locale]

          if (slugVal || fullPathVal) {
            // Derive slug from fullPath when slug is missing (e.g., '/contact-us' -> 'contact-us')
            const derivedSlug =
              slugVal ??
              (typeof fullPathVal === 'string' ? fullPathVal.replace(/^\/+/, '') : undefined)

            // Ensure the per-field maps also get the derived slug when missing
            if (derivedSlug && !updatedDoc[slugField]?.[locale]) {
              updatedDoc[slugField] = updatedDoc[slugField] || {}
              updatedDoc[slugField][locale] = derivedSlug
              slugsModified = true
            }

            updatedDoc.localizedSlugs[locale] = {
              slug: derivedSlug ?? updatedDoc.localizedSlugs[locale]?.slug,
              fullPath: fullPathVal ?? updatedDoc.localizedSlugs[locale]?.fullPath,
            }
          }
        }
      } catch (e) {
        // non-fatal: if collection doesn't have localizedSlugs field, skip
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
