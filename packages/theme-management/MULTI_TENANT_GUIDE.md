# Multi-Tenant Guide for Theme Management Plugin

This guide explains how to use the theme-management plugin in multi-tenant Payload CMS v3 applications.

## Overview

The theme-management plugin works seamlessly with Payload CMS v3's multi-tenant features. You can configure it for:

1. **Shared Theme** - All tenants use the same appearance settings (single global for the entire application)
2. **Per-Tenant Theme** - Each tenant has its own appearance settings (isolated globals via Payload's multi-tenant support)

## Configuration

### Shared Theme (All Tenants Use Same Theme)

Use this configuration when all tenants should share a consistent brand theme:

```typescript
// payload.config.ts
import { themeManagementPlugin } from '@kilivi/payloadcms-theme-management'
import { buildConfig } from 'payload'

export default buildConfig({
  // ... your multi-tenant config
  plugins: [
    themeManagementPlugin({
      enabled: true,
      useStandaloneCollection: true,
      standaloneCollectionSlug: 'appearance-settings',
      standaloneCollectionLabel: 'Appearance Settings',
      defaultTheme: 'cool',
      enableLogging: true,
    }),
  ],
})
```

The plugin creates a single global that all tenants share and can access.

### Per-Tenant Theme (Each Tenant Has Own Theme)

Use this when each tenant can customize their own appearance:

```typescript
// payload.config.ts
import { themeManagementPlugin } from '@kilivi/payloadcms-theme-management'
import { buildConfig } from 'payload'

export default buildConfig({
  // ... your multi-tenant config (with tenantField enabled)
  plugins: [
    themeManagementPlugin({
      enabled: true,
      useStandaloneCollection: true,
      standaloneCollectionSlug: 'appearance-settings',
      standaloneCollectionLabel: 'Appearance Settings',
      defaultTheme: 'cool',
      enableLogging: true,
    }),
  ],
})
```

Payload CMS automatically creates tenant-isolated globals. Each tenant gets its own `appearance-settings` record.

## Fetching Theme in Multi-Tenant Context

### 1. Shared Theme (Single Global)

When all tenants use the same theme, fetch it once:

```typescript
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { unstable_cache } from 'next/cache'

// Create cached theme fetcher with automatic invalidation
const getCachedTheme = unstable_cache(
  async () => {
    const payload = await getPayload({ config: configPromise })

    const appearanceSettings = await payload.findGlobal({
      slug: 'appearance-settings',
    })

    return appearanceSettings?.themeConfiguration
  },
  ['appearance-settings-shared'],
  {
    tags: ['global_appearance-settings'],
    revalidate: 3600,
  },
)

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const themeConfiguration = await getCachedTheme()
  // Use themeConfiguration across all tenants...
}
```

### 2. Per-Tenant Theme (Using `payload.find` for Multi-Tenant)

When each tenant has isolated appearance settings, fetch by tenant:

```typescript
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { headers } from 'next/headers'
import { unstable_cache } from 'next/cache'

// Get tenant ID from request context
function getTenantId(): string {
  const headersList = headers()
  // Adjust based on your multi-tenant setup (subdomain, path, header, etc.)
  return headersList.get('x-tenant-id') || 'default-tenant'
}

// Cache per tenant using tenant ID
const getCachedTenantTheme = (tenantId: string) =>
  unstable_cache(
    async () => {
      const payload = await getPayload({ config: configPromise })

      // For per-tenant globals, use payload.find with tenantId
      const { docs } = await payload.find({
        collection: 'globals',
        where: {
          slug: { equals: 'appearance-settings' },
          tenantId: { equals: tenantId }, // Filter by tenant
        },
        limit: 1,
      })

      return docs[0]?.themeConfiguration
    },
    [`appearance-settings-${tenantId}`],
    {
      tags: [`global_appearance-settings_${tenantId}`], // Per-tenant cache tag
      revalidate: 3600,
    }
  )

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const tenantId = getTenantId()
  const themeConfiguration = await getCachedTenantTheme(tenantId)()

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

## Cache Invalidation with Multi-Tenant

The plugin automatically invalidates cache when appearance settings are updated. For per-tenant setups, cache is invalidated per tenant:

- **Shared Theme**: Cache tag `global_appearance-settings` is invalidated globally
- **Per-Tenant**: Cache tag `global_appearance-settings_{tenantId}` is invalidated per tenant

This means when an admin updates tenant A's theme, only tenant A's cache is refreshed. Other tenants' caches remain valid.

```typescript
// The plugin's afterChange hook handles this automatically:
hooks: {
  afterChange: [
    async ({ doc, req }) => {
      // Automatically invalidates the appropriate cache tag
      revalidateTag(`global_${standaloneCollectionSlug}${tenantId ? `_${tenantId}` : ''}`)
      return doc
    },
  ],
}
```

## Server-Side Theme Injection

Use `ServerThemeInjector` from the `/server` entry point:

```tsx
import { ServerThemeInjector } from '@kilivi/payloadcms-theme-management/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const payload = await getPayload({ config: configPromise })

  // For shared theme:
  const appearanceSettings = await payload.findGlobal({
    slug: 'appearance-settings',
  })

  // For per-tenant theme:
  // const { docs } = await payload.find({
  //   collection: 'globals',
  //   where: {
  //     slug: { equals: 'appearance-settings' },
  //     tenantId: { equals: currentTenantId },
  //   },
  // })
  // const appearanceSettings = docs[0]

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

## Admin Panel Access Control

### Shared Theme

All admins see and can edit the same global:

```typescript
// Access control is already configured by the plugin
// All authenticated users with admin role can view/edit
```

### Per-Tenant Theme

Admins should only access their own tenant's settings. Use Payload's access control:

```typescript
// This is handled automatically by Payload's multi-tenant isolation
// Each tenant's admin only sees their own appearance-settings global
```

If you need custom access rules:

```typescript
import type { GlobalConfig } from 'payload'

const appearanceGlobal: GlobalConfig = {
  slug: 'appearance-settings',
  access: {
    read: async ({ req }) => {
      // Allow if user belongs to the same tenant
      return req.user?.tenant === req.tenant?.id
    },
    update: async ({ req }) => {
      // Only admins can update their tenant's settings
      return req.user?.role === 'admin' && req.user?.tenant === req.tenant?.id
    },
  },
  // ... fields
}
```

## Practical Examples

### Example 1: SaaS App with Per-Tenant Themes

Each customer can customize their brand theme:

```typescript
// payload.config.ts
export default buildConfig({
  multiTenant: {
    enabled: true,
    tenantFieldName: 'tenantId',
  },
  plugins: [
    themeManagementPlugin({
      useStandaloneCollection: true,
      enableLogging: true,
    }),
  ],
  collections: [/* ... */],
})

// app/layout.tsx
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const tenantId = getTenantIdFromRequest()
  const payload = await getPayload({ config: configPromise })

  const { docs } = await payload.find({
    collection: 'globals',
    where: {
      slug: { equals: 'appearance-settings' },
      tenantId: { equals: tenantId },
    },
    limit: 1,
  })

  const themeConfig = docs[0]?.themeConfiguration

  return (
    <html>
      <head>
        <ServerThemeInjector themeConfiguration={themeConfig} />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

### Example 2: White-Label Platform with Shared Theme

Multiple customers share one corporate theme:

```typescript
// payload.config.ts
export default buildConfig({
  multiTenant: {
    enabled: true,
  },
  plugins: [
    themeManagementPlugin({
      useStandaloneCollection: true,
      standaloneCollectionSlug: 'appearance-settings',
      // Single global for all tenants
    }),
  ],
})

// app/layout.tsx
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const payload = await getPayload({ config: configPromise })

  // Single global shared by all tenants
  const appearanceSettings = await payload.findGlobal({
    slug: 'appearance-settings',
  })

  return (
    <html>
      <head>
        <ServerThemeInjector themeConfiguration={appearanceSettings?.themeConfiguration} />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

## Best Practices

### 1. Always Use Cache for Performance

Fetching theme on every request is unnecessary. Use `unstable_cache`:

```typescript
// ✅ Good: Cached and auto-invalidated
const getCachedTheme = unstable_cache(
  async () => {
    const payload = await getPayload({ config: configPromise })
    return payload.findGlobal({ slug: 'appearance-settings' })
  },
  ['appearance-settings'],
  { tags: ['global_appearance-settings'] },
)

// ❌ Avoid: Fetches every time
async function getTheme() {
  const payload = await getPayload({ config: configPromise })
  return payload.findGlobal({ slug: 'appearance-settings' })
}
```

### 2. Be Explicit About Tenant Context

Always know which tenant's theme you're fetching:

```typescript
// ✅ Good: Clear tenant context
const tenantId = getTenantIdFromRequest()
const theme = await payload.find({
  collection: 'globals',
  where: {
    slug: { equals: 'appearance-settings' },
    tenantId: { equals: tenantId },
  },
})

// ❌ Bad: Ambiguous tenant context
const theme = await payload.findGlobal({
  slug: 'appearance-settings',
})
```

### 3. Handle Missing Configuration

Always provide fallbacks:

```typescript
try {
  const appearanceSettings = await payload.findGlobal({
    slug: 'appearance-settings',
  })
  return appearanceSettings?.themeConfiguration || DEFAULT_THEME
} catch (error) {
  console.warn('Failed to fetch theme, using default', error)
  return DEFAULT_THEME
}
```

### 4. Use `findGlobal` vs `find` Correctly

- **`payload.findGlobal({ slug: '...' })`** - For single shared global
- **`payload.find({ collection: 'globals', where: { ... } })`** - For querying with filters (multi-tenant)

```typescript
// Shared global
const shared = await payload.findGlobal({
  slug: 'appearance-settings',
})

// Per-tenant global with filters
const { docs } = await payload.find({
  collection: 'globals',
  where: {
    slug: { equals: 'appearance-settings' },
    tenantId: { equals: tenantId },
  },
})
const perTenant = docs[0]
```

### 5. Document Cache Tags in Your App

Keep track of cache tags you're using:

```typescript
// constants/cacheTags.ts
export const CACHE_TAGS = {
  SHARED_THEME: 'global_appearance-settings',
  TENANT_THEME: (tenantId: string) => `global_appearance-settings_${tenantId}`,
  SHARED_HEADER: 'global_header',
  TENANT_HEADER: (tenantId: string) => `global_header_${tenantId}`,
} as const
```

## Troubleshooting

### Theme Not Appearing for Specific Tenant

1. Verify the `tenantId` filter is correct:

   ```typescript
   const { docs } = await payload.find({
     collection: 'globals',
     where: {
       slug: { equals: 'appearance-settings' },
       tenantId: { equals: tenantId }, // Check this value
     },
   })
   ```

2. Confirm the global exists in admin panel for that tenant

3. Check that cache tags are tenant-specific:
   ```typescript
   tags: [`global_appearance-settings_${tenantId}`]
   ```

### Cache Not Invalidating for Per-Tenant

The plugin automatically uses the tenant context. Ensure:

1. Tenant is correctly identified when updating in admin
2. Cache tags include tenant ID: `global_appearance-settings_{tenantId}`
3. `enableLogging: true` to see invalidation messages

### Access Denied Errors

Verify:

1. User belongs to the correct tenant
2. User has appropriate role (admin, editor, etc.)
3. Payload's multi-tenant access control is properly configured
4. Custom access rules don't block the user
