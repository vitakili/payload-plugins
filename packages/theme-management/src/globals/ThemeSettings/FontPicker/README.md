# Google Fonts Picker for Payload CMS

A comprehensive Google Fonts picker with advanced features for Payload CMS theme management plugin.

## Features

- **1400+ Google Fonts**: Access the full Google Fonts library (with API key) or 35 popular fonts (without API key)
- **Advanced UI**: Two-column layout with live preview panel and font selection panel
- **Multiple Preview Modes**: Typography, Blog Post, Landing Page, and UI Elements
- **Shadow DOM Isolation**: Font previews use Shadow DOM to prevent style conflicts with Payload admin CSS
- **Lazy Loading**: Fonts are only loaded when hovered or scrolled into view
- **Infinite Scroll**: Load 100 fonts at a time for better performance
- **Debounced Search**: 300ms debounce to prevent excessive API calls
- **Favorites System**: Mark favorite fonts with localStorage persistence
- **View Modes**: Switch between row and grid layouts
- **Filters**: Filter by category (sans-serif, serif, display, handwriting, monospace) and language subset
- **Translations**: Full support for English and Czech
- **Caching**: API responses cached for 24 hours to reduce Google Fonts API calls

## Installation

The Font Picker is included in the theme-management plugin. Import the ThemeSettings global:

```typescript
import { ThemeSettings } from '@kilivi/payloadcms-theme-management'

export default buildConfig({
  // ... other config
  globals: [ThemeSettings],
})
```

## Configuration

### Google Fonts API Key (Optional)

To access the full library of 1400+ fonts, add a Google Fonts API key:

1. Get an API key from [Google Fonts Developer API](https://developers.google.com/fonts/docs/developer_api)
2. Add the key in your Payload admin: **ThemeSettings > Typography > Google Fonts API Key**

Without an API key, you'll have access to 35 popular fonts.

### Environment Variable

Alternatively, you can set the API key via environment variable:

```env
GOOGLE_FONTS_API_KEY=your_api_key_here
```

## Usage

### Select a Font

1. Navigate to **ThemeSettings** in your Payload admin
2. Go to the **Typography** tab
3. Use the Font Picker to search, filter, and preview fonts
4. Click on a font to select it
5. Save the settings

### Load the Font in Your Frontend

#### Option 1: next/font/google (Recommended)

For optimal performance with Next.js:

```typescript
// app/layout.tsx
import { Inter, Nunito, Montserrat } from 'next/font/google'
import { getThemeSettings } from '@kilivi/payloadcms-theme-management'

// Pre-import popular fonts
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const nunito = Nunito({ subsets: ['latin'], variable: '--font-nunito' })
const montserrat = Montserrat({ subsets: ['latin'], variable: '--font-montserrat' })

export default async function RootLayout({ children }) {
  const themeSettings = await getThemeSettings(payload)
  const activeFont = themeSettings?.activeFont || 'Inter'

  // Map pre-imported fonts
  const fontMap = {
    'Inter': inter.variable,
    'Nunito': nunito.variable,
    'Montserrat': montserrat.variable,
    // ... add other pre-imported fonts
  }

  const selectedFontClass = fontMap[activeFont] || ''
  const isDynamicFont = !selectedFontClass

  return (
    <html
      className={selectedFontClass || ''}
      style={
        isDynamicFont
          ? { '--font-primary': `'${activeFont}', sans-serif` }
          : undefined
      }
    >
      <head>
        {isDynamicFont && (
          <>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link
              rel="preconnect"
              href="https://fonts.gstatic.com"
              crossOrigin=""
            />
            <link
              href={`https://fonts.googleapis.com/css2?family=${activeFont.replace(' ', '+')}:wght@300;400;500;600;700&display=swap`}
              rel="stylesheet"
            />
          </>
        )}
      </head>
      <body className="font-primary">{children}</body>
    </html>
  )
}
```

#### Option 2: Google Fonts CSS Link

For simpler setups:

```typescript
// app/layout.tsx
import { getThemeSettings, getGoogleFontUrl } from '@kilivi/payloadcms-theme-management'

export default async function RootLayout({ children }) {
  const themeSettings = await getThemeSettings(payload)
  const activeFont = themeSettings?.activeFont || 'Inter'
  const fontUrl = getGoogleFontUrl(activeFont, ['300', '400', '500', '600', '700'])

  return (
    <html style={{ '--font-primary': `'${activeFont}', sans-serif` }}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href={fontUrl} rel="stylesheet" />
      </head>
      <body className="font-primary">{children}</body>
    </html>
  )
}
```

### CSS

```css
.font-primary {
  font-family: var(--font-primary, 'Inter', sans-serif);
}
```

## Pre-imported Fonts (Optimized)

These 8 popular fonts are recommended for `next/font/google` optimization:

- Inter
- Nunito
- Montserrat
- Manrope
- Mulish
- Barlow
- Raleway
- Playfair Display

Use `isPreImportedFont()` to check if a font should use next/font:

```typescript
import { isPreImportedFont } from '@kilivi/payloadcms-theme-management'

if (isPreImportedFont(activeFont)) {
  // Use next/font/google import
} else {
  // Use Google Fonts CSS link
}
```

## API Reference

### Components

#### `FontPicker`

The main font picker component.

**Props:**

```typescript
interface FontPickerProps {
  value?: string // Current font family
  onChange: (fontFamily: string) => void // Callback when font is selected
  language?: 'en' | 'cs' // UI language (default: 'en')
}
```

### Utilities

#### `getThemeSettings(payload?: Payload)`

Fetches theme settings from Payload CMS.

**Returns:** `Promise<ThemeSettingsData | null>`

```typescript
interface ThemeSettingsData {
  activeFont: string
  googleFontsApiKey?: string
  fontWeightHeading: string
  fontWeightBody: string
}
```

#### `getGoogleFontUrl(fontFamily: string, weights?: string[])`

Generates a Google Fonts CSS URL.

**Parameters:**

- `fontFamily`: Font family name
- `weights`: Array of font weights (default: `['400', '700']`)

**Returns:** `string`

#### `isPreImportedFont(fontFamily: string)`

Checks if a font is pre-imported via next/font/google.

**Returns:** `boolean`

#### `PRE_IMPORTED_FONTS`

Constant array of pre-imported font names.

### API Endpoint

#### `GET /api/google-fonts`

Fetches fonts from Google Fonts API.

**Query Parameters:**

- `search` (optional): Search query
- `category` (optional): Font category (`all`, `sans-serif`, `serif`, `display`, `handwriting`, `monospace`)
- `subset` (optional): Language subset (`all`, `latin`, `cyrillic`, etc.)
- `limit` (optional): Number of fonts to return (default: 100, max: 200)
- `offset` (optional): Pagination offset (default: 0)

**Response:**

```typescript
interface GoogleFontsResponse {
  fonts: GoogleFont[]
  total: number
}

interface GoogleFont {
  family: string
  variants: string[]
  subsets: string[]
  category: string
  version: string
  lastModified: string
  files: Record<string, string>
}
```

## Performance

- **Memory Cache**: API responses cached for 24 hours
- **Lazy Loading**: Fonts loaded only when needed
- **Debounced Search**: 300ms delay reduces API calls
- **Infinite Scroll**: 100 fonts per request
- **Shadow DOM**: Isolated styles prevent admin CSS conflicts

## Translations

The Font Picker supports English and Czech. To add more languages:

1. Edit `src/globals/ThemeSettings/FontPicker/translations.ts`
2. Add your language to the `translations` object
3. Update the `Language` type

## Customization

### Styling

Override styles in your custom CSS:

```scss
.font-picker {
  // Your custom styles
}
```

### Preview Content

Customize preview content in `src/globals/ThemeSettings/FontPicker/PreviewContent.tsx`

## Troubleshooting

### Fonts not loading

1. Check that you've implemented the font loading code in your layout
2. Verify the `getThemeSettings()` call is working
3. Check browser console for errors

### API Rate Limiting

Google Fonts API has rate limits. If you hit the limit:

1. The system will fall back to 35 popular fonts
2. Consider implementing server-side caching
3. Monitor your API usage in Google Cloud Console

## License

MIT
