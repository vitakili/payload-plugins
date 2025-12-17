# Font Picker Feature Documentation

## Overview

Font Picker is a feature that allows administrators to select fonts from Google Fonts to apply across the entire website. This feature is integrated into the Payload CMS admin panel with an intuitive interface, supporting font previews in multiple contexts.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           PAYLOAD ADMIN                                  │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    ThemeSettings Global                          │   │
│  │  ┌──────────────────────────────────────────────────────────┐   │   │
│  │  │              FontPicker Component                         │   │   │
│  │  │  ┌────────────────┐    ┌───────────────────────────────┐ │   │   │
│  │  │  │  Preview Panel │    │     Selection Panel           │ │   │   │
│  │  │  │                │    │  ┌─────────────────────────┐  │ │   │   │
│  │  │  │  - Typography  │    │  │ Search + Filters        │  │ │   │   │
│  │  │  │  - Blog Post   │    │  │ - Category (6 types)    │  │ │   │   │
│  │  │  │  - Landing     │    │  │ - Language/Subset (14)  │  │ │   │   │
│  │  │  │  - UI Elements │    │  │ - Favorites             │  │ │   │   │
│  │  │  │                │    │  ├─────────────────────────┤  │ │   │   │
│  │  │  │  [Uses Shadow  │    │  │ Font List (Virtual)     │  │ │   │   │
│  │  │  │   DOM for      │    │  │ - Infinite scroll       │  │ │   │   │
│  │  │  │   isolation]   │    │  │ - Lazy font loading     │  │ │   │   │
│  │  │  └────────────────┘    │  └─────────────────────────┘  │ │   │   │
│  │  └──────────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────┬────────────────────────────┘
                                             │
                        ┌────────────────────▼────────────────────┐
                        │         /api/google-fonts               │
                        │  ┌────────────────────────────────────┐ │
                        │  │ - Fetch from Google Fonts API      │ │
                        │  │ - 24h memory cache                 │ │
                        │  │ - Fallback fonts list              │ │
                        │  │ - Search/Filter/Pagination         │ │
                        │  └────────────────────────────────────┘ │
                        └────────────────────────────────────────┘
                                             │
                        ┌────────────────────▼────────────────────┐
                        │         Google Fonts API                │
                        │  https://www.googleapis.com/webfonts    │
                        └─────────────────────────────────────────┘
```

## Components

### 1. FontPicker Component

**File:** `src/globals/ThemeSettings/FontPicker/index.tsx`

This is the main component, registered as a custom field component in Payload CMS.

#### State Management

```typescript
// Font data
const [fonts, setFonts] = useState<GoogleFont[]>([])
const [loading, setLoading] = useState(true)
const [hasMore, setHasMore] = useState(true)
const [offset, setOffset] = useState(0)
const [total, setTotal] = useState(0)

// Filters
const [searchQuery, setSearchQuery] = useState('')
const [selectedCategory, setSelectedCategory] = useState('all')
const [selectedSubset, setSelectedSubset] = useState('vietnamese')

// User preferences (localStorage)
const [favorites, setFavorites] = useState<Set<string>>(new Set())
const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
const [viewMode, setViewMode] = useState<'row' | 'grid'>('row')
const [previewTab, setPreviewTab] = useState<PreviewTab>('typography')

// Font loading tracking
const [loadedFontFamilies, setLoadedFontFamilies] = useState<Set<string>>(new Set())
```

#### Key Features

- **Two-column layout**: Preview on left, selection list on right
- **Multiple preview modes**: Typography, Blog Post, Landing Page, UI Elements
- **Lazy font loading**: Only loads fonts when hovered or scrolled into view
- **Infinite scroll**: Loads more fonts when scrolling
- **Favorites system**: Saves favorite fonts to localStorage
- **Debounced search**: Search with 300ms delay to reduce API calls

### 2. FontPreview Component

**File:** `src/globals/ThemeSettings/FontPicker/FontPreview.tsx`

Component that displays font preview using **Shadow DOM** for style isolation.

#### Why Shadow DOM?

Payload Admin uses `var(--font-body)` for all typography. Without isolation, Payload's CSS would override the selected font. Shadow DOM creates an isolated environment so font previews are not affected.

```typescript
useEffect(() => {
  // Create Shadow Root
  let shadow = hostRef.current.shadowRoot
  if (!shadow) {
    shadow = hostRef.current.attachShadow({ mode: 'open' })
  }

  // Load Google Font into Shadow DOM
  const fontLink = document.createElement('link')
  fontLink.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontFamily)}...`
  fontLink.rel = 'stylesheet'

  // Inject styles and content
  shadow.appendChild(fontLink)
  shadow.appendChild(style)
  shadow.appendChild(container)
}, [fontFamily, ...])
```

#### Preview Variants

| Variant          | Description                          |
| ---------------- | ------------------------------------ |
| `h1`, `h2`, `h3` | Headings with different font sizes   |
| `body`           | Paragraph text                       |
| `small`          | Caption/metadata                     |
| `chars`          | Character display (Vietnamese chars) |
| `weights`        | Display all font weights             |
| `card`           | Grid view card preview               |
| `row`            | List view row preview                |
| `name`           | Selected font name display           |

### 3. PreviewContent Component

**File:** `src/globals/ThemeSettings/FontPicker/PreviewContent.tsx`

Component that renders preview content for each tab (Typography, Blog, Landing, UI).

Also uses Shadow DOM for isolation and fetches colors from Payload theme variables:

```typescript
const getPayloadThemeColors = () => {
  const computedStyle = getComputedStyle(document.documentElement)
  return {
    textColor: computedStyle.getPropertyValue('--theme-text').trim(),
    textSecondary: computedStyle.getPropertyValue('--theme-elevation-800').trim(),
    // ...
  }
}
```

### 4. Translations

**File:** `src/globals/ThemeSettings/FontPicker/translations.ts`

Supports internationalization (English, Vietnamese) for all text in Font Picker.

## API Endpoint

### `/api/google-fonts`

**File:** `src/app/api/google-fonts/route.ts`

#### Request Parameters

| Param      | Type   | Default | Description                     |
| ---------- | ------ | ------- | ------------------------------- |
| `search`   | string | ''      | Search query (case-insensitive) |
| `category` | string | 'all'   | Font category filter            |
| `subset`   | string | ''      | Language/script filter          |
| `limit`    | number | 50      | Items per page                  |
| `offset`   | number | 0       | Pagination offset               |

#### Response

```typescript
{
  fonts: GoogleFont[]
  total: number
  hasMore: boolean
}
```

#### Caching Strategy

- **Memory cache**: 24 hours
- **Cache invalidation**: When API key changes
- **Fallback**: List of ~35 popular fonts if no API key is configured

#### API Key Configuration

Retrieved from ThemeSettings global (`googleFontsApiKey`). If not set, uses fallback list.

```typescript
async function getApiKeyFromConfig(): Promise<string | null> {
  const payload = await getPayload({ config })
  const themeSettings = await payload.findGlobal({ slug: 'theme-settings' })
  return themeSettings?.googleFontsApiKey || null
}
```

## Operational Flows

### 1. Opening Font Picker in Admin

```
┌──────────────────────────────────────────────────────────────────┐
│ 1. Component Mount                                                │
├──────────────────────────────────────────────────────────────────┤
│ ↓ Load preferences from localStorage                             │
│   - viewMode (row/grid)                                          │
│   - previewTab (typography/blog/landing/ui)                      │
│   - favorites (Set of font families)                             │
├──────────────────────────────────────────────────────────────────┤
│ ↓ Initial fetch: /api/google-fonts?subset=vietnamese&limit=100   │
├──────────────────────────────────────────────────────────────────┤
│ ↓ Load first 20 fonts into browser                               │
│   for each font in fonts.slice(0, 20):                           │
│     loadFont(font.family)  // inject <link> to <head>            │
├──────────────────────────────────────────────────────────────────┤
│ ↓ If already has selected value, load that font                  │
│   if (value) loadFont(value)                                     │
└──────────────────────────────────────────────────────────────────┘
```

### 2. User Search/Filter

```
┌──────────────────────────────────────────────────────────────────┐
│ User types in search box                                          │
├──────────────────────────────────────────────────────────────────┤
│ ↓ Debounce 300ms                                                  │
│   clearTimeout(debounceRef.current)                              │
│   debounceRef.current = setTimeout(() => {                        │
│     setOffset(0)                                                  │
│     fetchFonts(true)  // reset = true                            │
│   }, 300)                                                         │
├──────────────────────────────────────────────────────────────────┤
│ ↓ Fetch with new params                                           │
│   /api/google-fonts?search=inter&category=sans-serif&...         │
├──────────────────────────────────────────────────────────────────┤
│ ↓ Replace fonts list (reset = true)                              │
│   setFonts(data.fonts)                                           │
│   setOffset(100)                                                  │
│   setHasMore(data.hasMore)                                       │
└──────────────────────────────────────────────────────────────────┘
```

### 3. Scrolling (Infinite Loading)

```
┌──────────────────────────────────────────────────────────────────┐
│ handleScroll triggered                                            │
├──────────────────────────────────────────────────────────────────┤
│ ↓ Check conditions                                                │
│   if (!loading && hasMore &&                                      │
│       scrollTop + clientHeight >= scrollHeight - 100) {           │
│     fetchFonts(false)  // reset = false                          │
│   }                                                               │
├──────────────────────────────────────────────────────────────────┤
│ ↓ Append new fonts                                                │
│   setFonts(prev => [...prev, ...data.fonts])                     │
│   setOffset(prev => prev + 100)                                  │
└──────────────────────────────────────────────────────────────────┘
```

### 4. Hovering/Selecting Font

```
┌──────────────────────────────────────────────────────────────────┐
│ onMouseEnter on font item                                         │
├──────────────────────────────────────────────────────────────────┤
│ ↓ Lazy load font                                                  │
│   loadFont(font.family)                                          │
│   ↓                                                               │
│   if (loadedFontFamilies.has(fontFamily)) return  // skip        │
│   ↓                                                               │
│   Inject <link> to document.head:                                │
│   <link href="https://fonts.googleapis.com/css2?family=..."      │
│         rel="stylesheet" />                                       │
│   ↓                                                               │
│   setLoadedFontFamilies(prev => new Set(prev).add(fontFamily))   │
├──────────────────────────────────────────────────────────────────┤
│ onClick on font item                                              │
├──────────────────────────────────────────────────────────────────┤
│ ↓ loadFont(fontFamily)  // ensure loaded                         │
│ ↓ setValue(fontFamily)  // update Payload field value            │
└──────────────────────────────────────────────────────────────────┘
```

### 5. Saving ThemeSettings

```
┌──────────────────────────────────────────────────────────────────┐
│ User clicks Save in Payload Admin                                 │
├──────────────────────────────────────────────────────────────────┤
│ ↓ Payload saves to database:                                      │
│   theme-settings.activeFont = "Be Vietnam Pro"                   │
├──────────────────────────────────────────────────────────────────┤
│ ↓ revalidateThemeSettings hook triggered                         │
│   Clears Next.js cache tags: ['global_theme-settings']           │
└──────────────────────────────────────────────────────────────────┘
```

### 6. Frontend Rendering

```
┌──────────────────────────────────────────────────────────────────┐
│ RootLayout (Server Component)                                     │
├──────────────────────────────────────────────────────────────────┤
│ ↓ Fetch theme settings (cached)                                   │
│   const themeSettings = await getCachedThemeSettings()()         │
│   const activeFont = themeSettings?.activeFont || 'Inter'        │
├──────────────────────────────────────────────────────────────────┤
│ ↓ Check if font is pre-imported via next/font                    │
│   const supportedFontsMap = {                                    │
│     'Inter': inter.variable,                                     │
│     'Nunito': nunito.variable,                                   │
│     'Montserrat': montserrat.variable,                           │
│     ...                                                          │
│   }                                                               │
│   const selectedFontClass = supportedFontsMap[activeFont] || ''  │
│   const isSupportedFont = selectedFontClass !== ''               │
├──────────────────────────────────────────────────────────────────┤
│ ↓ Render HTML                                                     │
│   <html className={...selectedFontClass}                         │
│         style={!isSupportedFont ? {                              │
│           '--font-primary': `'${activeFont}', fallback`          │
│         } : undefined}>                                           │
│     <head>                                                        │
│       {/* Only load Google Fonts CSS if not pre-imported */}     │
│       {!isSupportedFont &&                                       │
│         <link href={googleFontsUrl} rel="stylesheet" />}         │
│     </head>                                                       │
│     <body className="font-primary">...</body>                    │
│   </html>                                                         │
└──────────────────────────────────────────────────────────────────┘
```

## Font Loading Strategy

### Optimized Fonts (next/font)

8 popular fonts are pre-imported via `next/font/google`:

- Inter, Nunito, Montserrat, Manrope
- Mulish, Barlow, Raleway, Playfair Display

**Advantages:**

- Zero runtime loading (fonts are bundled)
- Automatic font optimization
- No layout shift (FOUT/FOIT eliminated)

### Dynamic Fonts (Google Fonts CSS)

Other fonts are loaded via Google Fonts CSS:

```html
<link
  href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@300;400;500;600;700&display=swap"
  rel="stylesheet"
/>
```

**Optimizations:**

- `rel="preconnect"` for fonts.googleapis.com and fonts.gstatic.com
- `display=swap` to avoid invisible text

## Categories & Subsets

### Font Categories (6)

| Key           | Label       |
| ------------- | ----------- |
| `all`         | All         |
| `sans-serif`  | Sans Serif  |
| `serif`       | Serif       |
| `display`     | Display     |
| `handwriting` | Handwriting |
| `monospace`   | Monospace   |

### Language Subsets (14)

| Key            | Label             | Flag |
| -------------- | ----------------- | ---- |
| `all`          | All Languages     | -    |
| `vietnamese`   | Vietnamese        | 🇻🇳   |
| `latin`        | Latin             | -    |
| `latin-ext`    | Latin Extended    | -    |
| `cyrillic`     | Cyrillic          | 🇷🇺   |
| `cyrillic-ext` | Cyrillic Extended | -    |
| `greek`        | Greek             | 🇬🇷   |
| `greek-ext`    | Greek Extended    | -    |
| `arabic`       | Arabic            | 🇸🇦   |
| `hebrew`       | Hebrew            | 🇮🇱   |
| `thai`         | Thai              | 🇹🇭   |
| `japanese`     | Japanese          | 🇯🇵   |
| `korean`       | Korean            | 🇰🇷   |
| `chinese`      | Chinese           | 🇨🇳   |

## localStorage Keys

| Key                    | Type              | Description                    |
| ---------------------- | ----------------- | ------------------------------ |
| `fontPickerViewMode`   | `'row' \| 'grid'` | View mode preference           |
| `fontPickerFavorites`  | `string[]` (JSON) | List of favorite font families |
| `fontPickerPreviewTab` | `PreviewTab`      | Selected preview tab           |

## File Structure

```
src/globals/ThemeSettings/
├── config.ts                    # Global config with FontPicker field
├── hooks/
│   └── revalidateThemeSettings.ts
└── FontPicker/
    ├── index.tsx               # Main component
    ├── FontPreview.tsx         # Font preview with Shadow DOM
    ├── PreviewContent.tsx      # Preview content tabs
    ├── translations.ts         # i18n translations
    └── styles.scss             # Styles (~500 lines)

src/app/api/google-fonts/
└── route.ts                    # API endpoint

src/utilities/
└── getThemeSettings.ts         # Helper functions
```

## Performance Considerations

1. **Lazy Loading**: Fonts are only loaded when hovered or needed
2. **Debounced Search**: Prevents excessive API calls while typing
3. **Infinite Scroll**: Loads 100 fonts at a time instead of all at once
4. **Memory Cache**: API response cached for 24 hours
5. **Shadow DOM**: Isolates styles without affecting admin panel
6. **Pre-imported Fonts**: 8 popular fonts optimized via next/font
7. **Preconnect**: Reduces connection latency for Google Fonts

## Error Handling

1. **No API Key**: Uses fallback list (~35 fonts)
2. **API Error**: Catches and logs, returns fallback
3. **Font Load Error**: Graceful degradation with system fonts

## Security Considerations

- API key is stored in database, not exposed to client
- Server-side validation of all parameters
- Rate limiting through Google Fonts API

## Future Improvements

- [ ] Add font weight selection per font
- [ ] Support custom font upload
- [ ] Add font pairing suggestions
- [ ] Preview with actual website content
- [ ] Variable fonts support
- [ ] Font subsetting for performance
- [ ] Recently used fonts section
