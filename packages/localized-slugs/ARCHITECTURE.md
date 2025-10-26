# Architecture Overview

## 📦 Package Structure

```
@kilivi/payloadcms-localized-slugs
│
├── Server Entry Point: ./dist/index.js
│   └── import { localizedSlugsPlugin } from '@kilivi/payloadcms-localized-slugs'
│       ├── Plugin configuration
│       ├── Server hooks
│       ├── Field definitions
│       └── Server utilities
│
└── Client Entry Point: ./dist/client.js
    └── import { ... } from '@kilivi/payloadcms-localized-slugs/client'
        ├── ClientSlugHandler (React component with "use client")
        ├── SlugProvider (React component with "use client")
        ├── useSlugContext (React hook with "use client")
        └── Client-safe utilities
```

## 🔄 Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    PAYLOAD CMS (Server-Side)                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  payload.config.ts                                              │
│  ┌────────────────────────────────────────┐                    │
│  │ import { localizedSlugsPlugin }        │                    │
│  │   from '@kilivi/payloadcms-localized-slugs'                 │
│  │                                        │                    │
│  │ plugins: [                             │                    │
│  │   localizedSlugsPlugin({               │                    │
│  │     locales: ['en', 'cs'],            │                    │
│  │     collections: [...]                 │                    │
│  │   })                                   │                    │
│  │ ]                                      │                    │
│  └────────────────────────────────────────┘                    │
│                      │                                          │
│                      ▼                                          │
│  ┌────────────────────────────────────────┐                    │
│  │   Collections with localized slugs     │                    │
│  │   { localizedSlugs: { en: '...', ... } }                    │
│  └────────────────────────────────────────┘                    │
│                      │                                          │
└──────────────────────┼──────────────────────────────────────────┘
                       │
                       │ API/GraphQL
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                   NEXT.JS APP (Client-Side)                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  app/layout.tsx (Root Provider)                                 │
│  ┌────────────────────────────────────────┐                    │
│  │ 'use client'                           │                    │
│  │ import { SlugProvider }                │                    │
│  │   from '@kilivi/payloadcms-localized-slugs/client'          │
│  │                                        │                    │
│  │ <SlugProvider>                         │                    │
│  │   {children}                           │                    │
│  │ </SlugProvider>                        │                    │
│  └────────────────────────────────────────┘                    │
│                      │                                          │
│                      ▼                                          │
│  app/[locale]/posts/[slug]/page.tsx (Server Component)         │
│  ┌────────────────────────────────────────┐                    │
│  │ import { ClientSlugHandler }           │                    │
│  │   from '@kilivi/payloadcms-localized-slugs/client'          │
│  │                                        │                    │
│  │ const post = await fetchFromPayload()  │                    │
│  │                                        │                    │
│  │ <ClientSlugHandler                     │                    │
│  │   localizedSlugs={post.localizedSlugs} │                    │
│  │ />                                     │                    │
│  └────────────────────────────────────────┘                    │
│                      │                                          │
│                      ▼                                          │
│  components/LanguageSwitcher.tsx (Client Component)            │
│  ┌────────────────────────────────────────┐                    │
│  │ 'use client'                           │                    │
│  │ import { useSlugContext }              │                    │
│  │   from '@kilivi/payloadcms-localized-slugs/client'          │
│  │                                        │                    │
│  │ const { state } = useSlugContext()     │                    │
│  │ const { localizedSlugs } = state       │                    │
│  │                                        │                    │
│  │ // Render language switcher links      │                    │
│  └────────────────────────────────────────┘                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## 🎯 Import Pattern Rules

### ❌ WRONG

```typescript
// DON'T: Import client components from main entry
import { ClientSlugHandler } from '@kilivi/payloadcms-localized-slugs'
// DON'T: Import plugin from client entry
import { localizedSlugsPlugin } from '@kilivi/payloadcms-localized-slugs/client'
```

### ✅ CORRECT

```typescript
// Server-side (Payload config)
import { localizedSlugsPlugin } from '@kilivi/payloadcms-localized-slugs'
// Client-side (Next.js app)
import {
  ClientSlugHandler,
  SlugProvider,
  useSlugContext,
} from '@kilivi/payloadcms-localized-slugs/client'
```

## 🧩 Component Relationships

```
SlugProvider (Context Provider)
    │
    ├─── Provides: state, dispatch
    │
    └─── Children can access via useSlugContext()
         │
         ├─── ClientSlugHandler
         │    └─── Updates context with localizedSlugs from server
         │
         └─── Your Components (e.g., LanguageSwitcher)
              └─── Reads localizedSlugs from context
```

## 🔑 Key Concepts

1. **Server Entry (`index.ts`)**:
   - NO "use client" directive
   - Used in `payload.config.ts`
   - Exports plugin, hooks, fields

2. **Client Entry (`client.ts`)**:
   - Re-exports from files WITH "use client"
   - Used in Next.js app components
   - Exports React components and hooks

3. **Context Pattern**:
   - `SlugProvider` wraps your app
   - `ClientSlugHandler` receives data from server, updates context
   - `useSlugContext` accesses data in any child component

4. **Type Safety**:
   - Full TypeScript support maintained
   - Types exported from both entries
   - Intellisense works correctly

## 📝 Example Flow

1. User creates post in Payload CMS
2. Plugin hook generates localized slugs: `{ en: "my-post", cs: "muj-prispevek" }`
3. Data saved to database
4. Next.js page fetches post data
5. Server component passes `localizedSlugs` to `ClientSlugHandler`
6. `ClientSlugHandler` updates context
7. `LanguageSwitcher` reads from context via `useSlugContext()`
8. User clicks language link and navigates to localized URL
