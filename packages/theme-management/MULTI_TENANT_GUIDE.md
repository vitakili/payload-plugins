# Multi-Tenant Guide for Theme Management Plugin

This guide explains how to use the theme-management plugin in multi-tenant Payload CMS applications.

## Overview

The theme-management plugin supports two multi-tenant scenarios:

1. **Shared Theme** - All tenants use the same appearance settings (using `isGlobal: true`)
2. **Per-Tenant Theme** - Each tenant has its own appearance settings (using `isGlobal: false`, default)

## Shared Theme Configuration (All Tenants)

Use this when you want all tenants to share the same theme:

```typescript
// payload.config.ts
import { themeManagementPlugin } from '@kilivi/payloadcms-theme-management'
import { buildConfig } from 'payload'

export default buildConfig({
  plugins: [
    themeManagementPlugin({
      useStandaloneCollection: true,
      standaloneCollectionSlug: 'appearance-settings',
      standaloneCollectionLabel: 'Appearance Settings',
      enableLogging: true,
    }),
  ],
  // Your multi-tenant configuration...
})
```

The plugin will automatically create a global that respects your multi-tenant setup. When you need the global to be shared across all tenants, Payload's `isGlobal: true` flag handles this automatically.

## Per-Tenant Theme Configuration (Each Tenant)

Use this when each tenant should have its own theme settings:

```typescript
// payload.config.ts
import { themeManagementPlugin } from '@kilivi/payloadcms-theme-management'
import { buildConfig } from 'payload'

export default buildConfig({
  plugins: [
    themeManagementPlugin({
      useStandaloneCollection: true,
      standaloneCollectionSlug: 'appearance-settings',
      standaloneCollectionLabel: 'Appearance Settings',
      enableLogging: true,
      // By default, each tenant has its own settings
    }),
  ],
  // Your multi-tenant configuration...
})
```

Each tenant gets its own isolated appearance settings global.

## Fetching Theme in Multi-Tenant Context

### Server-Side Fetching

```typescript
import { fetchThemeConfiguration } from '@kilivi/payloadcms-theme-management'

// Get current tenant from context (example)
const tenantId = getRequestContext().tenantId

// Fetch theme for specific tenant
const theme = await fetchThemeConfiguration({
  tenantSlug: tenantId,
  collectionSlug: 'appearance-settings',
  useGlobal: true,
})
```

### Direct Payload API

```typescript
import configPromise from '@payload-config'
import { getPayload } from 'payload'

const payload = await getPayload({ config: configPromise })

// Fetch global for specific tenant
const appearanceSettings = await payload.globals.findBySlug({
  slug: 'appearance-settings',
  // If per-tenant theme:
  where: {
    tenant: { equals: 'tenant-id' },
  },
})

const theme = appearanceSettings?.themeConfiguration
```

## Layout.tsx with Multi-Tenant

```tsx
// app/layout.tsx
import { ServerThemeInjector } from '@kilivi/payloadcms-theme-management/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { headers } from 'next/headers'

// Helper to get tenant from request
function getTenantId() {
  const headersList = headers()
  // Adjust based on how you store tenant ID
  // (could be from subdomain, path, or custom header)
  return headersList.get('x-tenant-id') || undefined
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const tenantId = getTenantId()
  const payload = await getPayload({ config: configPromise })

  try {
    const appearanceSettings = await payload.globals.findBySlug({
      slug: 'appearance-settings',
      ...(tenantId && { where: { tenant: { equals: tenantId } } }),
    })

    const themeConfiguration = appearanceSettings?.themeConfiguration
    return (
      <html lang="en">
        <head>
          <ServerThemeInjector themeConfiguration={themeConfiguration} />
        </head>
        <body>{children}</body>
      </html>
    )
  } catch (error) {
    console.warn('Failed to fetch theme configuration:', error)
    // Fallback to default theme
    return (
      <html lang="en">
        <head>
          <ServerThemeInjector />
        </head>
        <body>{children}</body>
      </html>
    )
  }
}
```

## Admin Panel Multi-Tenant Considerations

### Accessing Tenant-Specific Settings

When admin users view appearance settings, they should only see their own tenant's settings:

```typescript
// This is handled automatically by Payload's multi-tenant access control
// The plugin respects the global's existing access configuration

// Custom access control (if needed):
const appearanceGlobal = {
  slug: 'appearance-settings',
  access: {
    read: async ({ req }) => {
      // Only allow reading own tenant's settings
      return req.user?.tenant === req.headers['x-tenant-id']
    },
    update: async ({ req }) => {
      return req.user?.role === 'admin' && req.user?.tenant === req.headers['x-tenant-id']
    },
  },
  fields: [
    /* theme fields */
  ],
}
```

## Best Practices

### 1. Use Shared Theme for Brand Consistency

If your organization wants a consistent brand across all customer tenants:

```typescript
// All tenants share one theme
// Configure once, apply everywhere
themeManagementPlugin({
  useStandaloneCollection: true,
  // Default: shared across all tenants
})
```

### 2. Use Per-Tenant Theme for Customization

If each customer can customize their own theme:

```typescript
// Each tenant has their own settings
themeManagementPlugin({
  useStandaloneCollection: true,
  // By default: each tenant isolated
})
```

### 3. Document Tenant Fetching

Always be explicit about tenant context in your code:

```typescript
// ✅ Good: Clear tenant context
const theme = await fetchThemeConfiguration({
  tenantSlug: currentTenant.id,
  useGlobal: true,
})

// ❌ Avoid: Ambiguous tenant context
const theme = await fetchThemeConfiguration()
```

### 4. Handle Fallbacks

Always handle missing theme configuration gracefully:

```typescript
try {
  const theme = await fetchThemeConfiguration({
    tenantSlug,
    useGlobal: true,
  })
  return theme || DEFAULT_THEME
} catch (error) {
  console.warn('Failed to fetch tenant theme, using default')
  return DEFAULT_THEME
}
```

## Troubleshooting

### Theme Not Appearing for Tenant

Check that:

1. The global was created successfully in admin
2. The correct `tenantSlug` is being passed to `fetchThemeConfiguration`
3. The tenant's appearance settings global exists in the database

### Access Denied Errors

Verify:

1. User has appropriate permissions for the tenant
2. Access control rules allow read/write for the tenant
3. Multi-tenant middleware is properly configured

### Mixing Themes Between Tenants

If themes are crossing tenant boundaries:

1. Ensure `tenantSlug` parameter is always passed
2. Check that each tenant has its own isolated database records
3. Verify Payload's multi-tenant isolation is working
