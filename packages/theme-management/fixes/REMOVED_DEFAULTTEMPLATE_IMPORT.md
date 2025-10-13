# Fix: Removed Non-existent @payloadcms/next/templates Import

## Problem

```bash
$ pnpm install @payloadcms/next/templates
ERR_PNPM_SPEC_NOT_SUPPORTED_BY_ANY_RESOLVER  @payloadcms/next/templates isn't supported by any available resolver.
```

The `@payloadcms/next/templates` package doesn't exist as a separate installable package.

## Root Cause

The `DefaultTemplate` component was being imported from a non-existent package in `ThemePreviewView.tsx`:

```tsx
// ❌ WRONG: This package doesn't exist
import { DefaultTemplate } from '@payloadcms/next/templates'
```

## Solution ✅

Replaced the `DefaultTemplate` with a simple, self-contained server component:

### Before:

```tsx
'use server'

import { DefaultTemplate } from '@payloadcms/next/templates' // ❌ Non-existent
import { Gutter } from '@payloadcms/ui'

export default async function ThemePreviewView(props) {
  return (
    <DefaultTemplate {...props}>
      <Gutter>{/* content */}</Gutter>
    </DefaultTemplate>
  )
}
```

### After:

```tsx
import { Gutter } from '@payloadcms/ui' // ✅ Valid package
import type { AdminViewServerProps } from 'payload'
import React from 'react'

export default async function ThemePreviewView(_props: AdminViewServerProps) {
  return (
    <div className="payload-admin-view">
      <Gutter>{/* content */}</Gutter>
    </div>
  )
}
```

## Benefits

1. ✅ **No external dependencies** - Plugin remains self-contained
2. ✅ **Works with any Payload setup** - No Next.js specific imports
3. ✅ **Cleaner architecture** - Simple server component without template overhead
4. ✅ **Better compatibility** - Works across different Payload deployment scenarios

## Verification

- ✅ Build succeeds: `pnpm build`
- ✅ Tests pass: `pnpm test:vitest`
- ✅ No dependency bloat: Only `react-colorful` + `server-only`
- ✅ Documentation updated

The plugin is now fully self-contained and doesn't require any non-standard Payload packages.
