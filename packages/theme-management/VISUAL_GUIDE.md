# Visual Guide: Server/Client Import Separation

## 🎯 Quick Reference

```
Your Next.js App File: src/app/(app)/[tenant]/[locale]/layout.tsx
                                    ↓
                          Line 1 needs updating!
```

---

## 📦 Package Structure

```
@kilivi/payloadcms-theme-management
│
├─ 📄 Main Entry (.)                    ← Client-safe code
│  └─ dist/index.js
│     ├─ ✅ themeManagementPlugin
│     ├─ ✅ ThemeProvider
│     ├─ ✅ resolveThemeConfiguration
│     ├─ ✅ generateThemeColorsCss
│     ├─ ✅ fetchThemeConfiguration
│     └─ ❌ ServerThemeInjector (REMOVED!)
│
└─ 🔒 Server Entry (/server)            ← Server-only code
   └─ dist/server.js
      ├─ ✅ ServerThemeInjector
      ├─ ✅ getThemeCriticalCSS
      ├─ ✅ getThemeCSSPath
      └─ ✅ generateThemePreloadLinks
```

---

## 🔄 Import Migration Flow

### BEFORE (v0.1.8 and earlier) ❌

```typescript
┌─────────────────────────────────────────────────────────────┐
│ src/app/(app)/[tenant]/[locale]/layout.tsx                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  import {                                                   │
│    resolveThemeConfiguration,  ← ✅ Client-safe            │
│    ServerThemeInjector         ← ❌ Server-only (ERROR!)   │
│  } from '@kilivi/payloadcms-theme-management'              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                         ↓
              🚨 BUILD ERROR 🚨
        "Export doesn't exist"
```

### AFTER (v0.1.9+) ✅

```typescript
┌─────────────────────────────────────────────────────────────┐
│ src/app/(app)/[tenant]/[locale]/layout.tsx                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  import {                                                   │
│    resolveThemeConfiguration  ← ✅ From main entry         │
│  } from '@kilivi/payloadcms-theme-management'              │
│                                                             │
│  import {                                                   │
│    ServerThemeInjector        ← ✅ From /server entry      │
│  } from '@kilivi/payloadcms-theme-management/server'       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                         ↓
                  ✅ BUILD SUCCESS ✅
```

---

## 🎨 Code Diff

### Change Required

```diff
  // src/app/(app)/[tenant]/[locale]/layout.tsx

- import { resolveThemeConfiguration, ServerThemeInjector } from '@kilivi/payloadcms-theme-management'
+ import { resolveThemeConfiguration } from '@kilivi/payloadcms-theme-management'
+ import { ServerThemeInjector } from '@kilivi/payloadcms-theme-management/server'
  
  import { GeistMono } from 'geist/font/mono'
  import { GeistSans } from 'geist/font/sans'
  import React from 'react'
```

---

## 🗺️ Import Decision Tree

```
┌──────────────────────────────────────────┐
│  What are you trying to import?         │
└──────────┬───────────────────────────────┘
           │
           ├─► ServerThemeInjector
           │   getThemeCriticalCSS
           │   getThemeCSSPath
           │   generateThemePreloadLinks
           │   createFallbackCriticalCSS
           │        │
           │        ↓
           │   ┌─────────────────────────────────┐
           │   │ ⚠️  Server Components Only      │
           │   ├─────────────────────────────────┤
           │   │ import { ... } from             │
           │   │ '@kilivi/.../server'            │
           │   └─────────────────────────────────┘
           │
           ├─► themeManagementPlugin
           │   ThemeProvider
           │   resolveThemeConfiguration
           │   generateThemeColorsCss
           │   generateThemeCSS
           │   getThemeStyles
           │   fetchThemeConfiguration
           │        │
           │        ↓
           │   ┌─────────────────────────────────┐
           │   │ ✅ Use Anywhere                 │
           │   ├─────────────────────────────────┤
           │   │ import { ... } from             │
           │   │ '@kilivi/...'                   │
           │   └─────────────────────────────────┘
           │
           └─► ThemeColorPickerField
               ThemeTokenSelectField
               RadiusField
                    │
                    ↓
               ┌─────────────────────────────────┐
               │ ✅ Subpath Imports              │
               ├─────────────────────────────────┤
               │ import { ... } from             │
               │ '@kilivi/.../fields/...'        │
               └─────────────────────────────────┘
```

---

## 🎯 Your Specific Error

```
╔═══════════════════════════════════════════════════════════╗
║  Build Error                                              ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║  Export ServerThemeInjector doesn't exist in target      ║
║  module                                                   ║
║                                                           ║
║  ./src/app/(app)/[tenant]/[locale]/layout.tsx (1:1)      ║
║                                                           ║
║  > 1 | import { resolveThemeConfiguration,              ║
║         ServerThemeInjector } from                       ║
║         '@kilivi/payloadcms-theme-management'            ║
║       ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^         ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
                         ↓
              ┌────────────────────┐
              │   WHY THIS ERROR?  │
              └────────────────────┘
                         ↓
    ServerThemeInjector was REMOVED from main entry
    to prevent fs/promises bundling errors
                         ↓
              ┌────────────────────┐
              │   THE SOLUTION:    │
              └────────────────────┘
                         ↓
    Import it from /server entry instead!
```

---

## 📋 Quick Action Checklist

In your Next.js app (`src/app/(app)/[tenant]/[locale]/layout.tsx`):

```
Step 1: Open the file
  □ Navigate to: src/app/(app)/[tenant]/[locale]/layout.tsx
  
Step 2: Find line 1
  □ Current: import { resolveThemeConfiguration, ServerThemeInjector } 
             from '@kilivi/payloadcms-theme-management'

Step 3: Replace with:
  □ import { resolveThemeConfiguration } from '@kilivi/payloadcms-theme-management'
  □ import { ServerThemeInjector } from '@kilivi/payloadcms-theme-management/server'

Step 4: Save file
  □ Ctrl+S (or Cmd+S)

Step 5: Clear cache
  □ rm -rf .next

Step 6: Restart dev server
  □ pnpm dev

Step 7: Verify
  □ Build succeeds
  □ No errors in console
  □ Theme applies correctly
```

---

## 🎓 Understanding the Fix

### Why Split Imports?

```
┌───────────────────────────────────────────────────────┐
│  BEFORE: Everything in One Entry                     │
├───────────────────────────────────────────────────────┤
│                                                       │
│  Client Component imports main entry                 │
│         ↓                                             │
│  Next.js tries to bundle for browser                 │
│         ↓                                             │
│  Finds fs/promises (Node.js only)                    │
│         ↓                                             │
│  💥 ERROR: Can't resolve 'fs/promises'               │
│                                                       │
└───────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────┐
│  AFTER: Separated Entries                            │
├───────────────────────────────────────────────────────┤
│                                                       │
│  Client Component imports main entry                 │
│         ↓                                             │
│  Next.js bundles for browser                         │
│         ↓                                             │
│  ✅ Only client-safe code (no fs/promises)           │
│                                                       │
│  Server Component imports /server entry              │
│         ↓                                             │
│  Runs on server only (Node.js available)             │
│         ↓                                             │
│  ✅ fs/promises works fine                           │
│                                                       │
└───────────────────────────────────────────────────────┘
```

---

## 🔍 Verification

After making the change, you should see:

```
✅ Build Output:
   ○ Compiling /[tenant]/[locale] ...
   ✓ Compiled in 234ms

✅ Page Source (inspect in browser):
   <head>
     <style data-theme-critical>
       :root {
         --background: 0 0% 100%;
         --foreground: 222.2 84% 4.9%;
         ...
       }
     </style>
   </head>

✅ No Errors:
   - No "fs/promises" errors
   - No "Export doesn't exist" errors
   - No bundling errors
```

---

## 📞 Need More Help?

See detailed documentation:
- 📄 [QUICK_FIX.md](./QUICK_FIX.md) - Step-by-step fix
- 📄 [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) - Complete guide
- 📄 [FIX_INSTRUCTIONS.md](./FIX_INSTRUCTIONS.md) - Detailed instructions

---

**TL;DR:**
```typescript
import { ServerThemeInjector } from '@kilivi/payloadcms-theme-management/server'
```
✨ Change one import, fix everything! ✨
