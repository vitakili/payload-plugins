/**
 * Theme Preview View - Server Component
 * Custom admin view for live theme preview
 *
 * Uses ThemePreviewLoader which dynamically imports client components
 * This prevents CSS imports from breaking generate:importmap
 */

import { Gutter } from '@payloadcms/ui'
import React from 'react'
import { ThemePreviewLoader } from './ThemePreviewLoader.js'

export default async function ThemePreviewView() {
  return (
    <div className="payload-admin-view">
      <Gutter>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ marginBottom: '0.5rem' }}>🎨 Theme Preview</h1>
          <p style={{ color: 'var(--theme-elevation-500)', margin: 0 }}>
            Real-time preview of your theme configuration. Changes are reflected instantly as you
            edit theme settings.
          </p>
        </div>
        <ThemePreviewLoader />
      </Gutter>
    </div>
  )
}
