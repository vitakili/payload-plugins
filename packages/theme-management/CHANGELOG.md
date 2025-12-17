# Changelog

## [0.6.0] - 2025-12-17

### ✨ NEW: Standalone Global Support with Theme Selection Hook

#### Added

- **Standalone Global Mode** - Create a separate "Appearance Settings" global instead of adding as a tab
  - New option: `useStandaloneCollection` - Enable standalone global mode (default: `false`)
  - New option: `standaloneCollectionSlug` - Custom slug for standalone global (default: `'appearance-settings'`)
  - New option: `standaloneCollectionLabel` - Custom label for standalone global (default: `'Appearance Settings'`)
  - Supports i18n labels with `Record<string, string>` format
  - Created global includes access control and is grouped under "Settings"
  - Full multi-tenant support with automatic tenant isolation

- **Theme Selection Hook** - Auto-populate Light/Dark Mode colors (**NEW**)
  - When user selects a theme, Light Mode and Dark Mode color fields are automatically populated
  - Uses `beforeChange` hook at global level
  - Smart logic: Only populates if colors haven't been manually edited
  - Supports all 19 color tokens (background, foreground, primary, etc.)
  - Works with all theme presets (Cool, Brutal, Neon, Solar, etc.)

- **Enhanced fetchThemeConfiguration function**
  - New option: `useGlobal` - Set to `true` when fetching from standalone global (default: `false`)
  - Multi-tenant support with `tenantSlug` parameter
  - Works seamlessly with both collection and global modes

#### Architecture Changes

- Changed from Collection-based to Global-based for standalone mode
- Globals are better suited for singleton settings like appearance
- Removed unnecessary `themeConfiguration` group wrapping to flatten data structure
- Data structure now cleaner: `themeConfiguration` directly contains settings (no double-nesting)
- Improved performance for theme configuration retrieval
- Better compatibility with Payload CMS patterns

#### Bug Fixes

- ✅ Fixed data structure nesting issue (was `themeConfiguration.themeConfiguration`)
- ✅ Ensured Light/Dark Mode colors populate correctly from theme presets
- ✅ Proper smart detection of manually edited colors

#### Benefits

- **Separation of Concerns** - Keep theme settings separate from other site settings
- **Cleaner Admin UI** - Dedicated global instead of nested tab
- **Auto-Configuration** - Theme presets now auto-populate color modes
- **Better Performance** - Direct global access vs collection queries
- **Multi-Tenant Ready** - Built-in support for multi-tenant applications
- **Better Access Control** - Apply specific permissions to appearance settings
- **Flexible Configuration** - Choose between tab-based or standalone approach

#### Usage Examples

**Standalone Global (New):**

```typescript
themeManagementPlugin({
  useStandaloneCollection: true,
  standaloneCollectionSlug: 'appearance-settings',
  standaloneCollectionLabel: 'Appearance Settings',
})
```

**Fetching with useGlobal:**

```typescript
// When using standalone global:
const theme = await fetchThemeConfiguration({
  collectionSlug: 'appearance-settings',
  useGlobal: true,
  tenantSlug: 'tenant-123', // For multi-tenant
})

// Access auto-populated colors
console.log(theme.themeConfiguration.lightMode.primary) // '#3b82f6'
console.log(theme.themeConfiguration.darkMode.primary) // '#60a5fa'
```

**Tab-based (Default - Backward Compatible):**

```typescript
themeManagementPlugin({
  targetCollection: 'site-settings',
})
```

#### Documentation

- Added comprehensive `STANDALONE_GLOBAL.md` guide
- Added new `MULTI_TENANT_GUIDE.md` for multi-tenant setups
- Added new `THEME_SELECTION_HOOK.md` documenting auto-population feature
- Added new `TAILWIND_INTEGRATION.md` with complete Tailwind CSS configuration
- Updated README with:
  - Complete `tailwind.config.mjs` with all color tokens and responsive utilities
  - Full `globals.css` with CSS variables, animations, and FOUC prevention
  - Tailwind class examples for using theme colors
- Updated API reference with `useGlobal` parameter

#### Database Schema

- Fixed PostgreSQL identifier length issues by adding `dbName` properties to 8 select fields
- No migration required - schema properly handles both old and new fields
- Cleaner enum names (e.g., `border_radius` instead of `appearance_settings_theme_configuration_border_radius`)

## [0.2.1] - 2025-10-09

### 🔧 CRITICAL FIX: Proper Tabs Integration

#### Fixed

- **Plugin now correctly integrates with existing tabs field**
  - When `tabs` field exists in collection, plugin adds "Nastavení vzhledu" (Appearance Settings) as a new tab
  - When no `tabs` field exists, plugin creates a `group` field instead
  - No more nested tabs or structural issues!

#### How It Works Now

**Scenario 1: Collection with existing tabs** (SiteSettings with General, SEO tabs)

```typescript
// Before plugin:
fields: [
  {
    type: 'tabs',
    tabs: [
      { name: 'general', label: 'General', fields: [...] },
      { name: 'seo', label: 'SEO', fields: [...] }
    ]
  }
]

// After plugin:
fields: [
  {
    type: 'tabs',
    tabs: [
      { name: 'general', label: 'General', fields: [...] },
      { name: 'seo', label: 'SEO', fields: [...] },
      { name: 'themeConfiguration', label: '🎨 Nastavení vzhledu', fields: [...] }  // ✅ Added!
    ]
  }
]
```

**Scenario 2: Collection without tabs**

```typescript
// Before plugin:
fields: [
  { name: 'title', type: 'text' }
]

// After plugin:
fields: [
  { name: 'title', type: 'text' },
  { name: 'themeConfiguration', type: 'group', label: '🎨 Nastavení vzhledu', fields: [...] }  // ✅ Added as group!
]
```

#### Testing

- ✅ Test with existing tabs - PASSED
- ✅ Test without tabs - PASSED
- ✅ All validation tests - PASSED

---

## [0.2.0] - 2025-10-09

### 🎨 MAJOR UPDATE: Tabs Structure & Extended Theme Support

#### Breaking Changes

- **Plugin now returns `tabs` field instead of `group` field**
  - Theme configuration is now inside a tab named "Nastavení vzhledu" (Appearance Settings)
  - This fixes the runtime error: "right-hand side of 'in' should be an object, got undefined"
  - Users with existing configurations may need to adjust their payload config

#### Added

- ✅ **Extended Theme Configuration** with OKLCH color support
  - Full shadcn/ui color token support (19+ semantic tokens)
  - Compatible with https://ui.shadcn.com/themes and https://tweakcn.com/editor/theme
  - OKLCH color format for better color interpolation
  - Separate light/dark mode extended configurations
- ✅ **Chart Colors** support
  - 5 customizable chart colors for data visualization
  - OKLCH format for consistent color rendering
- ✅ **New Extended Theme Fields**:
  - `extendedTheme` - Extended theme selection
  - `extendedLightMode` - Advanced light mode OKLCH colors
  - `extendedDarkMode` - Advanced dark mode OKLCH colors
  - `chartColors` - Data visualization color palette

#### Enhanced

- 🎨 Better field organization with collapsible sections
- 🎨 Improved Czech/English localization
- 🎨 Enhanced field descriptions for better UX

#### Testing

- ✅ Added comprehensive validation scripts
- ✅ All automated tests pass
- ✅ Field structure validated
- ✅ Tabs integration tested
- ✅ Extended theme configuration verified

### Migration Guide

If you're upgrading from v0.1.x:

**Before (v0.1.x):**

```typescript
// Plugin added a group field directly to the collection
fields: [
  { name: 'siteName', type: 'text' },
  { name: 'themeConfiguration', type: 'group', fields: [...] }
]
```

**After (v0.2.0):**

```typescript
// Plugin adds a tabs field with "Nastavení vzhledu" tab
fields: [
  { name: 'siteName', type: 'text' },
  {
    type: 'tabs',
    tabs: [
      {
        name: 'themeConfiguration',
        label: { cs: 'Nastavení vzhledu' },
        fields: [...]
      }
    ]
  }
]
```

**What to update:**

1. Your Payload config should handle tabs structure
2. Data access changes from `doc.themeConfiguration.theme` to `doc.themeConfiguration.theme` (stays the same, as the tab name is `themeConfiguration`)
3. Enable extended theme features by setting `enableAdvancedFeatures: true` in plugin options

---

## [0.1.18] - 2025-10-08

### Fixed

- Extended theme system completion
- Client-side JS application matching silicondeck pattern
- Component path syntax validation

### Added

- Troubleshooting documentation
- Error resolution guides for Payload CMS bug #12867

---

## [0.1.17] - 2025-10-07

### Added

- Extended theme presets with OKLCH support
- Theme helpers and utilities
- Tailwind CSS variable references

---

## [0.1.16] - 2025-10-06

### Added

- Extended theme presets infrastructure
- OKLCH color format support
- Chart color tokens

---

## [0.1.15] - 2025-10-05

### Enhanced

- Theme configuration field improvements
- Better TypeScript types

---

## [0.1.14] - 2025-10-04

### Added

- Initial extended theme system
- Client-side theme application

---

**For full documentation, see [README.md](./README.md)**
