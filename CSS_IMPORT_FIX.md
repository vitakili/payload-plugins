# CSS Import Fix for Payload CMS Plugins

## Problem

When using the theme-management plugin in a Payload CMS application, running `payload generate:importmap` resulted in this error:

```
TypeError [ERR_UNKNOWN_FILE_EXTENSION]: Unknown file extension ".css" for
C:\payload\payload-builder\node_modules\.pnpm\@kilivi+payloadcms-theme-management\dist\fields\ThemeLivePreview.css
```

### Root Cause

Node.js cannot process CSS imports directly when it evaluates ES modules during the `generate:importmap` command. When Payload CMS generates the import map, it loads all component modules on the server side, including client components. Direct CSS imports like `import './styles.css'` fail because Node.js doesn't know how to handle `.css` files.

## Solution

We implemented the proven pattern from the [shefing/payload-tools](https://github.com/shefing/payload-tools) repository, which conditionally imports CSS only in browser environments:

### Implementation

```typescript
'use client'

import { useField } from '@payloadcms/ui'

// ... other imports

// Import CSS only in browser environment
// This prevents Node.js from trying to import CSS directly
// which causes ERR_UNKNOWN_FILE_EXTENSION error
if (typeof window !== 'undefined') {
  // @ts-expect-error - Dynamic import of CSS is not recognized by TypeScript
  import('./YourComponent.css').catch((err) => {
    console.warn('Failed to load CSS file:', err)
  })
}

export function YourComponent() {
  // Component code
}
```

### Key Points

1. **Runtime Check**: `typeof window !== 'undefined'` ensures CSS is only loaded in the browser
2. **Dynamic Import**: Uses `import()` which is asynchronous and won't block server-side rendering
3. **Error Handling**: `.catch()` prevents crashes if CSS loading fails
4. **TypeScript Suppression**: `@ts-expect-error` comment suppresses TypeScript errors for dynamic CSS imports
5. **Client Component**: The `'use client'` directive ensures this runs client-side

## Files Modified

- `packages/theme-management/src/fields/ThemeLivePreview.tsx`
- `packages/theme-management/src/fields/ThemeColorPickerField.tsx`

## Testing

After implementing this fix:

1. ✅ **Build**: `pnpm run build` - Compiles successfully
2. ✅ **TypeScript**: `pnpm exec tsc --noEmit` - No errors
3. ✅ **Lint**: `pnpm run lint` - Passes (only minor warnings)
4. ✅ **Tests**: Unit tests pass
5. ✅ **Package Install**: Can be installed and used in other Payload apps
6. ✅ **Import Map**: `payload generate:importmap` works without errors

## Alternative Approaches Considered

### ❌ Direct Static Import

```typescript
import './styles.css' // Fails in Node.js
```

**Problem**: Node.js can't process .css files during module evaluation.

### ❌ Conditional Static Import

```typescript
import './styles.css' // Syntax error - import must be top-level

if (typeof window !== 'undefined') {
}
```

**Problem**: Import statements must be at the top level in ES modules.

### ❌ Dynamic Import with await

```typescript
if (typeof window !== 'undefined') {
  await import('./styles.css') // Async issues in module scope
}
```

**Problem**: Can't use await at module top level without complications.

### ✅ Chosen Solution

```typescript
if (typeof window !== 'undefined') {
  import('./styles.css').catch((err) => {
    console.warn('Failed to load CSS file:', err)
  })
}
```

**Why**: Works reliably, proven in production (payload-tools), handles errors gracefully.

## Best Practices

When creating Payload CMS plugins with custom styling:

1. **Always use client-side CSS loading** for client components
2. **Copy CSS files to dist** using your build process (our `copyfiles` script)
3. **Include CSS files in package.json exports** if needed by consuming apps
4. **Document CSS loading pattern** for contributors
5. **Test with `payload generate:importmap`** before publishing

## References

- [shefing/payload-tools](https://github.com/shefing/payload-tools) - Reference implementation
- [Payload CMS Documentation](https://payloadcms.com/docs)
- [Node.js ES Modules](https://nodejs.org/api/esm.html)

## Credits

This solution is based on the proven pattern from the payload-tools repository maintained by @shefing.
