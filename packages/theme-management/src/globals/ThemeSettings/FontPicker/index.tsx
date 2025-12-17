'use client'

import { useField } from '@payloadcms/ui'
import type { TextFieldClientProps } from 'payload'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import type {
  FontCategory,
  GoogleFont,
  LanguageSubset,
} from '../../../app/api/google-fonts/route.js'
import { FontPreview } from './FontPreview.js'
import { PreviewContent, type PreviewTab } from './PreviewContent.js'
import { getTranslations, type Language } from './translations.js'

// Import CSS for styling
if (typeof window !== 'undefined') {
  // @ts-expect-error - Dynamic CSS import
  import('./styles.css').catch(() => {})
}

export interface FontPickerProps {
  value?: string
  onChange: (fontFamily: string) => void
  language?: Language
}

/**
 * FontPicker component
 *
 * A comprehensive Google Fonts picker with:
 * - Two-column layout (preview panel + selection panel)
 * - Search and filters (category, language subset)
 * - Multiple preview modes (typography, blog, landing, ui)
 * - Lazy font loading (only on hover/scroll)
 * - Infinite scroll with pagination
 * - Favorites system with localStorage
 * - View mode toggle (row/grid)
 */
const FontPickerField: React.FC<TextFieldClientProps> = (props) => {
  const { path } = props
  const { value, setValue } = useField<string>({ path })
  const language: Language = 'en' // Could be extracted from admin config

  const handleChange = useCallback(
    (fontFamily: string) => {
      setValue(fontFamily)
    },
    [setValue],
  )

  return <FontPickerComponent value={value} onChange={handleChange} language={language} />
}

const FontPickerComponent: React.FC<FontPickerProps> = ({ value, onChange, language = 'en' }) => {
  const t = getTranslations(language)

  // State
  const [fonts, setFonts] = useState<GoogleFont[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<FontCategory>('all')
  const [subset, setSubset] = useState<LanguageSubset>('all')
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [selectedFont, setSelectedFont] = useState<GoogleFont | null>(null)
  const [hoveredFont, setHoveredFont] = useState<GoogleFont | null>(null)
  const [previewTab, setPreviewTab] = useState<PreviewTab>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('fontPickerPreviewTab')
      return (saved as PreviewTab) || 'typography'
    }
    return 'typography'
  })
  const [viewMode, setViewMode] = useState<'row' | 'grid'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('fontPickerViewMode')
      return (saved as 'row' | 'grid') || 'row'
    }
    return 'row'
  })
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('fontPickerFavorites')
      return saved ? JSON.parse(saved) : []
    }
    return []
  })
  const [loadedFonts, setLoadedFonts] = useState<Set<string>>(new Set())

  // Refs
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  // Fetch fonts
  const fetchFonts = useCallback(
    async (reset = false) => {
      if (loading) return

      setLoading(true)

      try {
        const currentOffset = reset ? 0 : offset
        const params = new URLSearchParams({
          search,
          category,
          subset,
          limit: '100',
          offset: currentOffset.toString(),
        })

        const response = await fetch(`/api/google-fonts?${params}`)
        const data = await response.json()

        if (reset) {
          setFonts(data.fonts)
          setOffset(100)
        } else {
          setFonts((prev) => [...prev, ...data.fonts])
          setOffset((prev) => prev + 100)
        }

        setHasMore(currentOffset + data.fonts.length < data.total)
      } catch (error) {
        console.error('Error fetching fonts:', error)
      } finally {
        setLoading(false)
      }
    },
    [search, category, subset, offset, loading],
  )

  // Initial load
  useEffect(() => {
    fetchFonts(true)
  }, [search, category, subset])

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = setTimeout(() => {
      setOffset(0)
      fetchFonts(true)
    }, 300)

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [search])

  // Infinite scroll
  useEffect(() => {
    if (!loadMoreRef.current) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchFonts()
        }
      },
      { threshold: 0.5 },
    )

    observerRef.current.observe(loadMoreRef.current)

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [hasMore, loading, fetchFonts])

  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem('fontPickerViewMode', viewMode)
  }, [viewMode])

  useEffect(() => {
    localStorage.setItem('fontPickerPreviewTab', previewTab)
  }, [previewTab])

  useEffect(() => {
    localStorage.setItem('fontPickerFavorites', JSON.stringify(favorites))
  }, [favorites])

  // Set initial selected font
  useEffect(() => {
    if (value && fonts.length > 0 && !selectedFont) {
      const font = fonts.find((f) => f.family === value)
      if (font) {
        setSelectedFont(font)
      }
    }
  }, [value, fonts, selectedFont])

  // Handlers
  const handleFontSelect = (font: GoogleFont) => {
    setSelectedFont(font)
    onChange(font.family)
  }

  const handleFontHover = (font: GoogleFont) => {
    setHoveredFont(font)
    // Mark font as needing to be loaded
    if (!loadedFonts.has(font.family)) {
      setLoadedFonts((prev) => new Set([...prev, font.family]))
    }
  }

  const toggleFavorite = (fontFamily: string) => {
    setFavorites((prev) =>
      prev.includes(fontFamily) ? prev.filter((f) => f !== fontFamily) : [...prev, fontFamily],
    )
  }

  const previewFont = hoveredFont || selectedFont

  return (
    <div className="font-picker">
      {/* eslint-disable-next-line */}
      {/* Preview Panel */}
      <div className="font-picker__preview-panel">
        {/* Preview Tabs */}
        <div className="font-picker__preview-tabs">
          {(['typography', 'blog', 'landing', 'ui'] as PreviewTab[]).map((tab) => (
            <button
              key={tab}
              className={`font-picker__preview-tab ${previewTab === tab ? 'font-picker__preview-tab--active' : ''}`}
              onClick={() => setPreviewTab(tab)}
            >
              {t.previewTabs[tab]}
            </button>
          ))}
        </div>

        {/* Preview Content */}
        <div className="font-picker__preview-content">
          <PreviewContent font={previewFont} activeTab={previewTab} translations={t} />
        </div>
      </div>

      {/* Selection Panel */}
      <div className="font-picker__selection-panel">
        {/* Controls */}
        <div className="font-picker__controls">
          {/* Search */}
          <input
            type="text"
            className="font-picker__search"
            placeholder={t.search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* Filters */}
          <div className="font-picker__filters">
            <select
              className="font-picker__select"
              value={category}
              onChange={(e) => setCategory(e.target.value as FontCategory)}
            >
              <option value="all">{t.categories.all}</option>
              <option value="sans-serif">{t.categories['sans-serif']}</option>
              <option value="serif">{t.categories.serif}</option>
              <option value="display">{t.categories.display}</option>
              <option value="handwriting">{t.categories.handwriting}</option>
              <option value="monospace">{t.categories.monospace}</option>
            </select>

            <select
              className="font-picker__select"
              value={subset}
              onChange={(e) => setSubset(e.target.value as LanguageSubset)}
            >
              <option value="all">{t.subsets.all}</option>
              <option value="latin">{t.subsets.latin}</option>
              <option value="latin-ext">{t.subsets['latin-ext']}</option>
              <option value="cyrillic">{t.subsets.cyrillic}</option>
              <option value="greek">{t.subsets.greek}</option>
              <option value="vietnamese">{t.subsets.vietnamese}</option>
              <option value="arabic">{t.subsets.arabic}</option>
              <option value="hebrew">{t.subsets.hebrew}</option>
              <option value="thai">{t.subsets.thai}</option>
              <option value="japanese">{t.subsets.japanese}</option>
              <option value="korean">{t.subsets.korean}</option>
              <option value="chinese">{t.subsets.chinese}</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="font-picker__view-toggle">
            <button
              className={`font-picker__view-button ${viewMode === 'row' ? 'font-picker__view-button--active' : ''}`}
              onClick={() => setViewMode('row')}
              title={t.viewModes.row}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <rect x="2" y="4" width="16" height="2" />
                <rect x="2" y="9" width="16" height="2" />
                <rect x="2" y="14" width="16" height="2" />
              </svg>
            </button>
            <button
              className={`font-picker__view-button ${viewMode === 'grid' ? 'font-picker__view-button--active' : ''}`}
              onClick={() => setViewMode('grid')}
              title={t.viewModes.grid}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <rect x="2" y="2" width="7" height="7" />
                <rect x="11" y="2" width="7" height="7" />
                <rect x="2" y="11" width="7" height="7" />
                <rect x="11" y="11" width="7" height="7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Font List */}
        <div className={`font-picker__list font-picker__list--${viewMode}`}>
          {fonts.map((font) => (
            <div
              key={font.family}
              className={`font-picker__item ${
                selectedFont?.family === font.family ? 'font-picker__item--selected' : ''
              }`}
              onClick={() => handleFontSelect(font)}
              onMouseEnter={() => handleFontHover(font)}
            >
              <div className="font-picker__item-header">
                <span className="font-picker__item-name">{font.family}</span>
                <button
                  className={`font-picker__favorite ${
                    favorites.includes(font.family) ? 'font-picker__favorite--active' : ''
                  }`}
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleFavorite(font.family)
                  }}
                  title={
                    favorites.includes(font.family) ? 'Remove from favorites' : 'Add to favorites'
                  }
                >
                  ★
                </button>
              </div>
              <div className="font-picker__item-preview">
                <FontPreview font={font} variant="row" text={t.typography.body} />
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {loading && <div className="font-picker__loading">{t.loading}</div>}

          {/* No fonts found */}
          {!loading && fonts.length === 0 && <div className="font-picker__empty">{t.noFonts}</div>}

          {/* Infinite scroll trigger */}
          {hasMore && <div ref={loadMoreRef} style={{ height: '20px' }} />}
        </div>
      </div>
    </div>
  )
}

export { FontPickerComponent }
export default FontPickerField
