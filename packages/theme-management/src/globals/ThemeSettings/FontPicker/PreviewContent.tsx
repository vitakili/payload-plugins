'use client'

import React from 'react'
import type { GoogleFont } from '../../../app/api/google-fonts/route'
import { FontPreview } from './FontPreview'
import type { Translations } from './translations'

export type PreviewTab = 'typography' | 'blog' | 'landing' | 'ui'

export interface PreviewContentProps {
  font: GoogleFont | null
  activeTab: PreviewTab
  translations: Translations
}

/**
 * PreviewContent component
 *
 * Displays different preview modes for the selected font:
 * - Typography: Headers and body text with different weights
 * - Blog Post: Simulated blog post layout
 * - Landing Page: Hero section with CTA
 * - UI Elements: Buttons, inputs, and links
 */
export const PreviewContent: React.FC<PreviewContentProps> = ({
  font,
  activeTab,
  translations,
}) => {
  if (!font) {
    return (
      <div
        style={{
          padding: '40px',
          textAlign: 'center',
          color: 'var(--theme-elevation-400)',
        }}
      >
        {translations.selectFont}
      </div>
    )
  }

  const renderTypography = () => (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '32px' }}>
        <div
          style={{
            fontSize: '12px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--theme-elevation-500)',
            marginBottom: '8px',
          }}
        >
          {translations.typography.h1.split(' ')[0]} (H1)
        </div>
        <FontPreview font={font} variant="h1" text={translations.typography.h1} />
      </div>

      <div style={{ marginBottom: '32px' }}>
        <div
          style={{
            fontSize: '12px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--theme-elevation-500)',
            marginBottom: '8px',
          }}
        >
          {translations.typography.h2.split(' ')[0]} (H2)
        </div>
        <FontPreview font={font} variant="h2" text={translations.typography.h2} />
      </div>

      <div style={{ marginBottom: '32px' }}>
        <div
          style={{
            fontSize: '12px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--theme-elevation-500)',
            marginBottom: '8px',
          }}
        >
          {translations.typography.h3.split(' ')[0]} (H3)
        </div>
        <FontPreview font={font} variant="h3" text={translations.typography.h3} />
      </div>

      <div style={{ marginBottom: '32px' }}>
        <div
          style={{
            fontSize: '12px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--theme-elevation-500)',
            marginBottom: '8px',
          }}
        >
          Body
        </div>
        <FontPreview font={font} variant="body" text={translations.typography.body} />
      </div>

      <div style={{ marginBottom: '32px' }}>
        <div
          style={{
            fontSize: '12px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--theme-elevation-500)',
            marginBottom: '8px',
          }}
        >
          Small
        </div>
        <FontPreview font={font} variant="small" text={translations.typography.small} />
      </div>

      <div>
        <div
          style={{
            fontSize: '12px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--theme-elevation-500)',
            marginBottom: '8px',
          }}
        >
          Characters
        </div>
        <FontPreview font={font} variant="chars" />
      </div>
    </div>
  )

  const renderBlog = () => (
    <div style={{ padding: '24px', maxWidth: '700px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <FontPreview font={font} variant="h1" text={translations.blog.title} />
      </div>

      <div style={{ marginBottom: '24px', opacity: 0.7 }}>
        <FontPreview font={font} variant="h3" text={translations.blog.subtitle} />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <FontPreview font={font} variant="body" text={translations.blog.body} />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <FontPreview font={font} variant="body" text={translations.blog.body.split('.')[1] + '.'} />
      </div>
    </div>
  )

  const renderLanding = () => (
    <div
      style={{
        padding: '48px 24px',
        textAlign: 'center',
        background:
          'linear-gradient(135deg, var(--theme-elevation-50) 0%, var(--theme-elevation-100) 100%)',
        minHeight: '400px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '24px',
      }}
    >
      <div style={{ maxWidth: '800px' }}>
        <FontPreview font={font} variant="h1" text={translations.landing.hero} />
      </div>

      <div style={{ maxWidth: '600px', opacity: 0.8 }}>
        <FontPreview font={font} variant="h3" text={translations.landing.subheading} />
      </div>

      <div style={{ marginTop: '16px' }}>
        <div
          style={{
            display: 'inline-block',
            padding: '12px 32px',
            background: 'var(--theme-elevation-900)',
            color: 'var(--theme-elevation-0)',
            borderRadius: '8px',
            fontSize: '18px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <FontPreview font={font} variant="body" text={translations.landing.cta} />
        </div>
      </div>
    </div>
  )

  const renderUI = () => (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '32px' }}>
        <div
          style={{
            fontSize: '12px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--theme-elevation-500)',
            marginBottom: '12px',
          }}
        >
          Button
        </div>
        <div
          style={{
            display: 'inline-block',
            padding: '10px 24px',
            background: 'var(--theme-elevation-900)',
            color: 'var(--theme-elevation-0)',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          <FontPreview font={font} variant="body" text={translations.ui.button} />
        </div>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <div
          style={{
            fontSize: '12px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--theme-elevation-500)',
            marginBottom: '12px',
          }}
        >
          Input
        </div>
        <div
          style={{
            width: '100%',
            maxWidth: '400px',
            padding: '10px 16px',
            background: 'var(--theme-elevation-0)',
            border: '1px solid var(--theme-elevation-300)',
            borderRadius: '6px',
            fontSize: '16px',
          }}
        >
          <FontPreview font={font} variant="body" text={translations.ui.input} />
        </div>
      </div>

      <div>
        <div
          style={{
            fontSize: '12px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--theme-elevation-500)',
            marginBottom: '12px',
          }}
        >
          Link
        </div>
        <div
          style={{
            color: 'var(--theme-elevation-700)',
            fontSize: '16px',
            textDecoration: 'underline',
            cursor: 'pointer',
          }}
        >
          <FontPreview font={font} variant="body" text={translations.ui.link} />
        </div>
      </div>
    </div>
  )

  switch (activeTab) {
    case 'typography':
      return renderTypography()
    case 'blog':
      return renderBlog()
    case 'landing':
      return renderLanding()
    case 'ui':
      return renderUI()
    default:
      return null
  }
}
