# Usage Examples

## Configuration Examples for v1.1.0+

The `localizedSlugsPlugin` now supports your exact desired configuration format. Here are common usage patterns:

### Example 1: Simple Configuration (Copy from existing fields)

```typescript
import { localizedSlugsPlugin } from '@kilivi/payloadcms-localized-slugs'

export default buildConfig({
  // ... other config
  plugins: [
    localizedSlugsPlugin({
      enabled: true,
      locales: ['cs', 'en'],
      defaultLocale: 'cs',
      collections: [
        { collection: 'pages' },
        { collection: 'categories' },
        { collection: 'products' },
      ],
      enableLogging: false,
    }),
  ],
})
```

**What it does:**

- Copies existing `slug` and `fullPath` fields to `localizedSlugs`
- Works with both localized and non-localized field values
- Assumes default field names: `slug`, `fullPath`

---

### Example 2: Custom Field Names

```typescript
localizedSlugsPlugin({
  enabled: true,
  locales: ['cs', 'en'],
  defaultLocale: 'cs',
  collections: [
    {
      collection: 'pages',
      slugField: 'customSlug', // Use 'customSlug' instead of 'slug'
      fullPathField: 'customPath', // Use 'customPath' instead of 'fullPath'
    },
  ],
  enableLogging: false,
})
```

**What it does:**

- Reads from your custom field names
- Populates `localizedSlugs` from those fields
- Useful when your collection uses different field naming conventions

---

### Example 3: Generate Slugs from Title (All Collections)

```typescript
localizedSlugsPlugin({
  enabled: true,
  locales: ['cs', 'en'],
  collections: [
    {
      collection: 'pages',
      generateFromTitle: true,
      titleField: 'title', // Generate slugs from the 'title' field
    },
    {
      collection: 'categories',
      generateFromTitle: true,
      titleField: 'title',
    },
    {
      collection: 'products',
      generateFromTitle: true,
      titleField: 'title',
    },
  ],
  enableLogging: true,
})
```

**What it does:**

- Auto-generates URL-friendly slugs from title field
- Slugification: "My Product Title" → "my-product-title"
- Sets fullPath to "/" + slug: "/my-product-title"
- Works with both localized titles `{ cs: "...", en: "..." }` and plain strings
- Great for content-heavy sites where you want consistent slug generation

---

### Example 4: Mixed Configuration (Your Exact Use Case)

```typescript
localizedSlugsPlugin({
  enabled: true,
  locales: ['cs', 'en'],
  defaultLocale: 'cs',
  collections: [
    {
      collection: 'pages',
      generateFromTitle: false, // Use existing slug field
      titleField: 'title',
      fullPathField: 'path',
    },
    {
      collection: 'categories',
      // Uses defaults: generateFromTitle=false, slugField='slug', fullPathField='fullPath'
    },
    {
      collection: 'products',
      // Uses defaults too
    },
  ],
  enableLogging: true,
})
```

**What it does:**

- Mixes different strategies across collections
- Pages: Copy from custom `path` field
- Categories & Products: Use default fields (`slug`, `fullPath`)
- Enables logging to see hook execution details

---

### Example 5: Custom Title Field Names

```typescript
localizedSlugsPlugin({
  enabled: true,
  locales: ['cs', 'en'],
  collections: [
    {
      collection: 'pages',
      generateFromTitle: true,
      titleField: 'pageTitle', // Different field name than default 'title'
    },
    {
      collection: 'products',
      generateFromTitle: true,
      titleField: 'productName', // Custom field name
    },
  ],
  enableLogging: false,
})
```

**What it does:**

- Generates slugs from custom-named title fields
- Useful when your collections don't follow standard naming

---

### Example 6: Disable Plugin Temporarily

```typescript
localizedSlugsPlugin({
  enabled: process.env.NODE_ENV === 'production', // Only in production
  locales: ['cs', 'en'],
  collections: [{ collection: 'pages' }, { collection: 'categories' }, { collection: 'products' }],
  enableLogging: process.env.DEBUG === 'true',
})
```

**What it does:**

- Enables/disables plugin based on conditions
- Plugin remains safe even when disabled
- Useful for feature flags or environment-specific behavior

---

## Collection Configuration Options

Each collection config item can be either:

### String Shorthand

```typescript
{
  collection: 'pages'
}
```

Uses defaults:

- `generateFromTitle: false`
- `slugField: 'slug'`
- `fullPathField: 'fullPath'`
- `titleField: 'title'`

### Detailed Object

```typescript
{
  collection: 'pages',
  generateFromTitle: boolean,     // Optional (default: false)
  titleField: string,             // Optional (default: 'title')
  slugField: string,              // Optional (default: 'slug')
  fullPathField: string,          // Optional (default: 'fullPath')
}
```

---

## Payload Collection Setup

For the plugin to work, your collections must have:

### Option 1: Using Existing Fields (Copy Mode)

```typescript
import { CollectionConfig } from 'payload'

export const Pages: CollectionConfig = {
  slug: 'pages',
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      localized: true, // Must be localized!
      required: true,
    },
    {
      name: 'path',
      type: 'text',
      localized: true, // Must be localized!
    },
    {
      name: 'localizedSlugs',
      type: 'json', // Plugin will populate this automatically
      label: 'Localized Slugs',
    },
  ],
}
```

### Option 2: Using Title Generation (Generate Mode)

```typescript
export const Products: CollectionConfig = {
  slug: 'products',
  fields: [
    {
      name: 'title',
      type: 'text',
      localized: true, // For multi-language titles
      required: true,
    },
    {
      name: 'localizedSlugs',
      type: 'json', // Plugin will populate this automatically
      label: 'Localized Slugs',
    },
  ],
}
```

---

## TypeScript Support

Full TypeScript support is included. Types are automatically inferred:

```typescript
import type {
  LocalizedSlugsCollectionConfig,
  LocalizedSlugsPluginOptions,
} from '@kilivi/payloadcms-localized-slugs'

const pluginConfig: LocalizedSlugsPluginOptions = {
  enabled: true,
  locales: ['cs', 'en'],
  defaultLocale: 'cs',
  collections: [
    {
      collection: 'pages',
      generateFromTitle: false,
      fullPathField: 'path',
    },
  ],
  enableLogging: true,
}

export default buildConfig({
  plugins: [localizedSlugsPlugin(pluginConfig)],
})
```

---

## Logging Output

With `enableLogging: true`, you'll see detailed output like:

```
🌐 Localized Slugs Plugin: Initializing with options: {
  locales: [ 'cs', 'en' ],
  collections: [ 'pages', 'categories', 'products' ]
}
🌐 Enhancing collection "pages" with localized slugs
🌐 Populated localizedSlugs for pages: {
  en: { slug: 'my-page', fullPath: '/my-page' },
  cs: { slug: 'moje-stranka', fullPath: '/moje-stranka' }
}
```

---

## Troubleshooting

### Empty `localizedSlugs`

If `localizedSlugs` is empty after create/update:

1. Check that source fields (`slug`/`fullPath` or `title`) are populated
2. Ensure fields are marked as `localized: true` in your collection
3. Check `enableLogging: true` to see detailed field detection logs
4. For `generateFromTitle`: ensure title field exists and contains data

### Infinite Loop (Fixed in v1.0.0+)

If you see repeated updates to the same document:

- This is **fixed** in v1.0.0 and later
- The hook now uses request context flags to prevent recursion
- Update to the latest version if you're on an older release

### Type Errors

If you get TypeScript errors:

1. Ensure `payload` version matches plugin's peer dependency
2. Run `pnpm install` to update dependencies
3. Recompile TypeScript with `pnpm build`

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for more help.

---

## Version History

| Version   | Feature                                           |
| --------- | ------------------------------------------------- |
| **1.1.0** | `generateFromTitle` option, simplified config API |
| **1.0.0** | Fixed infinite loops, multitenant support         |
| 0.1.46    | Previous release                                  |

---

For more details, see:

- [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) - Complete setup guide
- [HOOK_INJECTION_GUIDE.md](./HOOK_INJECTION_GUIDE.md) - Understanding the hook system
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Common issues and fixes
