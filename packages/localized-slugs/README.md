# @kilivi/payloadcms-localized-slugs

Localized slugs plugin for Payload CMS v3 with multi-locale support. Automatically copies and manages URL-friendly slugs for collections with internationalization (i18n) capabilities.

## Features

- 🌐 Multi-locale slug support (Czech, English, and extensible)
- � Copy slug/fullPath values from existing localized fields to `localizedSlugs`
- 🎯 Automatic localization detection (handles both localized and non-localized fields)
- 🔗 Full path support for hierarchical content
- ⚙️ Configurable per-collection settings
- 📦 Zero dependencies (Payload only)
- ✅ TypeScript support with full type safety
- 🎨 Client-side components for frontend integration
- ✅ **Fully compatible with multitenant plugins** - no infinite loops!

## Documentation

- 📖 [Integration Guide](./INTEGRATION_GUIDE.md) - **Start here!** Complete setup and troubleshooting
- 📖 [Client Components Usage Guide](./CLIENT_COMPONENTS_GUIDE.md) - How to use client components in your Next.js app
- 🚀 [Quick Start Guide](./QUICK_START.md)
- 🏢 [Multi-Tenant Guide](./MULTI_TENANT.md)
- 📦 [NPM Deployment Guide](./NPM_DEPLOYMENT.md)

## Installation

```bash
npm install @kilivi/payloadcms-localized-slugs
# or
pnpm add @kilivi/payloadcms-localized-slugs
# or
yarn add @kilivi/payloadcms-localized-slugs
```

## Basic Usage

```typescript
import { localizedSlugsPlugin } from '@kilivi/payloadcms-localized-slugs'

export default buildConfig({
  plugins: [
    localizedSlugsPlugin({
      enabled: true,
      locales: ['cs', 'en'],
      collections: [
        {
          collection: 'pages',
          slugField: 'slug',
          fullPathField: 'fullPath',
        },
      ],
      enableLogging: true, // Show debug logs
    }),
  ],
})
```

## How It Works

The plugin automatically:

1. **Detects localized fields** - Works with both `localized: true` and regular fields
2. **Copies values** - Takes `slug` and `fullPath` values and copies them to `localizedSlugs`
3. **Creates a computed field** - Stores the localized slugs for easy access
4. **Prevents infinite loops** - Uses internal flags to prevent multitenant recursion

## Example Output

**Input Collection:**

```typescript
{
  name: 'slug',
  type: 'text',
  localized: true,  // Must be localized!
}
{
  name: 'fullPath',
  type: 'text',
  localized: true,  // Must be localized!
}
```

**Output Document:**

```json
{
  "slug": {
    "en": "contact-us",
    "cs": "kontaktujte-nas"
  },
  "fullPath": {
    "en": "/contact-us",
    "cs": "/kontaktujte-nas"
  },
  "localizedSlugs": {
    "en": {
      "slug": "contact-us",
      "fullPath": "/contact-us"
    },
    "cs": {
      "slug": "kontaktujte-nas",
      "fullPath": "/kontaktujte-nas"
    }
  }
}
```

        {
          collection: 'pages',
          slugField: 'urlSlug',
          generateFromTitle: true,
          titleField: 'pageTitle',
        },
      ],
      enableLogging: true,
    }),

],
})

````

## Configuration

### Plugin Options

```typescript
interface LocalizedSlugsPluginOptions {
  /** Whether the plugin is enabled (default: true) */
  enabled?: boolean

  /** Array of supported locales (default: ['cs', 'en']) */
  locales?: ('cs' | 'en')[]

  /** Default locale (default: 'cs') */
  defaultLocale?: 'cs' | 'en'

  /** Collections configuration */
  collections?: CollectionConfig[]

  /** Enable console logging (default: false) */
  enableLogging?: boolean

  /** Custom diacritics mapping for slug generation */
  customDiacriticsMap?: Record<string, string>
}
````

### Collection Configuration

```typescript
interface CollectionConfig {
  /** Collection slug */
  collection: string

  /** Field name for the slug (default: 'slug') */
  slugField?: string

  /** Field name for the full path (default: 'fullPath') */
  fullPathField?: string

  /** Auto-generate slugs from title field (default: false) */
  generateFromTitle?: boolean

  /** Title field name for auto-generation (default: 'title') */
  titleField?: string
}
```

## How It Works

### Slug Generation

The plugin automatically generates URL-friendly slugs from titles:

- Converts text to lowercase
- Removes diacritics (ž → z, č → c, etc.)
- Replaces spaces and special characters with hyphens
- Removes duplicate hyphens
- Trims leading/trailing hyphens

**Example:**

```
"Čeština" → "cestina"
"Hello World" → "hello-world"
"C++ Programming" → "c-programming"
```

### Localized Slugs

Each locale gets its own slug based on the localized title:

```typescript
// In your collection:
{
  title: {
    cs: "Přispívání",
    en: "Contributing"
  },
  slug: {
    cs: "prispivani",      // Auto-generated
    en: "contributing"     // Auto-generated
  }
}
```

### Full Path Generation

For hierarchical collections (e.g., pages with parents), the plugin generates full paths:

```typescript
// Parent: /docs
// Child with slug "guides" → /docs/guides
{
  slug: "guides",
  fullPath: "/docs/guides"  // Auto-generated
}
```

## Extending Locales

To add custom locales beyond Czech and English:

```typescript
import { localizedSlugsPlugin } from '@kilivi/payloadcms-localized-slugs'

localizedSlugsPlugin({
  locales: ['cs', 'en', 'sk'], // Add Slovak
  defaultLocale: 'cs',
  customDiacriticsMap: {
    š: 's',
    ž: 'z',
    ť: 't',
    ľ: 'l',
  },
  // ... rest of config
})
```

## Custom Diacritics Mapping

Override the default diacritics mapping:

```typescript
localizedSlugsPlugin({
  customDiacriticsMap: {
    á: 'a',
    é: 'e',
    í: 'i',
    ó: 'o',
    ú: 'u',
    ü: 'u',
  },
})
```

## Integration with Collections

### Basic Collection Setup

```typescript
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
      admin: {
        description: 'Auto-generated from title. Edit to customize.',
      },
    },
    {
      name: 'content',
      type: 'richText',
      localized: true,
    },
  ],
}
```

### Hierarchical Collection (with Parent)

```typescript
export const Pages: CollectionConfig = {
  slug: 'pages',
  fields: [
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'pages',
      required: false,
    },
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
    },
    {
      name: 'fullPath',
      type: 'text',
      localized: true,
      admin: {
        readOnly: true,
        description: 'Full URL path (auto-generated)',
      },
    },
  ],
}
```

## API Reference

### `createLocalizedSlugField`

Creates a localized slug field configuration:

```typescript
import { createLocalizedSlugField } from '@kilivi/payloadcms-localized-slugs/fields'

const slugField = createLocalizedSlugField({
  locales: ['cs', 'en'],
  defaultLocale: 'cs',
})
```

### `createPopulateLocalizedSlugsHook`

Creates a hook for automatic slug generation:

```typescript
import { createPopulateLocalizedSlugsHook } from '@kilivi/payloadcms-localized-slugs/hooks'

const beforeChangeHook = createPopulateLocalizedSlugsHook({
  slugField: 'slug',
  titleField: 'title',
  locales: ['cs', 'en'],
})
```

## Examples

### Blog with Localized Posts

```typescript
import { localizedSlugsPlugin } from '@kilivi/payloadcms-localized-slugs'

export default buildConfig({
  collections: [
    {
      slug: 'posts',
      fields: [
        { name: 'title', type: 'text', localized: true },
        { name: 'slug', type: 'text', localized: true },
        { name: 'content', type: 'richText', localized: true },
      ],
    },
  ],
  plugins: [
    localizedSlugsPlugin({
      locales: ['cs', 'en'],
      collections: [
        {
          collection: 'posts',
          generateFromTitle: true,
        },
      ],
    }),
  ],
})
```

### Documentation Site with Hierarchy

```typescript
localizedSlugsPlugin({
  locales: ['cs', 'en'],
  collections: [
    {
      collection: 'docs',
      slugField: 'slug',
      fullPathField: 'urlPath',
      generateFromTitle: true,
      titleField: 'title',
    },
  ],
})
```

## Troubleshooting

### Slugs Not Auto-Generating

- Ensure `generateFromTitle: true` in collection config
- Check that the `titleField` matches your field name
- Verify the title field is `localized: true`

### Diacritics Not Converting Correctly

- Provide a `customDiacriticsMap` for unsupported characters
- Check the locale matches your content

### Full Paths Not Generating

- Ensure the collection has a parent relationship field
- Verify `fullPathField` matches your field name
- Full paths only generate for hierarchical collections

## Client-Side Usage

The plugin provides client components for use in your Next.js frontend application.

### Installation in Next.js App

```typescript
// app/layout.tsx
'use client'

import { SlugProvider } from '@kilivi/payloadcms-localized-slugs/client'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <SlugProvider>
          {children}
        </SlugProvider>
      </body>
    </html>
  )
}
```

### Using Client Components

```typescript
// app/[locale]/posts/[slug]/page.tsx
import { ClientSlugHandler } from '@kilivi/payloadcms-localized-slugs/client'

export default async function PostPage({ params }) {
  const post = await getPayloadData('posts', params.slug)

  return (
    <div>
      <ClientSlugHandler localizedSlugs={post.localizedSlugs} />
      <h1>{post.title}</h1>
    </div>
  )
}
```

### Language Switcher Example

```typescript
'use client'

import { useSlugContext } from '@kilivi/payloadcms-localized-slugs/client'
import Link from 'next/link'

export function LanguageSwitcher() {
  const { state } = useSlugContext()
  const { localizedSlugs } = state

  return (
    <nav>
      {Object.entries(localizedSlugs).map(([locale, slug]) => (
        <Link key={locale} href={`/${locale}/${slug}`}>
          {locale.toUpperCase()}
        </Link>
      ))}
    </nav>
  )
}
```

📖 **For detailed client component usage, see the [Client Components Usage Guide](./CLIENT_COMPONENTS_GUIDE.md)**

## Performance

- Slug generation happens on document creation/update via hooks
- No runtime overhead for reads
- Scales well with collection size
- Supports batch operations

## License

MIT

## Author

Kilián Vít

## Contributing

Contributions welcome! Please open an issue or submit a PR.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history.
