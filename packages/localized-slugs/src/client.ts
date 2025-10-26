/**
 * Client-side exports for the localized slugs plugin
 * Import from '@kilivi/payloadcms-localized-slugs/client' in your Next.js app
 */

// Client components
export { ClientSlugHandler } from './components/ClientSlugHandler'
export type { ClientSlugHandlerProps } from './components/ClientSlugHandler'

// Providers
export { SlugProvider, useSlugContext } from './providers/SlugContext.js'

// Re-export utility functions that can be used on the client
export { generateSlugFromTitle, isValidSlug } from './utils/slugUtils.js'
