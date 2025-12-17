'use client'

import type { UIFieldClientProps } from 'payload'
import React from 'react'

const FontLoadingGuideField: React.FC<UIFieldClientProps> = () => {
  return (
    <div style={{ padding: '24px' }}>
      <h2 style={{ marginTop: 0, fontSize: '20px', fontWeight: 700 }}>Font Loading Strategy</h2>

      <div
        style={{
          background: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '24px',
        }}
      >
        <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 600 }}>
          📦 Pre-imported Fonts (Optimized)
        </h3>
        <p style={{ margin: '0 0 12px 0', fontSize: '14px', lineHeight: '1.6' }}>
          These 8 popular fonts are pre-optimized via next/font/google for zero runtime loading:
        </p>
        <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px' }}>
          <li>Inter</li>
          <li>Nunito</li>
          <li>Montserrat</li>
          <li>Manrope</li>
          <li>Mulish</li>
          <li>Barlow</li>
          <li>Raleway</li>
          <li>Playfair Display</li>
        </ul>
      </div>

      <div
        style={{
          background: '#fef3c7',
          border: '1px solid #fde68a',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '24px',
        }}
      >
        <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 600 }}>
          🌐 Dynamic Fonts (Google Fonts CSS)
        </h3>
        <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.6' }}>
          Other fonts are loaded dynamically via Google Fonts CSS link. This provides access to
          1400+ fonts but requires runtime loading.
        </p>
      </div>

      <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>
        Implementation Example
      </h3>
      <pre
        style={{
          background: '#1f2937',
          color: '#f9fafb',
          padding: '16px',
          borderRadius: '8px',
          fontSize: '13px',
          overflowX: 'auto',
          lineHeight: '1.6',
        }}
      >
        {`// app/layout.tsx
import { Inter, Nunito, Montserrat } from 'next/font/google'
import { getThemeSettings } from '@/utilities/getThemeSettings'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const nunito = Nunito({ subsets: ['latin'], variable: '--font-nunito' })
const montserrat = Montserrat({ subsets: ['latin'], variable: '--font-montserrat' })

export default async function RootLayout({ children }) {
  const themeSettings = await getThemeSettings()
  const activeFont = themeSettings?.activeFont || 'Inter'
  
  const fontMap = {
    'Inter': inter.variable,
    'Nunito': nunito.variable,
    'Montserrat': montserrat.variable,
    // ... other pre-imported fonts
  }
  
  const selectedFontClass = fontMap[activeFont] || ''
  const isDynamicFont = !selectedFontClass
  
  return (
    <html className={selectedFontClass || ''} 
          style={isDynamicFont ? {
            '--font-primary': \`'\${activeFont}', sans-serif\`
          } : undefined}>
      <head>
        {isDynamicFont && (
          <>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
            <link 
              href={\`https://fonts.googleapis.com/css2?family=\${activeFont.replace(' ', '+')}:wght@300;400;500;600;700&display=swap\`}
              rel="stylesheet" 
            />
          </>
        )}
      </head>
      <body className="font-primary">{children}</body>
    </html>
  )
}

// CSS
.font-primary {
  font-family: var(--font-primary, 'Inter', sans-serif);
}`}
      </pre>
    </div>
  )
}

export default FontLoadingGuideField
