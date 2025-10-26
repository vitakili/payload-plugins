# Quick Reference: Client Components Import Pattern

## ❌ WRONG - Don't do this:

```typescript
// This will NOT work!
import { ClientSlugHandler } from '@kilivi/payloadcms-localized-slugs'
```

**Why?** The main export is for server-side use only (Payload config). It cannot contain client components.

## ✅ CORRECT - Do this instead:

### Server-Side (Payload Config)

```typescript
// payload.config.ts
import { localizedSlugsPlugin } from '@kilivi/payloadcms-localized-slugs'

export default buildConfig({
  plugins: [
    localizedSlugsPlugin({
      // ... config
    }),
  ],
})
```

### Client-Side (Next.js App)

```typescript
// app/components/MyComponent.tsx
'use client'

import {
  ClientSlugHandler,
  SlugProvider,
  useSlugContext,
} from '@kilivi/payloadcms-localized-slugs/client'
```

## 📦 Available Exports

### From `@kilivi/payloadcms-localized-slugs` (Server)

- `localizedSlugsPlugin` - The main plugin function
- `createLocalizedSlugField` - Field creator
- Utility functions for server-side use

### From `@kilivi/payloadcms-localized-slugs/client` (Client)

- `ClientSlugHandler` - Client component
- `SlugProvider` - Context provider
- `useSlugContext` - React hook
- `generateSlugFromTitle` - Utility function
- `isValidSlug` - Validation function

## 🎯 Common Use Cases

### 1. Wrap your app with the provider

```typescript
// app/layout.tsx
'use client'
import { SlugProvider } from '@kilivi/payloadcms-localized-slugs/client'

export default function Layout({ children }) {
  return <SlugProvider>{children}</SlugProvider>
}
```

### 2. Pass slugs from server to client

```typescript
// app/posts/[slug]/page.tsx (Server Component)
import { ClientSlugHandler } from '@kilivi/payloadcms-localized-slugs/client'

export default async function Page() {
  const post = await fetchPost()
  return <ClientSlugHandler localizedSlugs={post.localizedSlugs} />
}
```

### 3. Use slugs in client components

```typescript
// components/LanguageSwitcher.tsx (Client Component)
'use client'
import { useSlugContext } from '@kilivi/payloadcms-localized-slugs/client'

export function LanguageSwitcher() {
  const { state } = useSlugContext()
  return (
    <div>
      {Object.entries(state.localizedSlugs).map(([locale, slug]) => (
        <a key={locale} href={`/${locale}/${slug}`}>{locale}</a>
      ))}
    </div>
  )
}
```

## 🔍 Need More Details?

See [CLIENT_COMPONENTS_GUIDE.md](./CLIENT_COMPONENTS_GUIDE.md) for the complete guide.
