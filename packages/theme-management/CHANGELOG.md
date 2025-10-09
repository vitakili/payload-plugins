# Changelog

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
