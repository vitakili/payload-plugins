'use client'

/**
 * Theme Preview Loader - Client Component
 * Dynamically loads the ThemeLivePreview component to avoid CSS issues during generate:importmap
 */
import React, { useEffect, useState } from 'react'

export function ThemePreviewLoader() {
  const [PreviewComponent, setPreviewComponent] = useState<React.ComponentType | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Dynamically import the preview component only in browser
    import('../fields/ThemeLivePreview.js')
      .then((mod) => {
        setPreviewComponent(() => mod.ThemeLivePreview)
      })
      .catch((err) => {
        console.error('Failed to load theme preview:', err)
        setError('Failed to load theme preview component')
      })
  }, [])

  if (error) {
    return (
      <div style={{ padding: '2rem', color: 'var(--theme-error)' }}>
        <p>{error}</p>
      </div>
    )
  }

  if (!PreviewComponent) {
    return (
      <div style={{ padding: '2rem' }}>
        <p>Loading theme preview...</p>
      </div>
    )
  }

  return <PreviewComponent />
}
