'use client'

import { useEffect } from 'react'
import { useSlugContext } from '../providers'

export interface ClientSlugHandlerProps {
  localizedSlugs?: {
    [locale: string]: {
      slug?: string | null
      fullPath?: string | null
    }
  }
}

export const ClientSlugHandler = ({ localizedSlugs }: ClientSlugHandlerProps) => {
  const { dispatch } = useSlugContext()

  useEffect(() => {
    if (localizedSlugs && Object.keys(localizedSlugs).length > 0) {
      const slugsToDispatch: Record<string, string> = {}

      for (const [locale, slugData] of Object.entries(localizedSlugs)) {
        if (slugData) {
          // Prefer fullPath, otherwise use slug
          const slug = slugData.fullPath ?? slugData.slug
          if (slug) {
            slugsToDispatch[locale] = slug
          }
        }
      }

      if (Object.keys(slugsToDispatch).length > 0) {
        dispatch({ type: 'SET_SLUGS', payload: slugsToDispatch })
      }
    }
  }, [localizedSlugs, dispatch])

  // This component only manages state and renders nothing
  return null
}
