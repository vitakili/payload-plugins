'use client'

import React, { useEffect, useRef } from 'react'
import type { GoogleFont } from '../../../app/api/google-fonts/route'
import { getTranslations } from '../../../translations.js'
import { getAdminLanguage } from '../../../utils/getAdminLanguage.js'

export type PreviewVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'body'
  | 'small'
  | 'chars'
  | 'weights'
  | 'card'
  | 'row'
  | 'name'

export interface FontPreviewProps {
  font: GoogleFont
  variant: PreviewVariant
  text?: string
  onLoad?: () => void
}

/**
 * FontPreview component with Shadow DOM isolation
 *
 * This component renders font previews in an isolated Shadow DOM
 * to prevent Payload CMS admin styles from affecting the preview.
 */
export const FontPreview: React.FC<FontPreviewProps> = ({ font, variant, text, onLoad }) => {
  const shadowHostRef = useRef<HTMLDivElement>(null)
  const shadowRootRef = useRef<ShadowRoot | null>(null)
  const fontLoadedRef = useRef(false)

  useEffect(() => {
    if (!shadowHostRef.current) return

    // Create Shadow DOM if not already created
    if (!shadowRootRef.current) {
      shadowRootRef.current = shadowHostRef.current.attachShadow({ mode: 'open' })
    }

    const shadowRoot = shadowRootRef.current

    // Get font weights
    const weights = font.variants.filter((v) => !v.includes('italic')).join(';')
    const fontFamily = font.family

    // Load font CSS
    const loadFont = async () => {
      if (fontLoadedRef.current) return

      try {
        // Create font face CSS
        const fontUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
          fontFamily,
        )}:wght@${weights}&display=swap`

        // Check if font is already loaded
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = fontUrl

        // Wait for font to load
        link.onload = () => {
          fontLoadedRef.current = true
          onLoad?.()
        }

        // Add link to shadow root
        shadowRoot.appendChild(link)
      } catch (error) {
        console.error('Error loading font:', error)
      }
    }

    loadFont()

    // Render preview based on variant
    const renderPreview = () => {
      const container = document.createElement('div')
      container.style.cssText = `
        font-family: '${fontFamily}', sans-serif;
        color: inherit;
        margin: 0;
        padding: 0;
      `

      let content: HTMLElement
      const t = getTranslations(getAdminLanguage())

      switch (variant) {
        case 'h1':
          content = document.createElement('h1')
          content.style.cssText = `
            font-size: 48px;
            font-weight: 700;
            line-height: 1.2;
            margin: 0;
          `
          content.textContent = text || font.family
          break

        case 'h2':
          content = document.createElement('h2')
          content.style.cssText = `
            font-size: 36px;
            font-weight: 600;
            line-height: 1.3;
            margin: 0;
          `
          content.textContent = text || font.family
          break

        case 'h3':
          content = document.createElement('h3')
          content.style.cssText = `
            font-size: 24px;
            font-weight: 500;
            line-height: 1.4;
            margin: 0;
          `
          content.textContent = text || font.family
          break

        case 'body':
          content = document.createElement('p')
          content.style.cssText = `
            font-size: 16px;
            font-weight: 400;
            line-height: 1.6;
            margin: 0;
          `
          content.textContent = text || font.family
          break

        case 'small':
          content = document.createElement('p')
          content.style.cssText = `
            font-size: 14px;
            font-weight: 400;
            line-height: 1.5;
            margin: 0;
          `
          content.textContent = text || font.family
          break

        case 'chars':
          content = document.createElement('div')
          content.style.cssText = `
            font-size: 18px;
            font-weight: 400;
            line-height: 1.5;
            margin: 0;
          `
          content.textContent = 'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz 0123456789'
          break

        case 'weights':
          content = document.createElement('div')
          content.style.cssText = `margin: 0;`
          const availableWeights = font.variants
            .filter((v) => !v.includes('italic'))
            .map((v) => parseInt(v))
            .filter((w) => !isNaN(w))
            .sort((a, b) => a - b)

          availableWeights.forEach((weight) => {
            const line = document.createElement('div')
            line.style.cssText = `
              font-size: 16px;
              font-weight: ${weight};
              line-height: 1.8;
              margin: 4px 0;
            `
            line.textContent = `${weight} - ${t.ui.sampleSentence}`
            content.appendChild(line)
          })
          break

        case 'card':
          content = document.createElement('div')
          content.style.cssText = `
            padding: 16px;
            background: var(--theme-bg, #ffffff);
            border: 1px solid var(--theme-border, #e5e7eb);
            border-radius: 8px;
            margin: 0;
          `
          const title = document.createElement('h3')
          title.style.cssText = `
            font-size: 20px;
            font-weight: 600;
            margin: 0 0 8px 0;
          `
          title.textContent = font.family
          const description = document.createElement('p')
          description.style.cssText = `
            font-size: 14px;
            font-weight: 400;
            line-height: 1.5;
            margin: 0;
            color: var(--theme-text-secondary, #6b7280); // visual only (no text change)
          `
          description.textContent = text || t.ui.sampleSentence
          content.appendChild(title)
          content.appendChild(description)
          break

        case 'row':
          content = document.createElement('div')
          content.style.cssText = `
            display: flex;
            align-items: center;
            gap: 16px;
            padding: 12px 16px;
            margin: 0;
          `
          const nameSpan = document.createElement('span')
          nameSpan.style.cssText = `
            font-size: 16px;
            font-weight: 500;
            min-width: 150px;
          `
          nameSpan.textContent = font.family
          const sampleSpan = document.createElement('span')
          sampleSpan.style.cssText = `
            font-size: 16px;
            font-weight: 400;
            flex: 1;
            opacity: 0.7;
          `
          sampleSpan.textContent = text || t.ui.sampleSentence
          content.appendChild(nameSpan)
          content.appendChild(sampleSpan)
          break

        case 'name':
        default:
          content = document.createElement('span')
          content.style.cssText = `
            font-size: 16px;
            font-weight: 500;
            margin: 0;
          `
          content.textContent = font.family
          break
      }

      container.appendChild(content)
      return container
    }

    // Clear previous content
    shadowRoot.innerHTML = ''

    // Render preview
    const preview = renderPreview()
    shadowRoot.appendChild(preview)

    // Cleanup
    return () => {
      if (shadowRoot) {
        shadowRoot.innerHTML = ''
      }
    }
  }, [font, variant, text, onLoad])

  return <div ref={shadowHostRef} style={{ width: '100%', minHeight: '20px' }} />
}
