'use client'

import type { UIFieldClientProps } from 'payload'
import React from 'react'

const TypographyInfoField: React.FC<UIFieldClientProps> = () => {
  return (
    <div
      style={{
        padding: '16px',
        background: '#f3f4f6',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        marginTop: '16px',
      }}
    >
      <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 600 }}>
        How to Use Selected Font
      </h3>
      <p style={{ margin: '0 0 12px 0', fontSize: '13px', lineHeight: '1.6' }}>
        After selecting a font, you need to load it in your frontend application. Here are the
        recommended approaches:
      </p>
      <div style={{ marginBottom: '12px' }}>
        <strong style={{ fontSize: '13px' }}>Option 1: next/font/google (Recommended)</strong>
        <pre
          style={{
            background: '#1f2937',
            color: '#f9fafb',
            padding: '12px',
            borderRadius: '6px',
            fontSize: '12px',
            marginTop: '8px',
            overflowX: 'auto',
          }}
        >
          {`import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

<html className={inter.variable}>
  <body className="font-primary">...</body>
</html>`}
        </pre>
      </div>
      <div>
        <strong style={{ fontSize: '13px' }}>Option 2: Google Fonts CSS Link</strong>
        <pre
          style={{
            background: '#1f2937',
            color: '#f9fafb',
            padding: '12px',
            borderRadius: '6px',
            fontSize: '12px',
            marginTop: '8px',
            overflowX: 'auto',
          }}
        >
          {`<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" rel="stylesheet">`}
        </pre>
      </div>
    </div>
  )
}

export default TypographyInfoField
