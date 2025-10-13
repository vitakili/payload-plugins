# Server/Client CSS Import Best Practices

## The Problem

When Payload CMS runs server-side commands like `generate:importmap`, it loads component modules in a Node.js context. If any component imports CSS files directly, Node.js will fail with `ERR_UNKNOWN_FILE_EXTENSION` because it doesn't understand CSS syntax.

This happens because:

1. **Server commands run in Node.js** - No webpack/bundler to handle CSS
2. **Client components can be loaded server-side** - During import map generation
3. **CSS imports break Node.js ESM** - CSS files aren't valid JavaScript modules

## The Solution ✅

### 1. Always Use Client-Side CSS Loading

```tsx
'use client'

// ❌ BAD: Direct CSS import
// import './MyComponent.css'

// ✅ GOOD: Client-side only CSS loading
if (typeof window !== 'undefined') {
  import('./MyComponent.css').catch((err) => {
    console.warn('Failed to load CSS file:', err)
  })
}
```

### 2. Keep Server Files CSS-Free

```typescript
// ✅ Server-side files (index.ts, *Field.ts configs)
import type { Field } from 'payload'

export const myField: Field = {
  name: 'example',
  type: 'text',
  admin: {
    components: {
      // Component path reference - NO direct import
      Field: '@my-package/fields/MyClientComponent',
    },
  },
}
```

### 3. Proper Client Component Structure

```tsx
// ✅ Client component (MyClientComponent.tsx)
'use client'

import React from 'react'

// Safe CSS loading
if (typeof window !== 'undefined') {
  import('./MyClientComponent.css').catch(console.warn)
}

export default function MyClientComponent() {
  return <div>My component</div>
}
```

## Package Export Strategy

Ensure proper exports in `package.json`:

```json
{
  "exports": {
    "./fields/*": {
      "import": "./dist/fields/*.js",
      "types": "./dist/fields/*.d.ts"
    }
  }
}
```

## Why This Works

1. **Server-side**: Only field configurations are loaded, no CSS
2. **Client-side**: CSS loads dynamically when component renders in browser
3. **Build-time**: CSS is processed by bundler (webpack/turbopack)
4. **Runtime**: No Node.js CSS parsing errors

## Common Mistakes

### ❌ Barrel File with Mixed Imports

```typescript
// DON'T: server-utils.ts
export * from './ClientComponent' // Contains CSS import
export * from './serverFunction'
```

### ❌ Direct CSS in Server Code

```typescript
// DON'T: fieldConfig.ts
import './styles.css' // Breaks generate:importmap
export const field = { ... }
```

### ❌ Conditional CSS at Module Level

```typescript
// DON'T: Component.tsx
if (typeof window !== 'undefined') {
  import('./styles.css') // Still evaluated at module load
}
```

## Testing

To verify your setup works:

```bash
# This should NOT fail with CSS errors
pnpm payload generate:importmap
```

## Further Reading

- [Payload CSS Import Guidelines](https://github.com/payloadcms/payload/discussions/xxxx)
- [Next.js Client Components](https://nextjs.org/docs/app/building-your-application/rendering/client-components)
- [Node.js ES Modules](https://nodejs.org/api/esm.html)
