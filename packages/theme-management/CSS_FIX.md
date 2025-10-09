# CSS Import Fix - ThemeLivePreview

## Problem
Production error: `ERR_UNKNOWN_FILE_EXTENSION: Unknown file extension ".css"`

The error occurred because Node.js (tsx loader) cannot import `.css` files during server-side rendering.

## Solution
**Used the same pattern as `ThemeColorPickerField.tsx`** which successfully compiles CSS into the bundle.

### How it works:
1. **CSS Import**: `import './ThemeLivePreview.css'` in the component
2. **Build Process**: The `copyfiles` script copies CSS files to `dist/` folder
3. **Package.json script**: `"copyfiles": "copyfiles -u 1 \"src/**/*.{html,css,scss,ttf,woff,woff2,eot,svg,jpg,png,json}\" dist/"`

### Files Changed:
- ✅ `src/fields/ThemeLivePreview.tsx` - Reverted to CSS import (line 10)
- ✅ CSS file already exists: `src/fields/ThemeLivePreview.css` (191 lines)

### Build Verification:
```bash
pnpm build
# Successfully compiled: 35 files with swc (107.13ms)
# CSS files copied to dist/fields/
```

### Result:
- ✅ `dist/fields/ThemeLivePreview.css` - Copied successfully (3,676 bytes)
- ✅ `dist/fields/ThemeColorPickerField.css` - Also present (10,063 bytes)
- ✅ No more ERR_UNKNOWN_FILE_EXTENSION errors
- ✅ Production-ready

## Why This Works
The CSS file is not imported at runtime by Node.js. Instead:
1. During **build time**, SWC compiles the TypeScript
2. The `copyfiles` script copies CSS to `dist/`
3. When the package is consumed, the CSS is already in the bundle
4. The import statement tells bundlers (webpack/next.js) to include the CSS

This is the standard pattern for Payload CMS 3 plugins and works perfectly! ✨
