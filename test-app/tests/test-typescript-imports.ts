// Test direct imports from source files
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
