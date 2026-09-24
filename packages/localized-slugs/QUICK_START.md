# Quick Start Guide

Get up and running with `@kilivi/payloadcms-localized-slugs` in minutes.

## Installation

```bash
npm install @kilivi/payloadcms-localized-slugs
# or
pnpm add @kilivi/payloadcms-localized-slugs
# or
yarn add @kilivi/payloadcms-localized-slugs
```

## Basic Setup

### 1. Add Plugin to Payload Config

```typescript
// payload.config.ts
import { localizedSlugsPlugin } from '@kilivi/payloadcms-localized-slugs'

export default buildConfig({
  plugins: [
    localizedSlugsPlugin({
      locales: ['cs', 'en'],
      defaultLocale: 'cs',
      collections: [
        {
          collection: 'posts',
          slugField: 'slug',
          generateFromTitle: true,
          titleField: 'title',
        },
      ],
    }),
  ],
})
```

### 2. Configure Your Collection

Add `title` and `slug` fields to your collection (they should be `localized: true`):

```typescript
export const Posts: CollectionConfig = {
  slug: 'posts',
  fields: [
    {
      name: 'title',
      type: 'text',
      localized: true,
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      localized: true,
      // Slugs will be auto-generated from title
    },
  ],
}
```

### 3. Done!

The plugin will automatically:

- ✅ Generate slugs from titles for each locale
- ✅ Handle diacritics (ž → z, č → c, etc.)
- ✅ Keep slugs in sync across locales
- ✅ Normalize URLs properly

## Accessing Slugs

### In Server Components / API Routes

```typescript
import { fetchThemeConfiguration } from '@kilivi/payloadcms-theme-management'

// Note: Use the Payload API directly for localized slugs
const post = await payload.findByID({
  collection: 'posts',
  id: '123',
  locale: 'cs',
})

console.log(post.slug) // "muj-clanek"
```

### In Frontend

The slugs are stored directly in the document's `slug` field per locale:

```typescript
// In your Next.js page
export async function getStaticPaths() {
  const posts = await payload.find({
    collection: 'posts',
    locale: 'cs',
  })

  return {
    paths: posts.docs.map((post) => ({
      params: { slug: post.slug },
    })),
    revalidate: 60,
  }
}

export async function getStaticProps({ params }) {
  const posts = await payload.find({
    collection: 'posts',
    where: { slug: { equals: params.slug } },
    locale: 'cs',
  })

  return {
    props: { post: posts.docs[0] },
    revalidate: 60,
  }
}
```

## Configuration Options

### Plugin Options

```typescript
localizedSlugsPlugin({
  // Enable/disable the plugin
  enabled: true,

  // Supported locales
  locales: ['cs', 'en'],

  // Default locale
  defaultLocale: 'cs',

  // Collections to enhance
  collections: [
    {
      collection: 'posts',
      slugField: 'slug', // Field to store the slug
      fullPathField: 'fullPath', // Optional: for hierarchical paths
      generateFromTitle: true, // Auto-generate from title?
      titleField: 'title', // Field to generate slug from
    },
  ],

  // Debug logging
  enableLogging: false,

  // Custom diacritics mapping
  customDiacriticsMap: {
    á: 'a',
    é: 'e',
    // ... etc
  },
})
```

## Examples

### Example 1: Simple Blog

```typescript
// payload.config.ts
import { localizedSlugsPlugin } from '@kilivi/payloadcms-localized-slugs'

export default buildConfig({
  plugins: [
    localizedSlugsPlugin({
      locales: ['cs', 'en', 'sk'],
      collections: [
        {
          collection: 'blog-posts',
          generateFromTitle: true,
          enableLogging: true,
        },
      ],
    }),
  ],
})
```

**Result:** Blog post with title "Hello World" gets slug "hello-world" in each locale.

### Example 2: Multi-Locale Documentation

```typescript
localizedSlugsPlugin({
  locales: ['cs', 'en', 'de'],
  collections: [
    {
      collection: 'docs',
      slugField: 'urlSlug',
      fullPathField: 'urlPath',
      generateFromTitle: true,
      titleField: 'pageTitle',
    },
  ],
})
```

**Result:** Documentation pages get localized slugs and full URL paths like `/docs/introduction`.

### Example 3: Custom Diacritics

```typescript
localizedSlugsPlugin({
  locales: ['pt', 'br'],
  customDiacriticsMap: {
    ã: 'a',
    õ: 'o',
    ç: 'c',
  },
  collections: [{ collection: 'posts' }],
})
```

**Result:** Portuguese characters properly converted in slugs.

## Troubleshooting

### Slugs Not Generating

**Problem:** You're adding documents but slugs aren't being created.

**Solution:**

1. Ensure `generateFromTitle: true` in your config
2. Check that your `titleField` matches your actual field name
3. Verify the title field is `localized: true`
4. Enable logging: `enableLogging: true`

### Diacritics Not Converting Correctly

**Problem:** Special characters like "ž" aren't being normalized.

**Solution:**

```typescript
localizedSlugsPlugin({
  customDiacriticsMap: {
    ž: 'z',
    // Add your custom mappings
  },
})
```

### Slugs Not Syncing Across Locales

**Problem:** One locale has a slug but another doesn't.

**Solution:**

- Make sure both locales have content in the title field
- Check your document is published (if using draft mode)
- Verify the document ID is the same across locales

## Advanced Usage

### Using Hooks Directly

If you need fine-grained control:

```typescript
import { createPopulateLocalizedSlugsHook } from '@kilivi/payloadcms-localized-slugs/hooks'

const collection: CollectionConfig = {
  slug: 'posts',
  fields: [
    // Your fields...
  ],
  hooks: {
    afterChange: [
      createPopulateLocalizedSlugsHook({
        locales: ['cs', 'en'],
        defaultLocale: 'cs',
        slugField: 'slug',
        fullPathField: 'fullPath',
        generateFromTitle: true,
        titleField: 'title',
        enableLogging: false,
        customDiacriticsMap: {},
      }),
    ],
  },
}
```

### Using Utilities

Generate slugs programmatically:

```typescript
import { generateSlugFromTitle } from '@kilivi/payloadcms-localized-slugs/utils'

const slug = generateSlugFromTitle('My Amazing Post')
console.log(slug) // "my-amazing-post"

// With custom mappings
const czechSlug = generateSlugFromTitle('Moje Kaší', { š: 's' })
console.log(czechSlug) // "moje-kasi"
```

## FAQ

**Q: Can I use this with non-Payload frameworks?**  
A: No, this is a Payload CMS plugin. It requires Payload v3+.

**Q: Does it support more than 2 locales?**  
A: Yes! Set any locales you need: `locales: ['en', 'cs', 'sk', 'de', 'pl']`

**Q: Can I manually edit slugs?**  
A: Yes, edit the slug field directly in Payload admin. Manual slugs won't be overwritten unless you update the title.

**Q: What about special characters like numbers or hyphens?**  
A: They're preserved: "Product 2023" → "product-2023"

**Q: Is this compatible with Payload v2?**  
A: No, this is for Payload v3+ only.

## Support & Contributing

- 📚 [Full Documentation](./README.md)
- 🐛 [Report Issues](https://github.com/vitakili/payload-plugins/issues)
- 💡 [Feature Requests](https://github.com/vitakili/payload-plugins/discussions)

## License

MIT © 2024 Kilián Vít
