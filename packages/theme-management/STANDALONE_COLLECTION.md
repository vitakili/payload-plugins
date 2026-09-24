# Standalone Global Feature

## Overview

As of version 0.6.0, the Theme Management Plugin supports creating a **standalone global** for appearance settings, separate from your existing site settings. This gives you more flexibility in organizing your admin panel.

## Why Use Standalone Collection?

### Benefits:

1. **Separation of Concerns** - Keep theme settings separate from other site settings
2. **Cleaner Admin UI** - Dedicated collection instead of a nested tab
3. **Better Access Control** - Apply specific permissions to appearance settings
4. **Simplified Navigation** - Direct access to theme settings without navigating through tabs

## Configuration

### Basic Setup

```typescript
import { themeManagementPlugin } from '@kilivi/payloadcms-theme-management'
import { buildConfig } from 'payload'

export default buildConfig({
  plugins: [
    themeManagementPlugin({
      useStandaloneCollection: true, // Enable standalone mode
    }),
  ],
})
```

This creates a new collection with:

- **Slug**: `appearance-settings`
- **Label**: `Appearance Settings`
- **Group**: `Settings`

### Custom Configuration

```typescript
themeManagementPlugin({
  useStandaloneCollection: true,
  standaloneCollectionSlug: 'theme-config', // Custom slug
  standaloneCollectionLabel: 'Theme Configuration', // Custom label
  // Or with i18n support:
  standaloneCollectionLabel: {
    en: 'Appearance Settings',
    cs: 'Nastavení vzhledu',
  },
})
```

## Fetching Theme Data

When using standalone collection, update your fetch calls:

```typescript
import { fetchThemeConfiguration } from '@kilivi/payloadcms-theme-management'

// Specify your standalone collection slug
const theme = await fetchThemeConfiguration({
  collectionSlug: 'appearance-settings', // Or your custom slug
})
```

## Next.js Integration

Update your layout to fetch from the standalone collection:

```tsx
// app/layout.tsx
import { ServerThemeInjector } from '@kilivi/payloadcms-theme-management/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const payload = await getPayload({ config: configPromise })

  // Fetch from standalone collection
  const { docs } = await payload.find({
    collection: 'appearance-settings', // Your standalone collection slug
    limit: 1,
  })

  return (
    <html lang="en">
      <head>
        <ServerThemeInjector themeConfiguration={docs[0]?.themeConfiguration} />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

## Migration from Tab-based to Standalone

If you're migrating from the tab-based approach to standalone collection:

1. **Update plugin configuration** to enable standalone mode
2. **Create initial document** - The collection will be empty initially
3. **Copy theme settings** - Manually copy your theme configuration to the new collection
4. **Update fetch calls** - Change `collectionSlug` parameter in all fetch calls
5. **Update layout** - Update your Next.js layout to fetch from the new collection

### Migration Example:

```typescript
// Before (tab-based)
const { docs } = await payload.find({
  collection: 'site-settings',
  limit: 1,
})
const theme = docs[0]?.themeConfiguration

// After (standalone)
const { docs } = await payload.find({
  collection: 'appearance-settings',
  limit: 1,
})
const theme = docs[0]?.themeConfiguration
```

## Access Control

The standalone collection is created with default access control:

```typescript
access: {
  read: () => true, // Public read access
  create: ({ req }) => !!req.user, // Requires authentication
  update: ({ req }) => !!req.user, // Requires authentication
  delete: ({ req }) => !!req.user, // Requires authentication
}
```

You can customize access control by modifying the collection after it's created using Payload's hooks or by accessing the collection config directly.

## Default vs Standalone: Comparison

| Feature      | Tab-based (Default)                | Standalone Collection                    |
| ------------ | ---------------------------------- | ---------------------------------------- |
| **Setup**    | Adds to existing collection        | Creates new collection                   |
| **Admin UI** | Nested in tabs                     | Top-level collection                     |
| **Access**   | Inherits from parent collection    | Independent access control               |
| **URL**      | `/admin/collections/site-settings` | `/admin/collections/appearance-settings` |
| **Best for** | All-in-one settings approach       | Separated concerns                       |

## Tips

1. **Use descriptive slugs** - If you have multiple themes or brands, use specific slugs like `brand-a-appearance` or `theme-store`
2. **Consider access control** - Standalone collections allow you to restrict who can modify appearance settings independently
3. **Document your choice** - Document which approach you're using in your project's README
4. **Keep consistent** - Don't switch between approaches mid-project unless necessary

## Troubleshooting

### Collection not appearing

- Ensure `useStandaloneCollection: true` is set
- Check that the slug doesn't conflict with existing collections
- Restart your dev server

### Theme not loading

- Verify you're fetching from the correct collection slug
- Check that a document exists in the standalone collection
- Ensure `themeConfiguration` field exists in the fetched document

### Type errors

- Regenerate Payload types: `payload generate:types`
- Ensure you're importing types from the plugin package

## Example Projects

See the `packages/dev` example for a working implementation of both approaches.
