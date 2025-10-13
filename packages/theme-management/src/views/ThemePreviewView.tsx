/**
 * Theme Preview View - Server Component
 * Custom admin view for live theme preview
 */

import { Gutter } from '@payloadcms/ui'
import React from 'react'
import { ThemeLivePreviewClient } from './ThemePreviewViewClient.js'

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
        <ThemeLivePreviewClient />
      </Gutter>
    </div>
  )
}
