'use client'

import type { UIFieldClientProps } from 'payload'
import React from 'react'
import { useThemeTranslations } from '../../../hooks/useThemeTranslations.js'

const codeStyle: React.CSSProperties = {
  // Inverted elevation tokens: the code block contrasts with the page in both admin themes.
  background: 'var(--theme-elevation-900)',
  color: 'var(--theme-elevation-50)',
  padding: '12px',
  borderRadius: '6px',
  fontSize: '12px',
  marginTop: '8px',
  overflowX: 'auto',
}

const TypographyInfoField: React.FC<UIFieldClientProps> = () => {
  const t = useThemeTranslations().fontGuide

  return (
    <div
      style={{
        padding: '16px',
        background: 'var(--theme-elevation-50)',
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: '8px',
        marginTop: '16px',
        color: 'var(--theme-text)',
      }}
    >
      <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 600 }}>{t.usageTitle}</h3>
      <p style={{ margin: '0 0 12px 0', fontSize: '13px', lineHeight: '1.6' }}>{t.usageIntro}</p>
      <div style={{ marginBottom: '12px' }}>
        <strong style={{ fontSize: '13px' }}>{t.optionNextFont}</strong>
        <pre style={codeStyle}>
          {`import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

<html className={inter.variable}>
  <body className="font-primary">...</body>
</html>`}
        </pre>
      </div>
      <div>
        <strong style={{ fontSize: '13px' }}>{t.optionCssLink}</strong>
        <pre style={codeStyle}>
          {`<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" rel="stylesheet">`}
        </pre>
      </div>
    </div>
  )
}

export default TypographyInfoField
