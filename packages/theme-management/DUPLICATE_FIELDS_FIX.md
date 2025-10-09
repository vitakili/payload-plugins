# Duplicate Field Names - Critical Fix

## Issue
The package was experiencing duplicate field name errors in production:
```
DuplicateFieldName: A field with the name 'lightMode' was found multiple times on the same level
```

## Root Cause
When `enableAdvancedFeatures` was true, the plugin was adding BOTH:
1. Basic color mode fields (`lightMode`/`darkMode`)
2. Extended color mode fields (`extendedLightMode`/`extendedDarkMode`)  
3. Basic typography fields
4. Extended typography fields
5. Basic design fields
6. Extended design fields

These created duplicates because both sets were being added to the configuration simultaneously.

## Fixes Applied

### 1. Renamed Extended Fields
Changed from `lightMode`/`darkMode` to `extendedLightMode`/`extendedDarkMode` in `extendedThemeFields.ts`:

```typescript
// Before
fields: [{
  name: 'lightMode',  // ❌ Conflicts with basic lightMode
  type: 'group',
  fields: [...baseColorFields, ...chartColorFields],
}]

// After  
fields: [{
  name: 'extendedLightMode',  // ✅ Unique name
  type: 'group',
  fields: [...baseColorFields, ...chartColorFields],
}]
```

### 2. Made Basic Fields Conditional
Updated `themeConfigurationField.ts` to only add basic fields when NOT using advanced features:

```typescript
// Color Mode Settings - only when NOT using extended theme
if (includeColorModeToggle && !enableAdvancedFeatures) {
  fields.push({
    // ... lightModeField, darkModeField
  })
}

// Typography - only when NOT using extended theme  
if (!enableAdvancedFeatures) {
  fields.push({
    // ... basic typography fields
  })
}

// Design Customization - only when NOT using extended theme
if (!enableAdvancedFeatures) {
  fields.push({
    // ... borderRadius, fontScale, spacing
  })
}
```

### 3. Updated Live Preview Component
Modified `ThemeLivePreview.tsx` to support both field naming conventions:

```typescript
// Support both basic (lightMode/darkMode) and extended (extendedLightMode/extendedDarkMode)
const lightMode = (themeConfig?.extendedLightMode || themeConfig?.lightMode) as
  | Record<string, string>
  | undefined
const darkMode = (themeConfig?.extendedDarkMode || themeConfig?.darkMode) as
  | Record<string, string>
  | undefined
```

## Validation

Added `validate-fields.js` script to check for duplicate field names before publishing:

```bash
node validate-fields.js
```

This ensures no duplicate fields exist in the configuration.

## Testing

Build and validate:
```bash
pnpm build
node validate-fields.js
```

## Impact

- ✅ No breaking changes for users with `enableAdvancedFeatures: false`
- ✅ Fixed duplicate field errors for users with `enableAdvancedFeatures: true`  
- ✅ Live Preview works with both configurations
- ✅ All builds passing

## Version
Fixed in v0.2.2
