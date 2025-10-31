// Test direct imports from source files
import { localizedSlugsPlugin as PublishedLocalizedSlugsPlugin } from '@kilivi/payloadcms-localized-slugs'
// Test imports from published package
import { ClientSlugHandler as PublishedClientSlugHandler } from '@kilivi/payloadcms-localized-slugs/client'
import {
  SlugProvider as PublishedSlugProvider,
  useSlugContext as PublishedUseSlugContext,
} from '@kilivi/payloadcms-localized-slugs/client/react'
import { ClientSlugHandler } from '../../packages/localized-slugs/src/exports/client/index.ts'
import {
  SlugProvider,
  useSlugContext,
} from '../../packages/localized-slugs/src/exports/client/react.ts'
import { localizedSlugsPlugin } from '../../packages/localized-slugs/src/index.ts'

console.log('All direct imports successful!')
console.log('localizedSlugsPlugin:', typeof localizedSlugsPlugin)
console.log('ClientSlugHandler:', typeof ClientSlugHandler)
console.log('SlugProvider:', typeof SlugProvider)
console.log('useSlugContext:', typeof useSlugContext)

console.log('All published package imports successful!')
console.log('PublishedLocalizedSlugsPlugin:', typeof PublishedLocalizedSlugsPlugin)
console.log('PublishedClientSlugHandler:', typeof PublishedClientSlugHandler)
console.log('PublishedSlugProvider:', typeof PublishedSlugProvider)
console.log('PublishedUseSlugContext:', typeof PublishedUseSlugContext)
