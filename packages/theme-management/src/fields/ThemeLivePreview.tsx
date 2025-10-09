'use client'

/**
 * Theme Live Preview Component
 * Real-time preview of theme configuration
 * Inspired by Payload CMS 3 Live Preview
 */

import { useFormFields } from '@payloadcms/ui'
import { useEffect, useState } from 'react'
import './ThemeLivePreview.css'

export const ThemeLivePreview = () => {
  const allFields = useFormFields(([fields]) => fields)
  const [previewMode, setPreviewMode] = useState<'light' | 'dark'>('light')

  const themeConfig = allFields?.themeConfiguration?.value as Record<string, any> | undefined

  // Extract colors from theme configuration
  const lightMode = themeConfig?.lightMode
  const darkMode = themeConfig?.darkMode
  const activeMode = previewMode === 'light' ? lightMode : darkMode

  // Apply theme colors to preview
  useEffect(() => {
    if (!activeMode) return

    const root = document.documentElement
    Object.entries(activeMode).forEach(([key, value]) => {
      if (typeof value === 'string') {
        root.style.setProperty(`--preview-${key}`, value)
      }
    })
  }, [activeMode])

  if (!themeConfig) {
    return (
      <div className="theme-live-preview-empty">
        <p>Configure your theme to see live preview</p>
      </div>
    )
  }

  return (
    <div className="theme-live-preview-container" data-mode={previewMode}>
      {/* Mode Toggle */}
      <div className="preview-header">
        <h3>Live Theme Preview</h3>
        <div className="mode-toggle">
          <button
            type="button"
            className={previewMode === 'light' ? 'active' : ''}
            onClick={() => setPreviewMode('light')}
          >
            ☀️ Light
          </button>
          <button
            type="button"
            className={previewMode === 'dark' ? 'active' : ''}
            onClick={() => setPreviewMode('dark')}
          >
            🌙 Dark
          </button>
        </div>
      </div>

      {/* Preview Content */}
      <div
        className="preview-content"
        style={{
          backgroundColor: activeMode?.background || '#ffffff',
          color: activeMode?.foreground || '#000000',
        }}
      >
        {/* Header Section */}
        <div className="preview-section">
          <h1 style={{ color: activeMode?.foreground }}>Welcome to Your Site</h1>
          <p style={{ color: activeMode?.mutedForeground }}>
            This is a live preview of your theme configuration
          </p>
        </div>

        {/* Card Section */}
        <div className="preview-cards">
          <div
            className="preview-card"
            style={{
              backgroundColor: activeMode?.card || '#ffffff',
              color: activeMode?.cardForeground || '#000000',
              borderColor: activeMode?.border || '#e2e8f0',
            }}
          >
            <h3>Featured Content</h3>
            <p style={{ color: activeMode?.mutedForeground }}>
              Card component with theme colors
            </p>
            <button
              className="preview-btn-primary"
              style={{
                backgroundColor: activeMode?.primary || '#0070f3',
                color: activeMode?.primaryForeground || '#ffffff',
              }}
            >
              Primary Action
            </button>
          </div>

          <div
            className="preview-card"
            style={{
              backgroundColor: activeMode?.card || '#ffffff',
              color: activeMode?.cardForeground || '#000000',
              borderColor: activeMode?.border || '#e2e8f0',
            }}
          >
            <h3>Secondary Card</h3>
            <p style={{ color: activeMode?.mutedForeground }}>
              Another card to showcase your theme
            </p>
            <button
              className="preview-btn-secondary"
              style={{
                backgroundColor: activeMode?.secondary || '#f1f5f9',
                color: activeMode?.secondaryForeground || '#0f172a',
              }}
            >
              Secondary
            </button>
          </div>
        </div>

        {/* UI Elements */}
        <div className="preview-ui-elements">
          <input
            type="text"
            placeholder="Input field"
            className="preview-input"
            style={{
              backgroundColor: activeMode?.background,
              color: activeMode?.foreground,
              borderColor: activeMode?.input || activeMode?.border,
            }}
          />

          <div
            className="preview-badge"
            style={{
              backgroundColor: activeMode?.accent || '#f1f5f9',
              color: activeMode?.accentForeground || '#0f172a',
            }}
          >
            Accent Badge
          </div>

          <button
            className="preview-btn-destructive"
            style={{
              backgroundColor: activeMode?.destructive || '#ef4444',
              color: activeMode?.destructiveForeground || '#ffffff',
            }}
          >
            Destructive
          </button>
        </div>

        {/* Muted Section */}
        <div
          className="preview-muted"
          style={{
            backgroundColor: activeMode?.muted || '#f1f5f9',
            color: activeMode?.mutedForeground || '#64748b',
          }}
        >
          <p>Muted background section for less prominent content</p>
        </div>
      </div>
    </div>
  )
}

export default ThemeLivePreview
