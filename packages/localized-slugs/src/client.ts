'use client'

import { useEffect } from 'react'
import { useSlugContext } from './providers/index'
import type { PageData } from './utils/slugUtils'
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
      slugsToDispatch = localizedSlugs as Record<string, string>
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
