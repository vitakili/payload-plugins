# Fix v0.5.2.1 - CSS Variable Fallbacks & Alpha Channel Support

**Date:** October 14, 2025  
**Type:** Bug Fix  
**Impact:** TweakCN themes with CSS variables now convert correctly

---

## 🐛 Bugs Fixed

### 1. Blue to Violet Themes Were Identical

**Problem:** Témata Blue, Violet, Lime, Orange, Rose vypadala úplně stejně - všechny měly stejnou modrou barvu `#3b82f6`.

**Root Cause:** TweakCN témata používají CSS proměnné místo OKLCH:

```typescript
// V tweakcn-presets.ts
primary: 'var(--color-blue-600)' // ❌ Konvertor to nerozpoznal
ring: 'var(--color-blue-400)' // ❌ Vrátil fallback #3b82f6
```

**Solution:** Přidány fallback hodnoty pro běžné CSS proměnné:

```typescript
const colorVarFallbacks: Record<string, string> = {
  'var(--color-blue-600)': '#2563eb', // ✅ Správná modrá
  'var(--color-violet-600)': '#7c3aed', // ✅ Správná fialová
  'var(--color-lime-600)': '#65a30d', // ✅ Správná limetkově zelená
  'var(--color-orange-600)': '#ea580c', // ✅ Správná oranžová
  'var(--color-rose-600)': '#e11d48', // ✅ Správná růžová
  // ... celkem 80+ color variants (50, 100, ..., 900)
}
```

**Result:**

- Blue primary: `#2563eb` ✅ (modrá)
- Violet primary: `#7c3aed` ✅ (fialová)
- Lime primary: `#65a30d` ✅ (zelená)
- Orange primary: `#ea580c` ✅ (oranžová)
- Rose primary: `#e11d48` ✅ (červená)

---

### 2. OKLCH Alpha Channel Not Supported

**Problem:** Některá témata používají OKLCH s alpha kanálem:

```typescript
background: 'oklch(1 0 0 / 10%)' // ❌ Regex error
ring: 'oklch(0.5 0.2 180 / 15%)' // ❌ Invalid format
```

**Root Cause:** Regex očekával pouze `oklch(L C H)`, ne `oklch(L C H / A)`.

**Solution:** Aktualizován regex pro podporu alpha kanálu:

```typescript
// Before (BROKEN):
const match = color.match(/oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)\)/)

// After (WORKING):
const match = color.match(/oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*[\d.]+%?)?\)/)
//                                                       ^^^^^^^^^^^^^^^^^^^^^^^^^^
//                                                       Optional: / 10% or / 0.1
```

**Result:** OKLCH s alpha kanálem se nyní konvertuje správně (alpha hodnota se ignoruje, protože HEX nemá alpha).

---

## 📝 Changes Made

### Files Modified

#### 1. `src/utils/tweakcnConverter.ts`

**Added:**

- `colorVarFallbacks` object (80+ CSS variable mappings)
- CSS variable detection in `convertOklchColor()`
- Alpha channel support in OKLCH regex
- `hexToHsl()` helper for preview conversion from CSS variables
- Warning logs for missing fallbacks

**Updated Functions:**

- `convertOklchColor()`: Now handles `var(--color-X-Y)` and alpha channels
- `oklchToPreviewColor()`: Converts CSS variables to HSL for preview

**Color Palettes Added:**

- Blue (50-900)
- Violet (50-900)
- Green (50-900)
- Red (50-900)
- Yellow (50-900)
- **Lime (50-900)** ✅ NEW
- **Orange (50-900)** ✅ NEW
- **Rose (50-900)** ✅ NEW
- Zinc (50-900)

---

## 🧪 Testing

### Before Fix:

```javascript
Blue primary: #3b82f6    // ❌ Same as fallback
Violet primary: #3b82f6  // ❌ Same as fallback
Lime primary: #3b82f6    // ❌ Same as fallback
Orange primary: #3b82f6  // ❌ Same as fallback
Rose primary: #3b82f6    // ❌ Same as fallback

Warnings:
"No fallback found for CSS variable: var(--color-lime-600)"
"No fallback found for CSS variable: var(--color-orange-600)"
"Invalid OKLCH format: oklch(1 0 0 / 10%)"
```

### After Fix:

```javascript
Blue primary: #2563eb    // ✅ Distinct blue
Violet primary: #7c3aed  // ✅ Distinct violet
Lime primary: #65a30d    // ✅ Distinct lime green
Orange primary: #ea580c  // ✅ Distinct orange
Rose primary: #e11d48    // ✅ Distinct rose

No warnings! ✅
```

---

## 🎨 Visual Comparison

| Theme  | Before       | After           |
| ------ | ------------ | --------------- |
| Blue   | 🔵 `#3b82f6` | 🔵 `#2563eb` ✅ |
| Violet | 🔵 `#3b82f6` | 🟣 `#7c3aed` ✅ |
| Lime   | 🔵 `#3b82f6` | 🟢 `#65a30d` ✅ |
| Orange | 🔵 `#3b82f6` | 🟠 `#ea580c` ✅ |
| Rose   | 🔵 `#3b82f6` | 🔴 `#e11d48` ✅ |

---

## 📦 Build

```bash
pnpm build
# Successfully compiled: 33 files with swc (37.18ms)
```

---

## 🔍 Known Issues

### Validation Error (To Be Investigated)

User reports validation error when selecting TweakCN themes:

```json
{
  "errors": [
    {
      "name": "ValidationError",
      "path": "themeConfiguration.theme",
      "message": "Toto pole má neplatný výběr."
    }
  ]
}
```

**Status:** Under investigation
**Next Steps:**

1. Check browser console for errors
2. Verify theme name in select options
3. Check if theme preset is properly registered

---

## ✅ Verification

- [x] Blue/Violet/Lime/Orange/Rose now have distinct colors
- [x] CSS variables converted to HEX fallbacks
- [x] OKLCH with alpha channel supported
- [x] No conversion warnings
- [x] Build successful
- [ ] Validation error resolved (pending investigation)

---

**Status:** ✅ **Color conversion fixed, validation error being investigated**
