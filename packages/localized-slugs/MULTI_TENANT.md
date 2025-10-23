# Multi-Tenant Slug Management

The `@kilivi/payloadcms-localized-slugs` plugin includes built-in support for multi-tenant applications with the `ensureUniqueSlug` field hook.

## Overview

The `ensureUniqueSlug` function is a Payload field hook that ensures slugs are unique within your application. It automatically:

- ✅ Validates slug uniqueness
- ✅ Filters by tenant (if multi-tenant enabled)
- ✅ Generates alternatives if slug conflicts exist
- ✅ Supports locale-specific slug variants
- ✅ Throws user-friendly validation errors

## Usage

### Single-Tenant Application

```typescript
import { ensureUniqueSlug } from '@kilivi/payloadcms-localized-slugs/utils'

export const Posts: CollectionConfig = {
  slug: 'posts',
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      hooks: {
        beforeValidate: [ensureUniqueSlug('posts')],
      },
    },
  ],
}
```

### Multi-Tenant Application

```typescript
import { ensureUniqueSlug } from '@kilivi/payloadcms-localized-slugs/utils'

export const Posts: CollectionConfig = {
  slug: 'posts',
  fields: [
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'slug',
      type: 'text',
      localized: true,
      hooks: {
        beforeValidate: [
          ensureUniqueSlug('posts', {
            multiTenant: true,
            tenantField: 'tenant',
            enableLogging: true, // Optional: for debugging
          }),
        ],
      },
    },
  ],
}
```

## Options

```typescript
interface EnsureUniqueSlugOptions {
  /**
   * Enable multi-tenant mode
   * Slugs will be scoped to the tenant
   * @default false
   */
  multiTenant?: boolean

  /**
   * Field name that stores the tenant reference
   * Only used if multiTenant is true
   * @default 'tenant'
   */
  tenantField?: string

  /**
   * Enable logging for debugging
   * Logs slug generation and uniqueness checks
   * @default false
   */
  enableLogging?: boolean
}
```

## Behavior

### Slug Validation Process

1. **Check if slug exists**: Query the collection for existing documents with the same slug
2. **Scope to tenant**: If multi-tenant, only check slugs in the same tenant
3. **Exclude current document**: Don't flag the current document as a duplicate
4. **Return if unique**: If no conflicts, return the original slug
5. **Generate alternatives**: If conflicts exist:
   - Try `{slug}-{locale}` (e.g., `hello-world-en`)
   - Try `{slug}-2`, `{slug}-3`, etc.
   - Try `{slug}-{locale}-2`, etc.
6. **Throw error**: If all 20 alternatives are taken, throw a validation error

### Example Behavior

```typescript
// Single-tenant
'hello-world'      // ✅ Unique → returns "hello-world"
'hello-world'      // ❌ Exists → returns "hello-world-2"
'hello-world-2'    // ❌ Exists → returns "hello-world-3"
'hello-world-en'   // ✅ Unique → returns "hello-world-en"

// Multi-tenant
Tenant A: 'hello-world' ✅
Tenant B: 'hello-world' ✅ (different tenant, so allowed)

// Locale support
req.locale = 'cs'   → tries "hello-world-cs"
req.locale = 'en'   → tries "hello-world-en"
```

## Error Messages

### Single-Tenant

```
A posts with the slug "hello-world" already exists. Slugs must be unique. Please choose a different slug.
```

### Multi-Tenant

```
A posts with the slug "hello-world" already exists in your tenant. Slugs must be unique per tenant. Please choose a different slug.
```

## Advanced Usage

### Custom Tenant Field

```typescript
ensureUniqueSlug('posts', {
  multiTenant: true,
  tenantField: 'organization', // Use 'organization' instead of 'tenant'
})
```

### With Logging

```typescript
ensureUniqueSlug('posts', {
  multiTenant: true,
  enableLogging: true, // Logs all slug generation attempts
})
```

### Combined with Auto-Generation

```typescript
import { ensureUniqueSlug, generateSlugFromTitle } from '@kilivi/payloadcms-localized-slugs/utils'

export const Posts: CollectionConfig = {
  slug: 'posts',
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'slug',
      type: 'text',
      localized: true,
      // Auto-generate from title if empty
      hooks: {
        beforeValidate: [
          async ({ data, value }) => {
            if (!value && data.title) {
              return generateSlugFromTitle(data.title)
            }
            return value
          },
          // Then ensure uniqueness
          ensureUniqueSlug('posts', { multiTenant: true }),
        ],
      },
    },
  ],
}
```

## API Reference

### ensureUniqueSlug()

Creates a Payload FieldHook that validates slug uniqueness.

```typescript
ensureUniqueSlug(
  collection: string,
  options?: {
    multiTenant?: boolean
    tenantField?: string
    enableLogging?: boolean
  }
): FieldHook
```

**Parameters:**

- `collection` - The Payload collection slug (e.g., 'posts')
- `options` - Optional configuration object

**Returns:**

- A Payload `FieldHook` function

**Throws:**

- `ValidationError` if slug cannot be made unique

### generateSlugFromTitle()

Generates a URL-friendly slug from text.

```typescript
generateSlugFromTitle(
  title: string,
  customDiacriticsMap?: Record<string, string>
): string
```

**Parameters:**

- `title` - The text to convert to a slug
- `customDiacriticsMap` - Optional custom character mappings

**Returns:**

- A URL-friendly slug string

### isValidSlug()

Validates slug format.

```typescript
isValidSlug(slug: string): boolean
```

**Parameters:**

- `slug` - The slug to validate

**Returns:**

- `true` if slug matches format `[a-z0-9]+(?:-[a-z0-9]+)*`
- `false` otherwise

## Examples

### Blog with Tenant-Scoped Slugs

```typescript
import { ensureUniqueSlug } from '@kilivi/payloadcms-localized-slugs/utils'

const BlogPosts: CollectionConfig = {
  slug: 'blog-posts',
  fields: [
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
    },
    {
      name: 'title',
      type: 'text',
      localized: true,
    },
    {
      name: 'slug',
      type: 'text',
      localized: true,
      hooks: {
        beforeValidate: [
          ensureUniqueSlug('blog-posts', {
            multiTenant: true,
            enableLogging: true,
          }),
        ],
      },
    },
  ],
}
```

### Documentation Site with Hierarchy

```typescript
import { ensureUniqueSlug, generateSlugFromTitle } from '@kilivi/payloadcms-localized-slugs/utils'

const Docs: CollectionConfig = {
  slug: 'docs',
  fields: [
    {
      name: 'title',
      type: 'text',
      localized: true,
    },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'docs',
    },
    {
      name: 'slug',
      type: 'text',
      localized: true,
      hooks: {
        beforeValidate: [
          // Auto-generate from title
          async ({ value, data }) => {
            if (!value && data.title) {
              return generateSlugFromTitle(data.title)
            }
            return value
          },
          // Ensure uniqueness
          ensureUniqueSlug('docs', { multiTenant: true }),
        ],
      },
    },
  ],
}
```

## Troubleshooting

### "Slug already exists" error on unique slug

**Problem:** You're getting a uniqueness error for a slug that should be unique.

**Solution:**

- Check that multi-tenant is enabled if using tenants
- Verify the `tenantField` name matches your collection
- Ensure the current document ID is being passed correctly

### Slugs not auto-generating

**Problem:** Slugs aren't being generated from titles.

**Solution:**

- `ensureUniqueSlug` only validates; use `generateSlugFromTitle` in a separate hook for auto-generation
- Ensure the hook is in the correct order (generation before validation)

### Locale suffixes not working

**Problem:** Locale-specific slugs aren't being generated.

**Solution:**

- Ensure `req.locale` is set during the request
- Check that the slug field is `localized: true` in your collection config

## Performance Notes

- Slug uniqueness checks query the database (not instant)
- Multi-tenant filtering reduces query scope (faster)
- Considers up to 20 alternative slug candidates
- Should be used as a `beforeValidate` hook for efficiency

## Migration from v0.0.x

If upgrading from an older version:

1. Update import path: `@kilivi/payloadcms-localized-slugs/utils`
2. Change to field hook usage (was: standalone function)
3. Add `multiTenant` option if using multi-tenant

---

For more information, see the [main README](./README.md) and [Quick Start Guide](./QUICK_START.md).
