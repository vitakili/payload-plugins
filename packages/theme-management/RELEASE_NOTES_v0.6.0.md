# Theme Management Plugin v0.6.0 - Release Summary

## 🎯 Major New Feature: Standalone Collection Support

### What's New?

The theme-management plugin now supports creating a **standalone collection** for appearance settings, giving you more flexibility in organizing your Payload CMS admin panel.

### Why This Matters?

Previously, the plugin could only add theme settings as a tab within an existing collection (like `site-settings`). This worked fine for simple setups, but some projects needed more separation.

Now you can choose:

- **Tab Mode (Default)**: Add theme settings as a tab in an existing collection
- **Standalone Mode (New)**: Create a separate "Appearance Settings" collection

### How to Use?

#### Enable Standalone Mode:

```typescript
import { themeManagementPlugin } from '@kilivi/payloadcms-theme-management'

export default buildConfig({
  plugins: [
    themeManagementPlugin({
      useStandaloneCollection: true, // 🆕 Enable standalone mode
      standaloneCollectionSlug: 'appearance-settings', // Optional
      standaloneCollectionLabel: 'Appearance Settings', // Optional
    }),
  ],
})
```

#### Fetch Theme Data:

```typescript
// Update your fetch calls to use the new collection
const { docs } = await payload.find({
  collection: 'appearance-settings', // Use your standalone collection slug
  limit: 1,
})
```

### Benefits:

1. **Separation of Concerns** - Keep theme settings independent from other site settings
2. **Cleaner Admin UI** - Direct access to appearance settings without nested navigation
3. **Better Access Control** - Apply specific permissions to theme settings separately
4. **Flexible Architecture** - Choose the approach that fits your project

### Configuration Options:

| Option                      | Type                               | Default                 | Description                        |
| --------------------------- | ---------------------------------- | ----------------------- | ---------------------------------- |
| `useStandaloneCollection`   | `boolean`                          | `false`                 | Enable standalone collection mode  |
| `standaloneCollectionSlug`  | `string`                           | `'appearance-settings'` | Slug for the standalone collection |
| `standaloneCollectionLabel` | `string \| Record<string, string>` | `'Appearance Settings'` | Label (supports i18n)              |

### Documentation:

- [STANDALONE_COLLECTION.md](./STANDALONE_COLLECTION.md) - Comprehensive guide
- [STANDALONE_EXAMPLE.ts](./docs/STANDALONE_EXAMPLE.ts) - Code examples
- [README.md](./README.md) - Updated with new options

### Backward Compatibility:

✅ **100% backward compatible!** The default behavior remains unchanged. Existing projects will continue to work without any modifications.

### Migration Path:

If you want to switch from tab-based to standalone:

1. Enable `useStandaloneCollection: true`
2. Update fetch calls to use the new collection slug
3. Manually migrate theme settings data to the new collection

### What's Next?

- Test the new standalone mode in your projects
- Provide feedback for improvements
- Consider migrating if standalone mode fits your architecture better

---

**Version**: 0.6.0  
**Release Date**: December 17, 2025  
**Breaking Changes**: None  
**Migration Required**: No (optional feature)
