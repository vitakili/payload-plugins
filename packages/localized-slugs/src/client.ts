'use client'

import { useEffect } from 'react'
import { useSlugContext } from './providers'
import type { LocalizedSlugData, PageData } from './utils/slugUtils'
import { generateLocalizedSlugs } from './utils/slugUtils'

export interface ClientSlugHandlerProps {
  /** Either pass a pre-computed map of locale -> path, or the full page data */
  localizedSlugs?: Record<string, string> | null
  pageData?: PageData | null
  /** Optional fallback path when page data has no slugs */
  fallbackPath?: string
}

export const ClientSlugHandler = ({
  localizedSlugs,
  pageData,
  fallbackPath,
}: ClientSlugHandlerProps) => {
  const { dispatch } = useSlugContext()

  useEffect(() => {
    let slugsToDispatch: Record<string, string> | null = null

    if (pageData) {
      slugsToDispatch = generateLocalizedSlugs(pageData, fallbackPath)
    } else if (localizedSlugs && Object.keys(localizedSlugs).length > 0) {
      // localizedSlugs may be a map of locale -> string or locale -> { slug, fullPath }
      const cleaned: Record<string, string> = {}
      for (const [locale, val] of Object.entries(
        localizedSlugs as Record<string, string | LocalizedSlugData>,
      )) {
        if (!val) continue
        if (typeof val === 'string') {
          cleaned[locale] = val
        } else if (typeof val === 'object') {
          // prefer fullPath, otherwise slug
          cleaned[locale] = (val.fullPath ?? val.slug) as string
        }
      }

      if (Object.keys(cleaned).length > 0) {
        slugsToDispatch = cleaned
      }
    }

    if (slugsToDispatch && Object.keys(slugsToDispatch).length > 0) {
      dispatch({ type: 'SET_SLUGS', payload: slugsToDispatch })
    }
  }, [localizedSlugs, pageData, fallbackPath, dispatch])

  // This component only manages state and renders nothing
  return null
}

// Re-export helpers for client usage
export { generateLocalizedSlugs } from './utils/slugUtils'

// Note: Providers are exported separately via "./providers" in package.json
// Import them directly: import { SlugProvider, useSlugContext } from '@kilivi/payloadcms-localized-slugs/providers'
