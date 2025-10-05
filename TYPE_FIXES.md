# Type Fixes Required

## Summary of Required Type Changes

### 1. payload-types.ts

**Current Issue**: `themeConfiguration` type is incomplete

**Required Properties**:
```typescript
export interface SiteThemeConfiguration {
  // Basic
  preset?: string
  radius?: string
  customCSS?: string
  
  // Theme Mode
  theme?: string | null
  colorMode?: 'light' | 'dark' | 'auto' | null
  allowColorModeToggle?: boolean | null
  
  // UI Settings
  borderRadius?: string | null
  fontScale?: string | null
  spacing?: string | null
  animationLevel?: 'none' | 'reduced' | 'normal' | 'enhanced' | null
  
  // Color Modes
  lightMode?: ThemeColorOverride | null
  darkMode?: ThemeColorOverride | null
  
  // Legacy (for backwards compatibility)
  colors?: ThemeColorOverride
  typography?: ThemeTypographyOverride
}
```

**Fix**:
```typescript
export interface ThemeTypographyOverride {
  bodyFont?: string | null
  headingFont?: string | null
  baseFontSize?: string | null  // ❌ NOT number
  lineHeight?: string | null     // ❌ NOT number
}
```

### 2. themeConfig.ts

**Current Issue**: `borderRadiusPresets` has inconsistent CSS type

**Current**:
```typescript
css: string | Record<string, string>  // ❌ Union type causes issues
```

**Fix**:
```typescript
export const borderRadiusPresets: Record<string, { 
  label: string
  css: Record<string, string>  // ✅ Always an object
}> = {
  none: {
    label: 'None',
    css: {
      '--radius-small': '0',
      '--radius-default': '0',
      '--radius-medium': '0',
      '--radius-large': '0',
      '--radius-xl': '0',
    },
  },
  // ... other presets
}
```

### 3. types.ts

**Current Issue**: `BorderRadiusPreset` type allows both string and Record

**Current**:
```typescript
export interface BorderRadiusPreset {
  label: string
  css: string | Record<string, string>  // ❌ Problematic union
}
```

**Fix**:
```typescript
export interface BorderRadiusPreset {
  label: string
  css: Record<string, string>  // ✅ Only object
}
```

### 4. Components Using CSS Variables

**Files**: `ThemePreviewField.tsx`, `RadiusField.tsx`, `themeUtils.ts`

**Current Issue**: Accessing CSS variables without type assertion

```typescript
borderRadiusPreset.css['--radius-large']  // ❌ Type error
```

**Fix Option 1** - Type assertion:
```typescript
const css = borderRadiusPreset.css as Record<string, string>
const largeRadius = css['--radius-large'] ?? '1rem'
```

**Fix Option 2** - Type guard:
```typescript
function isCSSObject(css: string | Record<string, string>): css is Record<string, string> {
  return typeof css === 'object'
}

if (isCSSObject(borderRadiusPreset.css)) {
  const largeRadius = borderRadiusPreset.css['--radius-large'] ?? '1rem'
}
```

**Fix Option 3** - Update type (recommended):
```typescript
// In themeConfig.ts
css: Record<string, string>  // Remove string option
```

### 5. resolveThemeConfiguration.ts

**Current Issues**: Multiple missing properties

**Required Changes**:

```typescript
// Line 34 - Update type reference
type ThemeColorConfiguration = NonNullable<SiteThemeConfiguration['lightMode']>

// Lines 109-118 - Ensure all properties exist in SiteThemeConfiguration type
return {
  theme,              // ✅ Add to type
  colorMode,          // ✅ Add to type
  allowColorModeToggle,  // ✅ Add to type
  borderRadius,       // ✅ Add to type
  fontScale,          // ✅ Add to type
  spacing,            // ✅ Add to type
  animationLevel,     // ✅ Add to type
  customCSS,          // ✅ Already exists
  lightMode,          // ✅ Add to type
  darkMode,           // ✅ Add to type
  // ...
}
```

### 6. themeUtils.ts

**Current Issues**: Accessing properties that don't exist on `ThemeConfiguration`

**Required Type Updates**:

```typescript
// Add these properties to ThemeConfiguration interface:
export interface ThemeConfiguration {
  // Existing...
  preset?: string
  
  // Add these:
  theme?: string | null
  colorMode?: 'light' | 'dark' | 'auto' | null
  borderRadius?: string | null
  fontScale?: string | null
  spacing?: string | null
  animationLevel?: 'none' | 'reduced' | 'normal' | 'enhanced' | null
  
  // Colors and typography...
  lightMode?: ThemeColorOverride | null
  darkMode?: ThemeColorOverride | null
}
```

### 7. typographyPreviewUtils.ts

**Current Issue**: Locale indexing on label

**Line 87**:
```typescript
return option.label?.[locale] ?? Object.values(option.label)[0] ?? option.value
```

**Fix**:
```typescript
// Option 1: Type assertion
return (option.label as Record<string, string>)?.[locale] ?? 
       Object.values(option.label)[0] ?? 
       option.value

// Option 2: Update TypographyOption interface
interface TypographyOption {
  value: string
  label: string | Record<string, string>  // Make explicit
}
```

### 8. ServerThemeInjector.tsx

**Current Issues**:
1. Line 27: Type mismatch in `resolveThemeConfiguration`
2. Line 49: Unknown property `theme` in `RuntimeThemeConfiguration`
3. Line 76: Possibly undefined `borderRadiusConfig`

**Fixes**:

```typescript
// Line 27 - Ensure types match
const resolvedConfiguration = resolveThemeConfiguration(
  siteSettings?.themeConfiguration as SiteThemeConfiguration
)

// Line 49 - Add theme to RuntimeThemeConfiguration
export interface RuntimeThemeConfiguration {
  theme?: string | null  // ✅ Add this
  colorMode?: 'light' | 'dark' | 'auto'
  // ... other properties
}

// Line 76 - Add null check
const borderRadiusCSS = borderRadiusConfig 
  ? Object.entries(borderRadiusConfig.css)
  : []
```

## Complete Fix Strategy

### Phase 1: Update Core Types
1. Update `payload-types.ts` with complete `SiteThemeConfiguration`
2. Update `types.ts` - Remove string option from `BorderRadiusPreset.css`
3. Update `themeConfig.ts` - Ensure all presets use `Record<string, string>`

### Phase 2: Fix Type Assertions
4. Add type guards or assertions in components
5. Add null checks where needed

### Phase 3: Update Interfaces
6. Extend `ThemeConfiguration` interface
7. Extend `RuntimeThemeConfiguration` interface

### Phase 4: Test
8. Run `pnpm build`
9. Fix any remaining errors
10. Test in actual Payload project

## Quick Fix Script

```bash
#!/bin/bash
# fix-types.sh

echo "🔧 Applying type fixes..."

# 1. Fix payload-types.ts
cat > packages/theme-management/src/payload-types.ts << 'EOF'
export interface ThemeColorOverride {
  primary?: string | null
  secondary?: string | null
  accent?: string | null
  // ... complete definition
}

export interface ThemeTypographyOverride {
  bodyFont?: string | null
  headingFont?: string | null
  baseFontSize?: string | null  // ✅ string, not number
  lineHeight?: string | null      // ✅ string, not number
}

export interface SiteThemeConfiguration {
  preset?: string
  theme?: string | null
  colorMode?: 'light' | 'dark' | 'auto' | null
  allowColorModeToggle?: boolean | null
  borderRadius?: string | null
  fontScale?: string | null
  spacing?: string | null
  animationLevel?: 'none' | 'reduced' | 'normal' | 'enhanced' | null
  customCSS?: string | null
  lightMode?: ThemeColorOverride | null
  darkMode?: ThemeColorOverride | null
  colors?: ThemeColorOverride
  typography?: ThemeTypographyOverride
  radius?: string
}

export interface SiteSetting {
  id: string
  themeConfiguration?: SiteThemeConfiguration
  updatedAt: string
  createdAt: string
}
EOF

echo "✅ Types fixed! Run 'pnpm build' to verify"
```

## Alternative: Minimal Working Version

If fixing all types is too complex, create a **minimal version** that builds:

```bash
# Move complex components to separate branch
git checkout -b feature/advanced-fields
git add -A
git commit -m "Advanced custom components"

# Go back to main
git checkout main

# Remove problematic files temporarily
rm -rf packages/theme-management/src/components/ServerThemeInjector.tsx
rm -rf packages/theme-management/src/fields/ThemePreviewField.tsx
rm -rf packages/theme-management/src/utils/resolveThemeConfiguration.ts

# Build should now succeed
pnpm build

# Test basic plugin
# Then add components back one by one
```

This approach lets you:
1. ✅ Test basic plugin functionality
2. ✅ Verify field routes work
3. ✅ Identify which components you actually need
4. ✅ Fix types incrementally for only needed components
