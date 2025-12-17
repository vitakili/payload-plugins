# Theme Management Plugin - Documentation Index

Complete documentation for the standalone global feature with multi-tenant support.

## Core Documentation

### [README.md](./README.md)

Main entry point with quick start guide, features, and API reference.

- Installation instructions
- Quick Start (Option A: Tab-based, Option B: Standalone Global)
- Configuration options
- Integration examples
- API reference

### [STANDALONE_GLOBAL.md](./STANDALONE_GLOBAL.md)

Comprehensive guide for the standalone global feature.

- Why use standalone global
- Configuration options
- Fetching theme data
- Next.js integration
- Default vs standalone comparison
- Access control
- Multi-tenant basics

### [MULTI_TENANT_GUIDE.md](./MULTI_TENANT_GUIDE.md)

Complete guide for multi-tenant setups (**NEW for v0.6.0**).

- Shared theme vs per-tenant theme
- Per-tenant configuration examples
- Fetching theme in multi-tenant context
- Layout.tsx with multi-tenant
- Admin panel considerations
- Best practices
- Troubleshooting

### [THEME_SELECTION_HOOK.md](./THEME_SELECTION_HOOK.md)

Documentation for the automatic theme selection hook (**NEW for v0.6.0**).

- How theme selection auto-populates Light/Dark Mode colors
- Available color tokens
- Smart population logic
- Admin UI flow
- Data structure examples
- Best practices for color management
- Troubleshooting common issues

### [TAILWIND_INTEGRATION.md](./TAILWIND_INTEGRATION.md)

Complete Tailwind CSS integration guide with full configuration examples.

- Complete tailwind.config.mjs configuration
- Global CSS with theme variables
- How colors integrate with Tailwind
- Component styling with theme colors
- Responsive design implementation
- Animation and accessibility setup
- Troubleshooting guide

## Version History

### [CHANGELOG.md](./CHANGELOG.md)

Complete version history with all changes, fixes, and improvements.

- v0.6.0 - Standalone Global Support (Current)
- v0.2.1 - Proper Tabs Integration
- Earlier versions

## Quick Reference

### For New Users

1. Start with [README.md](./README.md) - Quick Start section
2. Choose Option A (tab-based) or Option B (standalone global)
3. Review configuration examples

### For Multi-Tenant Projects

1. Read [MULTI_TENANT_GUIDE.md](./MULTI_TENANT_GUIDE.md)
2. Decide: Shared theme or per-tenant theme
3. Implement fetching with `tenantSlug` parameter

### For Standalone Global Users

1. Review [STANDALONE_GLOBAL.md](./STANDALONE_GLOBAL.md)
2. Configure plugin with `useStandaloneCollection: true`
3. Use `useGlobal: true` when fetching

## Migration Guide

### From Tab-Based to Standalone Global

```typescript
// Before (v0.5.x)
themeManagementPlugin({
  targetCollection: 'site-settings',
})

// After (v0.6.0)
themeManagementPlugin({
  useStandaloneCollection: true,
  standaloneCollectionSlug: 'appearance-settings',
})
```

### Fetching Theme Data

```typescript
// Old way (collection)
const theme = await fetchThemeConfiguration({
  collectionSlug: 'site-settings',
})

// New way (global)
const theme = await fetchThemeConfiguration({
  collectionSlug: 'appearance-settings',
  useGlobal: true,
})

// Multi-tenant
const theme = await fetchThemeConfiguration({
  tenantSlug: 'tenant-123',
  collectionSlug: 'appearance-settings',
  useGlobal: true,
})
```

## Key Features (v0.6.0)

✅ **Standalone Global Support** - Create separate appearance settings global
✅ **Multi-Tenant Ready** - Built-in support for multi-tenant applications
✅ **Flexible Fetching** - Use `useGlobal` parameter to switch modes
✅ **Backward Compatible** - Existing tab-based setups still work
✅ **Type Safe** - Full TypeScript support with clear types
✅ **Access Control** - Configurable read/write/create/delete permissions
✅ **i18n Support** - Multi-language labels

## Support & Issues

For issues or questions:

1. Check troubleshooting sections in relevant documentation
2. Review [MULTI_TENANT_GUIDE.md](./MULTI_TENANT_GUIDE.md) troubleshooting section
3. Check [CHANGELOG.md](./CHANGELOG.md) for recent fixes

## API Reference Summary

### Plugin Options

| Option                      | Type                             | Default                 | Purpose                       |
| --------------------------- | -------------------------------- | ----------------------- | ----------------------------- |
| `useStandaloneCollection`   | boolean                          | `false`                 | Enable standalone global mode |
| `standaloneCollectionSlug`  | string                           | `'appearance-settings'` | Slug for standalone global    |
| `standaloneCollectionLabel` | string \| Record<string, string> | `'Appearance Settings'` | Label for standalone global   |
| `targetCollection`          | string                           | `'site-settings'`       | Collection for tab-based mode |

### Fetch Options

| Option           | Type    | Default           | Purpose                                 |
| ---------------- | ------- | ----------------- | --------------------------------------- |
| `useGlobal`      | boolean | `false`           | Fetch from global instead of collection |
| `tenantSlug`     | string  | undefined         | Tenant identifier for multi-tenant      |
| `collectionSlug` | string  | `'site-settings'` | Collection/global slug                  |
| `depth`          | number  | undefined         | Payload depth parameter                 |
| `locale`         | string  | undefined         | Payload locale parameter                |

## Environment

- **Plugin Version**: 0.6.0
- **Payload CMS**: v3+
- **Next.js**: 15.4.10+
- **Node.js**: 18+
- **TypeScript**: 5.0+
