'use client'

import { useEffect } from 'react'
import { useSlugContext } from './providers/index.jsx'

export interface ClientSlugHandlerProps {
  localizedSlugs: Record<string, string>
}

export const ClientSlugHandler = ({ localizedSlugs }: ClientSlugHandlerProps) => {
  const { dispatch } = useSlugContext()

  useEffect(() => {
    if (localizedSlugs && Object.keys(localizedSlugs).length > 0) {
      dispatch({ type: 'SET_SLUGS', payload: localizedSlugs })
    }
  }, [localizedSlugs, dispatch])

  // This component only manages state and renders nothing
  return null
}
