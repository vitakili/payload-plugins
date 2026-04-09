# Dynamic Theme CSS Generation

## 🎯 Overview

All **28 themes** now support **dynamic CSS generation** - no need for separate CSS files! The system automatically generates complete theme CSS including:

- ✅ Typography settings
- ✅ Layout variables
- ✅ Border radius
- ✅ Component styles
- ✅ Light mode colors (19 tokens)
- ✅ Dark mode colors (19 tokens)
- ✅ Status colors (success, warning, error, info)

---

## 📦 How It Works

### 1. Theme Presets (HEX colors)

```typescript
// src/extended-themes.ts
export const extendedThemes: ThemePreset[] = [
  {
    name: 'blue',
    label: 'Blue',
    borderRadius: 'large',
    lightMode: {
      background: '#ffffff',
      primary: '#3b82f6',
      // ... 17 more tokens in HEX
    },
    darkMode: {
      background: '#0a0a0a',
      primary: '#60a5fa',
      // ... 17 more tokens in HEX
    },
  },
]
```

### 2. CSS Generator (HEX → HSL)

```typescript
// src/utils/generateThemeCSS.ts
export function generateThemeCSS(preset: ThemePreset): string {
  // Converts HEX colors to HSL
  // Generates complete CSS with all variables
  // Returns ~135 lines of CSS per theme
}
```

### 3. Dynamic Theme Config

```typescript
// src/providers/Theme/themeConfig.ts
export const themeConfigs: Record<ThemeDefaults, ThemeConfig> = {
  blue: {
    name: 'blue',
    label: 'Blue',
    borderRadius: 'large',
    dynamicCSS: true, // ← Enables dynamic generation
    preview: {
      /* HSL colors for preview */
    },
  },
}
```

---

## 🚀 Usage

### Get CSS for One Theme

```typescript
import { getThemeDynamicCSS } from '@kilivi-dev/payloadcms-theme-management'

const css = getThemeDynamicCSS('blue')
// Returns ~135 lines of CSS
```

### Get CSS for All Themes

```typescript
import { getAllDynamicThemesCSS } from '@kilivi-dev/payloadcms-theme-management'

const allCSS = getAllDynamicThemesCSS()
// Returns CSS for all 28 themes (~3780 lines total)
```

### Generate Custom Theme CSS

```typescript
import { generatePresetCSS } from '@kilivi-dev/payloadcms-theme-management'
import type { ThemePreset } from '@kilivi-dev/payloadcms-theme-management'

const customPreset: ThemePreset = {
  name: 'custom',
  label: 'My Custom Theme',
  borderRadius: 'large',
  lightMode: {
    /* 19 HEX colors */
  },
  darkMode: {
    /* 19 HEX colors */
  },
  preview: {
    colors: {
      /* 3 HSL colors */
    },
  },
}

const css = generatePresetCSS(customPreset)
```

---

## 📋 Generated CSS Structure

Each theme generates **135 lines** of CSS:

```css
/* Theme Name */
[data-theme='theme-name'] {
  /* Typography (18 variables) */
  --typography-fontFamily: var(--font-geist-sans);
  --typography-headingFamily: var(--font-outfit);
  /* ... */

  /* Layout (12 variables) */
  --layout-containerWidth: 1440px;
  --layout-containerPadding: 1.5rem;
  /* ... */

  /* Radius (6 variables) */
  --radius-xs: 0.25rem;
  --radius-small: 0.5rem;
  /* ... */

  /* Components (15 variables) */
  --components-button-padding: 1rem 2.5rem;
  --components-card-shadow: ...;
  /* ... */

  /* Light Mode Colors (19 tokens in HSL) */
  --background: hsl(0, 0%, 100%);
  --foreground: hsl(0, 0%, 4%);
  --primary: var(--primary-custom, hsl(221, 83%, 53%));
  /* ... */

  /* Status Colors (8 variables) */
  --success: hsl(120, 60%, 40%);
  --warning: hsl(42, 85%, 55%);
  /* ... */
}

/* Theme Name - Dark Mode */
[data-theme='theme-name'][data-theme-mode='dark'] {
  /* Dark Mode Colors (19 tokens in HSL) */
  --background: hsl(0, 0%, 4%);
  --foreground: hsl(0, 0%, 98%);
  --primary: var(--primary-custom, hsl(217, 91%, 60%));
  /* ... */

  /* Dark Mode Status Colors (8 variables) */
  --success: hsl(120, 60%, 50%);
  /* ... */

  /* Dark Mode Component Overrides */
  --components-card-shadow: ...;
  /* ... */
}
```

---

## 🎨 Color Conversion

### HEX → HSL

All colors are **stored in HEX** (presets) and **converted to HSL** (CSS):

```typescript
// Input (preset)
lightMode: {
  primary: '#3b82f6'  // HEX
}

// Output (CSS)
--primary: var(--primary-custom, hsl(221, 83%, 53%));  // HSL
```

### Why HSL?

- ✅ **color-mix()** support for hover states
- ✅ Better for **dynamic color manipulation**
- ✅ **CSS variable** friendly
- ✅ **Theme override** support (`var(--primary-custom, ...)`)

---

## 🔧 Custom Overrides

Users can override primary/accent colors:

```css
/* User's custom CSS */
:root {
  --primary-custom: hsl(200, 90%, 50%); /* Custom blue */
  --accent-custom: hsl(40, 85%, 55%); /* Custom gold */
}
```

This works because generated CSS uses:

```css
--primary: var(--primary-custom, hsl(221, 83%, 53%));
--accent: var(--accent-custom, hsl(0, 0%, 97%));
```

---

## 📊 Benefits

### Before (Static CSS Files)

❌ 28 separate CSS files to maintain  
❌ Manual updates for each theme  
❌ Inconsistent structure  
❌ Hard to add new themes  
❌ Large file size (duplicate code)

### After (Dynamic Generation)

✅ Single generator function  
✅ Automatic CSS from presets  
✅ 100% consistent structure  
✅ Add themes = add preset (no CSS file)  
✅ Smaller bundle (shared logic)

---

## 🎯 Theme Types

### Original 8 Themes (Static CSS)

Still use static CSS files for maximum customization:

- `cool` → `/themes/cool.css`
- `brutal` → `/themes/brutal.css`
- `neon` → `/themes/neon.css`
- `solar` → `/themes/solar.css`
- `dealership` → `/themes/dealership.css`
- `real-estate` → `/themes/real-estate.css`
- `real-estate-gold` → `/themes/real-estate-gold.css`
- `real-estate-neutral` → `/themes/real-estate-neutral.css`

### Extended 20 Themes (Dynamic CSS)

Use dynamic generation (`dynamicCSS: true`):

- Color themes: `blue`, `green`, `red`, `orange`, `rose`, `violet`
- Gray themes: `neutral`, `zinc`, `slate`, `stone`, `gray`
- Special themes: `cyberpunk`, `minimal`, `retro`, `pastel`, `ocean`, `forest`, `sunset`, `lavender`

---

## 📝 Example: Blue Theme

### Preset Definition

```typescript
{
  name: 'blue',
  label: 'Blue',
  borderRadius: 'large',
  preview: {
    colors: {
      primary: 'hsl(221, 83%, 53%)',
      background: 'hsl(0, 0%, 100%)',
      accent: 'hsl(0, 0%, 97%)'
    }
  },
  lightMode: {
    background: '#ffffff',
    foreground: '#0a0a0a',
    primary: '#3b82f6',
    // ... 16 more HEX colors
  },
  darkMode: {
    background: '#0a0a0a',
    foreground: '#fafafa',
    primary: '#60a5fa',
    // ... 16 more HEX colors
  }
}
```

### Generated CSS Output

```css
/* Blue Theme */
[data-theme='blue'] {
  --typography-fontFamily: var(--font-geist-sans);
  --layout-containerWidth: 1440px;
  --radius-large: 1.5rem;

  --background: hsl(0, 0%, 100%);
  --primary: var(--primary-custom, hsl(221, 83%, 53%));
  --primary-hover: color-mix(in hsl, var(--primary), black 10%);
  /* ... */
}

[data-theme='blue'][data-theme-mode='dark'] {
  --background: hsl(0, 0%, 4%);
  --primary: var(--primary-custom, hsl(217, 91%, 60%));
  /* ... */
}
```

---

## ✅ Summary

- **28 total themes**: 8 static + 20 dynamic
- **Dynamic generation**: No CSS files needed for extended themes
- **HEX → HSL conversion**: Automatic color space transformation
- **Full feature parity**: Dynamic themes = static themes (structure-wise)
- **Custom overrides**: Users can override primary/accent colors
- **Consistent structure**: All themes have identical CSS variable names
- **Easy to extend**: Add new theme = add preset object

**Result:** Theme management is now **100% data-driven!** 🎉
