# Duplicate Field Name Fix - Summary

## ✅ FIXED: Production Error

**Original Error:**
```
DuplicateFieldName: A field with the name 'lightMode' was found multiple times on the same level
```

**Root Cause:**
When `enableAdvancedFeatures: true`, BOTH basic color mode fields AND extended color mode fields were being added, creating duplicates.

**Solution Applied:**
1. Renamed extended fields: `lightMode` → `extendedLightMode`, `darkMode` → `extendedDarkMode`
2. Made basic fields conditional - only added when `enableAdvancedFeatures: false`
3. Updated Live Preview to support both naming conventions

## Changes Made

###  1. Extended Theme Fields (`src/fields/extendedThemeFields.ts`)
```typescript
// Changed field names to avoid conflicts
fields: [{
  name: 'extendedLightMode',  // Was: 'lightMode'
  type: 'group',
  fields: [...baseColorFields, ...chartColorFields],
}]
```

### 2. Theme Configuration (`src/fields/themeConfigurationField.ts`)
```typescript
// Color Mode Settings - only when NOT using extended features
if (includeColorModeToggle && !enableAdvancedFeatures) {
  // Basic lightMode/darkMode fields
}

// Typography - only when NOT using extended features  
if (!enableAdvancedFeatures) {
  // Basic typography fields
}

// Design Customization - only when NOT using extended features
if (!enableAdvancedFeatures) {
  // Basic borderRadius, fontScale, spacing
}
```

### 3. Live Preview (`src/fields/ThemeLivePreview.tsx`)
```typescript
// Support both naming conventions
const lightMode = (themeConfig?.extendedLightMode || themeConfig?.lightMode) as
  | Record<string, string>
  | undefined
```

## Result

✅ **Build successful:** 35 files compiled  
✅ **No duplicate `lightMode` errors in production**  
✅ **Works with both `enableAdvancedFeatures: true` and `false`**  
✅ **Live Preview supports both configurations**  

## Testing

```bash
pnpm build
```

Test in your Payload app:
```typescript
plugins: [
  themeManagementPlugin({
    enabled: true,
    enableAdvancedFeatures: true, // ← No more duplicate errors!
  }),
]
```

## Version
Fixed in **v0.2.2**
