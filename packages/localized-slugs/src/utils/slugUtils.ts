/**
 * Generates a URL-friendly slug from a title with automatic diacritics removal
 */
export function generateSlugFromTitle(
  title: string,
  customDiacriticsMap: Record<string, string> = {},
): string {
  // Normalize the string to decompose diacritics (NFD form)
  const normalizedTitle = title.normalize('NFD')

  // Remove diacritics using regex and apply custom mappings if provided
  const diacriticsRemoved = normalizedTitle.replace(/[\u0300-\u036f]/g, '')

  // Apply custom mappings (if any)
  const mappedTitle = diacriticsRemoved
    .split('')
    .map((char) => customDiacriticsMap[char] || char)
    .join('')

  // Generate the slug
  return mappedTitle
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters except word chars, spaces, and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with a single hyphen
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
}
/**
 * Validates if a string is a valid slug format
 */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
}

/**
 * Field hook that ensures slugs are unique within a collection
 * Supports both single-tenant and multi-tenant applications
 *
 * @example
 * // Single-tenant usage
 * fields: [
 *   {
 *     name: 'slug',
 *     type: 'text',
 *     hooks: {
 *       beforeValidate: [ensureUniqueSlug('posts')],
 *     },
 *   },
 * ]
 *
 * @example
 * // Multi-tenant usage (automatically detects tenant field)
 * fields: [
 *   {
 *     name: 'slug',
 *     type: 'text',
 *     hooks: {
 *       beforeValidate: [ensureUniqueSlug('posts', { multiTenant: true })],
 *     },
 *   },
 * ]
 */
export const ensureUniqueSlug = (
  collection: string,
  options: {
    multiTenant?: boolean
    tenantField?: string
    enableLogging?: boolean
  } = {},
) => {
  const { multiTenant = false, tenantField = 'tenant', enableLogging = false } = options

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return async ({ data, originalDoc, req, value }: any) => {
    // If no slug value, return as-is
    if (!value) {
      return value
    }

    // If slug hasn't changed, no need to check uniqueness
    if (originalDoc?.slug === value) {
      return value
    }

    const currentId = originalDoc?.id

    try {
      // Build the where clause for checking duplicates
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const whereConditions: any[] = [{ slug: { equals: value } }]

      // Exclude the current document from the check
      if (currentId) {
        whereConditions.push({ id: { not_equals: currentId } })
      }

      // For multi-tenant apps, filter by tenant
      if (multiTenant) {
        const incomingTenantID =
          typeof data?.[tenantField] === 'object' ? data[tenantField].id : data?.[tenantField]
        const currentTenantID =
          typeof originalDoc?.[tenantField] === 'object'
            ? originalDoc[tenantField].id
            : originalDoc?.[tenantField]
        const tenantIDToMatch = incomingTenantID || currentTenantID

        if (tenantIDToMatch) {
          whereConditions.push({ [tenantField]: { equals: tenantIDToMatch } })
        }
      }

      // Check if slug already exists
      const hasDuplicate = async (slugValue: string): Promise<boolean> => {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const res = await (req.payload as any).find({
            collection,
            where:
              whereConditions.length > 1
                ? { and: [...whereConditions.slice(0, -1), { slug: { equals: slugValue } }] }
                : { slug: { equals: slugValue } },
            limit: 1,
          })
          return res.docs.length > 0
        } catch (error) {
          if (enableLogging) {
            // eslint-disable-next-line no-console
            console.error(`Error checking slug uniqueness in ${collection}:`, error)
          }
          return false
        }
      }

      // If slug is unique, return it
      if (!(await hasDuplicate(value))) {
        if (enableLogging) {
          // eslint-disable-next-line no-console
          console.log(`✓ Slug "${value}" is unique in ${collection}`)
        }
        return value
      }

      // If slug exists, try to generate unique alternatives
      const localeSuffix = req?.locale ? `-${String(req.locale)}` : ''
      const baseSlug = String(value)
      const candidates: string[] = []

      // First try with locale suffix
      if (localeSuffix) {
        candidates.push(`${baseSlug}${localeSuffix}`)
      }

      // Then try with numeric suffixes
      for (let i = 2; i <= 20; i++) {
        if (localeSuffix) {
          candidates.push(`${baseSlug}${localeSuffix}-${i}`)
        } else {
          candidates.push(`${baseSlug}-${i}`)
        }
      }

      // Find the first available slug
      for (const candidate of candidates) {
        if (!(await hasDuplicate(candidate))) {
          if (enableLogging) {
            // eslint-disable-next-line no-console
            console.log(`✓ Auto-generated unique slug: "${candidate}" for ${collection}`)
          }
          return candidate
        }
      }

      // If we get here, throw a validation error
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ValidationError = (req.payload as any).ValidationError || Error

      if (multiTenant && req.user) {
        throw new ValidationError({
          errors: [
            {
              message: `A ${collection} with the slug "${value}" already exists in your tenant. Slugs must be unique per tenant. Please choose a different slug.`,
              path: 'slug',
            },
          ],
        })
      }

      throw new ValidationError({
        errors: [
          {
            message: `A ${collection} with the slug "${value}" already exists. Slugs must be unique. Please choose a different slug.`,
            path: 'slug',
          },
        ],
      })
    } catch (error) {
      if (enableLogging) {
        // eslint-disable-next-line no-console
        console.error(`Error in ensureUniqueSlug for ${collection}:`, error)
      }
      throw error
    }
  }
}
