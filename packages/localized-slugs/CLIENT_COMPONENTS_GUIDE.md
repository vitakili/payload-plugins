# Client Components Usage Guide

## Problem: Why can't we export client components from `src/index.ts`?

In Payload CMS plugins (and any Next.js/React Server Components library), you **cannot** have `"use client"` directive in your main entry point (`src/index.ts`) because:

1. **Server-side usage**: The main export is used in `payload.config.ts` which runs on the server
2. **Client-server boundary**: Mixing server and client exports in the same file breaks the React Server Components model
3. **Build issues**: TypeScript/bundlers can't properly separate server and client code if they're mixed

## ✅ Solution: Separate Entry Points

Following the pattern used by Payload CMS and other modern libraries, we use **separate export paths** in `package.json`:

```json
{
  "exports": {
    ".": {
      // Server-side exports (plugin, hooks, fields)
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    },
    "./client": {
      // Client-side exports (components, providers)
      "import": "./dist/client.js",
      "types": "./dist/client.d.ts"
    }
  }
}
```

## 📦 How to Use in Your Next.js App

### 1. Server-Side (Payload Config)

In your `payload.config.ts` or any server-side code:

```typescript
import { localizedSlugsPlugin } from '@kilivi/payloadcms-localized-slugs'

export default buildConfig({
  plugins: [
    localizedSlugsPlugin({
      enabled: true,
      locales: ['en', 'cs'],
      defaultLocale: 'en',
      collections: [
        {
          collection: 'posts',
          generateFromTitle: true,
        },
      ],
    }),
  ],
})
```

### 2. Client-Side (Next.js App)

In your Next.js app components (e.g., `app/layout.tsx` or pages):

```typescript
'use client'

import { SlugProvider } from '@kilivi/payloadcms-localized-slugs/providers'
import { ClientSlugHandler } from '@kilivi/payloadcms-localized-slugs/client'

export function RootLayout({ children }) {
  return (
    <html>
      <body>
        <SlugProvider>
          {children}
        </SlugProvider>
      </body>
    </html>
  )
}
```

### 3. Using the Client Components

#### A. In a Server Component (e.g., page that fetches data)

```typescript
// app/[locale]/posts/[slug]/page.tsx
import { ClientSlugHandler } from '@kilivi/payloadcms-localized-slugs/client'
import { getPayload } from 'payload'

export default async function PostPage({ params }) {
  const payload = await getPayload()

  const post = await payload.find({
    collection: 'posts',
    where: {
      slug: { equals: params.slug }
    }
  })

  return (
    <div>
      {/* Pass localized slugs to client component */}
      <ClientSlugHandler localizedSlugs={post.docs[0].localizedSlugs} />

      <h1>{post.docs[0].title}</h1>
      {/* ... rest of your content */}
    </div>
  )
}
```

#### B. Using the Hook in Client Components

```typescript
'use client'

import { useSlugContext } from '@kilivi/payloadcms-localized-slugs/client'
import Link from 'next/link'

export function LanguageSwitcher() {
  const { state } = useSlugContext()
  const { localizedSlugs } = state

  return (
    <div>
      {Object.entries(localizedSlugs).map(([locale, slug]) => (
        <Link key={locale} href={`/${locale}/${slug}`}>
          {locale.toUpperCase()}
        </Link>
      ))}
    </div>
  )
}
```

#### C. Using Utility Functions

```typescript
'use client'

import { generateSlugFromTitle, isValidSlug } from '@kilivi/payloadcms-localized-slugs/client'

export function SlugInput({ title }) {
  const [slug, setSlug] = useState('')

  const handleTitleChange = (newTitle: string) => {
    const generatedSlug = generateSlugFromTitle(newTitle)
    setSlug(generatedSlug)
  }

  const isValid = isValidSlug(slug)

  return (
    <div>
      <input
        type="text"
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
      />
      {!isValid && <span>Invalid slug format</span>}
    </div>
  )
}
```

## 🏗️ Architecture Pattern

This follows the **official Payload CMS pattern** and Next.js best practices:

```
src/
├── index.ts              # Server-side exports (NO "use client")
│   └── exports: plugin, hooks, fields
│
├── client.ts             # Client-side exports (re-exports from files with "use client")
│   └── exports: components, providers, utils
│
├── components/
│   └── ClientSlugHandler/
│       └── index.tsx     # HAS "use client" directive
│
└── providers/
    └── SlugContext.tsx   # HAS "use client" directive
```

## 📚 References

- [Payload CMS Component Pattern](https://payloadcms.com/docs/admin/components)
- [Next.js Client Components](https://nextjs.org/docs/app/building-your-application/rendering/client-components)
- [React Server Components](https://react.dev/reference/rsc/use-client)

## ✨ Key Takeaways

1. ✅ **DO** put `"use client"` in individual component files
2. ✅ **DO** create separate export paths for server/client code
3. ✅ **DO** re-export client components from `client.ts`
4. ❌ **DON'T** put `"use client"` in `index.ts`
5. ❌ **DON'T** mix server and client exports in the same file
6. ❌ **DON'T** try to import client components from the main package export
