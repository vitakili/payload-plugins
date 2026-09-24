# Standalone Global Feature

## Overview

As of version 0.6.0, the Theme Management Plugin supports creating a **standalone global** for appearance settings, separate from your existing site settings. This gives you more flexibility in organizing your admin panel.

## Why Use Standalone Global?

### Benefits:

1. **Separation of Concerns** - Keep theme settings separate from other site settings
2. **Cleaner Admin UI** - Dedicated global instead of a nested tab
3. **Better Access Control** - Apply specific permissions to appearance settings
4. **Simplified Navigation** - Direct access to theme settings

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

This creates a new global with:

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

When using standalone global:

```typescript
import { getPayload } from 'payload'

const payload = await getPayload()

// Fetch the global
const appearanceSettings = await payload.globals.findBySlug({
  slug: 'appearance-settings', // Or your custom slug
})

const themeConfiguration = appearanceSettings.themeConfiguration
```

## Next.js Integration

Update your layout to fetch from the standalone global:

```tsx
// app/layout.tsx
import { ServerThemeInjector } from '@kilivi/payloadcms-theme-management/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const payload = await getPayload({ config: configPromise })

  // Fetch from standalone global
  const appearanceSettings = await payload.globals.findBySlug({
    slug: 'appearance-settings', // Your global slug
  })

  return (
    <html lang="en">
      <head>
        <ServerThemeInjector themeConfiguration={appearanceSettings?.themeConfiguration} />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

## Default vs Standalone: Comparison

| Feature      | Tab-based (Default)         | Standalone Global  |
| ------------ | --------------------------- | ------------------ |
| **Setup**    | Adds to existing collection | Creates new global |
| **Admin UI** | Nested in tabs              | Top-level global   |
| **Access**   | Inherits from parent        | Independent        |
| **Best for** | All-in-one settings         | Separated concerns |

## Access Control

The standalone global is created with default access control:

```typescript
access: {
  read: () => true, // Public read access
  create: ({ req }) => !!req.user, // Requires authentication
  update: ({ req }) => !!req.user, // Requires authentication
  delete: ({ req }) => !!req.user, // Requires authentication
}
```

## Multi-Tenant Support

For multi-tenant setups, the standalone global works seamlessly with Payload's multi-tenancy features:

### Configuration for Multi-Tenant

```typescript
// payload.config.ts
import { themeManagementPlugin } from '@kilivi/payloadcms-theme-management'

export default buildConfig({
  // Multi-tenant setup
  globals: [
    // ... other globals
  ],
  plugins: [
    themeManagementPlugin({
      useStandaloneCollection: true,
      standaloneCollectionSlug: 'appearance-settings',
      // The global will automatically support multi-tenancy
      // if your Payload config is set up for it
    }),
  ],
})
```

### Fetching Theme in Multi-Tenant Context

```typescript
import { fetchThemeConfiguration } from '@kilivi/payloadcms-theme-management'

// Fetch for specific tenant
const theme = await fetchThemeConfiguration({
  tenantSlug: 'my-tenant-id',
  collectionSlug: 'appearance-settings',
  useGlobal: true,
})
```

### Server-Side Rendering with Multi-Tenant

```tsx
// app/layout.tsx
import { ServerThemeInjector } from '@kilivi/payloadcms-theme-management/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

async function getAppearanceSettings(tenantId?: string) {
  const payload = await getPayload({ config: configPromise })

  const appearanceSettings = await payload.globals.findBySlug({
    slug: 'appearance-settings',
    ...(tenantId && { where: { tenant: { equals: tenantId } } }),
  })

  return appearanceSettings?.themeConfiguration
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const themeConfiguration = await getAppearanceSettings()

  return (
    <html lang="en">
      <head>
        <ServerThemeInjector themeConfiguration={themeConfiguration} />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

### Global Configuration with `isGlobal` Flag

When using the multi-tenant plugin, you may need to set the `isGlobal: true` flag on the standalone global to ensure it's shared across all tenants:

```typescript
themeManagementPlugin({
  useStandaloneCollection: true,
  // In multi-tenant setups, the global might need:
  // isGlobal: true - if you want appearance settings shared across all tenants
  // isGlobal: false - if each tenant has its own appearance settings (default)
})
```
