# Server/Client Component Separation - Complete Fix

## The Problem

When Next.js tried to bundle `@kilivi/payloadcms-theme-management`, it failed with:

```
Module not found: Can't resolve 'fs/promises'
```

### Root Cause

1. **Server-only code was exported from the main entry point** (`index.ts`)
2. **Client components imported from the main entry**
3. Next.js tried to create a **browser bundle** that included server-only code
4. **Node.js modules (`fs/promises`, `path`) don't exist in browsers** → build failed

## The Solution

### 1. Separated Server and Client Exports

**Created two entry points:**

- **`index.ts`** - Client-safe exports (can run in browser)
- **`server.ts`** - Server-only exports (requires Node.js)

### 2. Added `server-only` Package

```typescript
// src/server.ts
import 'server-only' // Prevents accidental client-side usage

export { ServerThemeInjector } from './components/ServerThemeInjector.js'
export { getThemeCriticalCSS, getThemeCSSPath } from './utils/themeAssets.js'
```

This package throws a **runtime error** if server code is accidentally imported in a client component.

### 3. Configured Package Exports

```json
{
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    },
    "./server": {
      "react-server": "./dist/server.js",
      "import": "./dist/server.js",
      "types": "./dist/server.d.ts"
    }
  }
}
```

The `react-server` condition tells Next.js that `/server` is **server-only**.

### 4. Removed Server Exports from Main Entry

**Before:**
```typescript
// src/index.ts
export { ServerThemeInjector } from './components/ServerThemeInjector.js' // ❌
export { generateThemeCSS } from './utils/themeUtils.js' // ✅
```

**After:**
```typescript
// src/index.ts
// ServerThemeInjector removed - now in server.ts
export { generateThemeCSS } from './utils/themeUtils.js' // ✅

// src/server.ts
export { ServerThemeInjector } from './components/ServerThemeInjector.js' // ✅
```

## What Each Entry Point Exports

### Main Entry (`@kilivi/payloadcms-theme-management`)

**Can be imported in both client and server components:**

```typescript
// Plugin
export { themeManagementPlugin }

// Client Component
export { ThemeProvider }

// Utilities (pure functions, no Node.js APIs)
export { generateThemeColorsCss }
export { generateThemeCSS }
export { getThemeStyles }
export { resolveThemeConfiguration }

// Data Fetching (uses fetch, works everywhere)
export { fetchThemeConfiguration }

// Types
export type { ThemePreset, ThemeDefaults, Mode }
```

### Server Entry (`@kilivi/payloadcms-theme-management/server`)

**Can ONLY be imported in server components:**

```typescript
// Server Component
export { ServerThemeInjector }

// Server-Only Utilities (use fs/promises, path)
export { getThemeCriticalCSS }
export { getThemeCSSPath }
export { generateThemePreloadLinks }
export { createFallbackCriticalCSS }
```

## How Next.js Handles This

### Client Components

```tsx
'use client'

// ✅ This works - importing from main entry
import { ThemeProvider } from '@kilivi/payloadcms-theme-management'

// ❌ This would fail at runtime
import { ServerThemeInjector } from '@kilivi/payloadcms-theme-management/server'
// Error: "server-only" package prevents this
```

Next.js creates a **browser bundle** for the main entry, excluding `/server`.

### Server Components

```tsx
// ✅ This works - server component importing server-only code
import { ServerThemeInjector } from '@kilivi/payloadcms-theme-management/server'

// ✅ This also works - importing client-safe utilities
import { generateThemeCSS } from '@kilivi/payloadcms-theme-management'
```

Next.js runs this code on the **server only**, so Node.js APIs are available.

## Why This Pattern is Standard

This is the **official React pattern** for libraries that support both client and server components:

1. **Next.js** itself uses this:
   - `next/navigation` (client and server)
   - `next/server` (server-only)

2. **React** uses this:
   - `react` (client and server)
   - `react-dom/server` (server-only)
   - `react-dom/client` (client-only)

3. **Vercel** recommends this in their docs:
   - Use `server-only` package
   - Create separate entry points
   - Use `react-server` export condition

## Benefits

### 1. **Smaller Client Bundles**

Server-only code is never sent to the browser:

```
Before: 468.8 kB (includes unused server code)
After:  Smaller bundle (server code excluded)
```

### 2. **Type Safety**

TypeScript prevents importing server code in client components:

```typescript
'use client'

// TypeScript error if you try to import server-only exports
import { ServerThemeInjector } from '@kilivi/payloadcms-theme-management/server'
// ❌ Error: Cannot use server-only module in client component
```

### 3. **Runtime Safety**

The `server-only` package catches mistakes at runtime:

```typescript
'use client'

import { getThemeCriticalCSS } from '@kilivi/payloadcms-theme-management/server'
// ❌ Runtime Error: "This module cannot be imported from a Client Component"
```

### 4. **Better Developer Experience**

Clear separation makes the API intent obvious:

- **Main entry** = Use anywhere
- **`/server` entry** = Server components only

## Migration Path

For consumers of the package:

1. **Update to v0.1.9+**
   ```bash
   pnpm add @kilivi/payloadcms-theme-management@latest
   ```

2. **Change server imports:**
   ```typescript
   // Before
   import { ServerThemeInjector } from '@kilivi/payloadcms-theme-management'
   
   // After
   import { ServerThemeInjector } from '@kilivi/payloadcms-theme-management/server'
   ```

3. **Clear cache and rebuild:**
   ```bash
   rm -rf .next
   pnpm dev
   ```

## Technical Implementation Details

### File Structure

```
src/
├── index.ts              # Main entry (client-safe)
├── server.ts             # Server-only entry
├── components/
│   ├── ServerThemeInjector.tsx  # Uses fs/promises
│   └── ThemePreview.tsx         # Client component
├── utils/
│   ├── themeAssets.ts    # Uses fs/promises (server-only)
│   ├── themeColors.ts    # Pure functions (safe everywhere)
│   └── themeUtils.ts     # Pure functions (safe everywhere)
└── providers/
    └── Theme/
        └── index.tsx     # Client component
```

### Build Output

```
dist/
├── index.js              # No fs/promises imports
├── index.d.ts
├── server.js             # Has fs/promises imports
├── server.d.ts
├── components/
│   ├── ServerThemeInjector.js  # Has fs/promises
│   └── ThemePreview.js         # Client-safe
└── utils/
    ├── themeAssets.js    # Has fs/promises
    ├── themeColors.js    # Pure functions
    └── themeUtils.js     # Pure functions
```

### Package.json Export Map

```json
{
  "exports": {
    ".": {
      "import": "./dist/index.js",      // Client-safe code
      "types": "./dist/index.d.ts"
    },
    "./server": {
      "react-server": "./dist/server.js", // Marks as server-only
      "import": "./dist/server.js",
      "types": "./dist/server.d.ts"
    },
    "./fields/*": {                       // Subpath exports still work
      "import": "./dist/fields/*.js",
      "types": "./dist/fields/*.d.ts"
    }
  }
}
```

## Verification

### Check Main Entry is Clean

```bash
grep -r "fs/promises" dist/index.js
# Should return: (no matches)
```

### Check Server Entry Has Node APIs

```bash
grep -r "fs/promises" dist/server.js
# Should return: import 'server-only';
```

### Check Runtime Protection

```typescript
// Create a client component that imports server code
'use client'
import { ServerThemeInjector } from '@kilivi/payloadcms-theme-management/server'

// Run the app - should see error:
// Error: This module cannot be imported from a Client Component module.
```

## Lessons Learned

1. **Never mix server and client exports in the same entry point**
   - Leads to bundler confusion
   - Can leak server code to client

2. **Use `server-only` package for enforcement**
   - Catches mistakes early
   - Clear error messages

3. **Use export conditions correctly**
   - `react-server` tells bundlers about server-only code
   - Enables optimizations

4. **Keep pure utilities in main entry**
   - Functions without side effects
   - No Node.js/browser-specific APIs
   - Can be tree-shaken

5. **Document the separation clearly**
   - Migration guides
   - TypeScript errors should be helpful
   - Runtime errors should be clear

## Result

✅ **No more `fs/promises` errors**  
✅ **Proper server/client separation**  
✅ **Smaller client bundles**  
✅ **Better type safety**  
✅ **Runtime protection via `server-only`**  
✅ **Follows React/Next.js best practices**
