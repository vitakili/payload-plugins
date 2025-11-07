# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-11-07

### ✨ New Features & Configuration API

#### Added

- **Simplified configuration API** - Match your exact requirements:
  ```typescript
  localizedSlugsPlugin({
    enabled: true,
    locales: ['cs', 'en'],
    defaultLocale: 'cs',
    collections: [
      {
        collection: 'pages',
        generateFromTitle: false,
        titleField: 'title',
        fullPathField: 'path',
      },
      { collection: 'categories' },
      { collection: 'products' },
    ],
    enableLogging: true,
  })
  ```
- **`generateFromTitle` option** - Generate slugs from title field when needed
  - Set `generateFromTitle: true` to auto-generate slugs from title
  - Set `generateFromTitle: false` to copy from existing slug/fullPath fields (default)
  - Works with both localized and non-localized title fields
- **`titleField` option** - Specify custom title field name (default: 'title')
- **Flexible collection configuration** - Mix string slugs with detailed configs

#### Changed

- Configuration now supports `enabled`, `locales`, `defaultLocale`, `collections`, and `enableLogging` at top level
- Collection config now properly typed for both simple strings and detailed objects
- Improved TypeScript types for better IDE autocomplete

#### Notes

- All existing 38 tests pass ✅
- Fully backward compatible with v1.0.0 multitenant fixes
- Works with both Payload CMS 3.58.0 and newer versions

## [1.0.0] - 2025-11-07

### 🎉 Major Release - Infinite Loop Fix & Multitenant Support

#### Breaking Changes

- **Hook now returns document instead of calling `req.payload.update()`**
  - This is the fix for infinite loops in multitenant environments
  - Payload CMS automatically persists the returned document
  - Old custom hooks relying on `req.payload.update()` need to be updated

#### Fixed

- **🔄 Infinite loop issue** - Hook was recursively calling itself in multitenant environments
  - Root cause: `afterChange` hook was calling `req.payload.update()`, which triggered another `afterChange`
  - Solution: Hook now only returns modified document, Payload handles persistence
- **🌍 Multitenant compatibility** - Full support for multitenant plugins
  - Added request context flag to prevent recursive hook execution
  - Works seamlessly with multitenant plugin order
  - Properly handles tenant-specific revalidations

- **📋 Empty `localizedSlugs` field** - Plugin now properly detects localized vs non-localized fields
  - Detects both localized and non-localized field types
  - Detailed logging for field detection debugging

#### Added

- **Localization detection** - Smart detection of field types (localized vs non-localized)
- **Request context flag** - Prevents recursive hook execution in multitenant environments
- **Comprehensive documentation**
  - `INTEGRATION_GUIDE.md` - Complete setup and best practices
  - `HOOK_INJECTION_GUIDE.md` - How to properly inject hooks in Payload CMS
  - `TROUBLESHOOTING.md` - Detailed troubleshooting guide
- **Enhanced logging** - Diagnostic logs for field detection and hook execution

#### Changed

- Hook internals refactored for safety and reliability
- Removed database update calls - uses Payload's automatic persistence instead

#### Improved

- Performance - No extra database calls
- Reliability - No race conditions in multitenant environments
- Debuggability - Detailed logs for troubleshooting

### Migration from Previous Versions

If upgrading from an earlier version:

1. Update: `pnpm update @kilivi/payloadcms-localized-slugs@latest`
2. Configuration stays the same
3. Plugin still works the same way for end users
4. If you have custom hooks, ensure they return documents instead of calling `req.payload.update()`

### Testing

✅ All 38 tests passing

- Hook correctly copies slug and fullPath values
- Handles localized and non-localized fields
- Prevents infinite loops
- Compatible with Payload CMS multitenant environments

---

## [0.1.0] - 2024-10-23

### Added

- Initial release of `@kilivi/payloadcms-localized-slugs`
- Multi-locale slug support (Czech, English, and extensible)
- Automatic slug generation from title fields
- Diacritic character mapping and normalization
- Full path generation for hierarchical content
- Configurable per-collection settings
- TypeScript support with full type safety
- Zero dependencies (Payload only)
- Comprehensive documentation and examples

### Features

- 🌐 Multi-locale slug management
- 🔤 Automatic title-to-slug conversion
- 🎯 Diacritic normalization
- 🔗 Hierarchical path generation
- ⚙️ Per-collection configuration
- ✅ Full type safety
