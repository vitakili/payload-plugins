'use client'

import { Globe, Package } from 'lucide-react'
import type { UIFieldClientProps } from 'payload'
import React from 'react'
import { useThemeTranslations } from '../../../hooks/useThemeTranslations.js'

const PRE_IMPORTED_FONTS = [
  'Inter',
  'Nunito',
  'Montserrat',
  'Manrope',
  'Mulish',
  'Barlow',
  'Raleway',
  'Playfair Display',
]

const calloutStyle: React.CSSProperties = {
  background: 'var(--theme-elevation-50)',
  border: '1px solid var(--theme-elevation-150)',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '24px',
}

const calloutHeadingStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  margin: '0 0 8px 0',
  fontSize: '16px',
  fontWeight: 600,
}

const FontLoadingGuideField: React.FC<UIFieldClientProps> = () => {
  const t = useThemeTranslations().fontGuide

  return (
    <div style={{ padding: '24px', color: 'var(--theme-text)' }}>
      <h2 style={{ marginTop: 0, fontSize: '20px', fontWeight: 700 }}>{t.strategyTitle}</h2>

      <div style={calloutStyle}>
        <h3 style={calloutHeadingStyle}>
          <Package size={16} color="var(--theme-success-600)" aria-hidden />
          {t.preImportedTitle}
        </h3>
        <p style={{ margin: '0 0 12px 0', fontSize: '14px', lineHeight: '1.6' }}>
          {t.preImportedCopy}
        </p>
        <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px' }}>
          {PRE_IMPORTED_FONTS.map((font) => (
            <li key={font}>{font}</li>
          ))}
        </ul>
      </div>

      <div style={calloutStyle}>
        <h3 style={calloutHeadingStyle}>
          <Globe size={16} color="var(--theme-warning-600)" aria-hidden />
          {t.dynamicTitle}
        </h3>
        <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.6' }}>{t.dynamicCopy}</p>
      </div>

      <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>{t.exampleTitle}</h3>
      <pre
        style={{
          // Inverted elevation tokens: the code block contrasts with the page in both admin themes.
          background: 'var(--theme-elevation-900)',
          color: 'var(--theme-elevation-50)',
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
