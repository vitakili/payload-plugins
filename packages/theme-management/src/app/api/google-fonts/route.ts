import { NextRequest, NextResponse } from 'next/server'

// Font category type
export type FontCategory = 'all' | 'sans-serif' | 'serif' | 'display' | 'handwriting' | 'monospace'

// Language subset type
export type LanguageSubset =
  | 'all'
  | 'vietnamese'
  | 'latin'
  | 'latin-ext'
  | 'cyrillic'
  | 'cyrillic-ext'
  | 'greek'
  | 'greek-ext'
  | 'arabic'
  | 'hebrew'
  | 'thai'
  | 'japanese'
  | 'korean'
  | 'chinese'

// Google Font item
export interface GoogleFont {
  family: string
  variants: string[]
  subsets: string[]
  category: string
  version: string
  lastModified: string
  files: Record<string, string>
}

// API Response type
export interface GoogleFontsResponse {
  fonts: GoogleFont[]
  total: number
}

// Memory cache
interface CacheEntry {
  data: GoogleFontsResponse
  timestamp: number
}

const cache = new Map<string, CacheEntry>()
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours

// Fallback fonts (used when API key is missing or API fails)
const FALLBACK_FONTS: GoogleFont[] = [
  {
    family: 'Inter',
    variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
    subsets: ['latin', 'latin-ext', 'cyrillic', 'cyrillic-ext', 'greek', 'greek-ext', 'vietnamese'],
    category: 'sans-serif',
    version: 'v13',
    lastModified: '2024-01-01',
    files: {
      '400':
        'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2',
    },
  },
  {
    family: 'Roboto',
    variants: ['100', '300', '400', '500', '700', '900'],
    subsets: ['latin', 'latin-ext', 'cyrillic', 'cyrillic-ext', 'greek', 'greek-ext', 'vietnamese'],
    category: 'sans-serif',
    version: 'v30',
    lastModified: '2024-01-01',
    files: {
      '400': 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxK.woff2',
    },
  },
  {
    family: 'Open Sans',
    variants: ['300', '400', '500', '600', '700', '800'],
    subsets: [
      'latin',
      'latin-ext',
      'cyrillic',
      'cyrillic-ext',
      'greek',
      'greek-ext',
      'hebrew',
      'vietnamese',
    ],
    category: 'sans-serif',
    version: 'v35',
    lastModified: '2024-01-01',
    files: {
      '400':
        'https://fonts.gstatic.com/s/opensans/v35/memSYaGs126MiZpBA-UvWbX2vVnXBbObj2OVZyOOSr4dVJWUgsjZ0B4gaVI.woff2',
    },
  },
  {
    family: 'Lato',
    variants: ['100', '300', '400', '700', '900'],
    subsets: ['latin', 'latin-ext'],
    category: 'sans-serif',
    version: 'v24',
    lastModified: '2024-01-01',
    files: {
      '400': 'https://fonts.gstatic.com/s/lato/v24/S6uyw4BMUTPHjx4wXg.woff2',
    },
  },
  {
    family: 'Montserrat',
    variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
    subsets: ['latin', 'latin-ext', 'cyrillic', 'cyrillic-ext', 'vietnamese'],
    category: 'sans-serif',
    version: 'v26',
    lastModified: '2024-01-01',
    files: {
      '400':
        'https://fonts.gstatic.com/s/montserrat/v26/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCtr6Ew-Y3tcoqK5.woff2',
    },
  },
  {
    family: 'Poppins',
    variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
    subsets: ['latin', 'latin-ext'],
    category: 'sans-serif',
    version: 'v20',
    lastModified: '2024-01-01',
    files: {
      '400': 'https://fonts.gstatic.com/s/poppins/v20/pxiEyp8kv8JHgFVrJJfecg.woff2',
    },
  },
  {
    family: 'Nunito',
    variants: ['200', '300', '400', '500', '600', '700', '800', '900'],
    subsets: ['latin', 'latin-ext', 'cyrillic', 'cyrillic-ext', 'vietnamese'],
    category: 'sans-serif',
    version: 'v26',
    lastModified: '2024-01-01',
    files: {
      '400':
        'https://fonts.gstatic.com/s/nunito/v26/XRXI3I6Li01BKofiOc5wtlZ2di8HDLshdTQ3j77e.woff2',
    },
  },
  {
    family: 'Raleway',
    variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
    subsets: ['latin', 'latin-ext', 'cyrillic', 'cyrillic-ext'],
    category: 'sans-serif',
    version: 'v29',
    lastModified: '2024-01-01',
    files: {
      '400':
        'https://fonts.gstatic.com/s/raleway/v29/1Ptxg8zYS_SKggPN4iEgvnHyvveLxVvaorCIPrU.woff2',
    },
  },
  {
    family: 'Playfair Display',
    variants: ['400', '500', '600', '700', '800', '900'],
    subsets: ['latin', 'latin-ext', 'cyrillic'],
    category: 'serif',
    version: 'v37',
    lastModified: '2024-01-01',
    files: {
      '400':
        'https://fonts.gstatic.com/s/playfairdisplay/v37/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKdFvUDQZNLo_U2r.woff2',
    },
  },
  {
    family: 'Merriweather',
    variants: ['300', '400', '700', '900'],
    subsets: ['latin', 'latin-ext', 'cyrillic', 'cyrillic-ext', 'vietnamese'],
    category: 'serif',
    version: 'v30',
    lastModified: '2024-01-01',
    files: {
      '400':
        'https://fonts.gstatic.com/s/merriweather/v30/u-440qyriQwlOrhSvowK_l5-fCZMdeX3rg.woff2',
    },
  },
  {
    family: 'PT Sans',
    variants: ['400', '700'],
    subsets: ['latin', 'latin-ext', 'cyrillic', 'cyrillic-ext'],
    category: 'sans-serif',
    version: 'v17',
    lastModified: '2024-01-01',
    files: {
      '400': 'https://fonts.gstatic.com/s/ptsans/v17/jizaRExUiTo99u79D0KExcOPIDU.woff2',
    },
  },
  {
    family: 'Noto Sans',
    variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
    subsets: ['latin', 'latin-ext', 'cyrillic', 'cyrillic-ext', 'greek', 'greek-ext', 'vietnamese'],
    category: 'sans-serif',
    version: 'v36',
    lastModified: '2024-01-01',
    files: {
      '400':
        'https://fonts.gstatic.com/s/notosans/v36/o-0mIpQlx3QUlC5A4PNB6Ryti20_6n1iPHjcz6L1SoM-jCpoiyD9A-9a6Vc.woff2',
    },
  },
  {
    family: 'Ubuntu',
    variants: ['300', '400', '500', '700'],
    subsets: ['latin', 'latin-ext', 'cyrillic', 'cyrillic-ext', 'greek', 'greek-ext'],
    category: 'sans-serif',
    version: 'v20',
    lastModified: '2024-01-01',
    files: {
      '400': 'https://fonts.gstatic.com/s/ubuntu/v20/4iCs6KVjbNBYlgoKcg72j00.woff2',
    },
  },
  {
    family: 'Manrope',
    variants: ['200', '300', '400', '500', '600', '700', '800'],
    subsets: ['latin', 'latin-ext', 'cyrillic', 'cyrillic-ext', 'greek', 'vietnamese'],
    category: 'sans-serif',
    version: 'v15',
    lastModified: '2024-01-01',
    files: {
      '400':
        'https://fonts.gstatic.com/s/manrope/v15/xn7_YHE41ni1AdIRqAuZuw1Bx9mbZk59FO_F87jxeN7B.woff2',
    },
  },
  {
    family: 'Mulish',
    variants: ['200', '300', '400', '500', '600', '700', '800', '900'],
    subsets: ['latin', 'latin-ext', 'cyrillic', 'cyrillic-ext', 'vietnamese'],
    category: 'sans-serif',
    version: 'v13',
    lastModified: '2024-01-01',
    files: {
      '400':
        'https://fonts.gstatic.com/s/mulish/v13/1Ptyg83HX_SGhgqO0yLcmjzUAuWexZNRwaClGrw-PTY.woff2',
    },
  },
  {
    family: 'Barlow',
    variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
    subsets: ['latin', 'latin-ext', 'vietnamese'],
    category: 'sans-serif',
    version: 'v12',
    lastModified: '2024-01-01',
    files: {
      '400': 'https://fonts.gstatic.com/s/barlow/v12/7cHpv4kjgoGqM7E3b8s8yn4hnCci.woff2',
    },
  },
  {
    family: 'Work Sans',
    variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
    subsets: ['latin', 'latin-ext', 'vietnamese'],
    category: 'sans-serif',
    version: 'v19',
    lastModified: '2024-01-01',
    files: {
      '400':
        'https://fonts.gstatic.com/s/worksans/v19/QGY_z_wNahGAdqQ43RhVcIgYT2Xz5u32K0nWNigDp6_cOyA.woff2',
    },
  },
  {
    family: 'Quicksand',
    variants: ['300', '400', '500', '600', '700'],
    subsets: ['latin', 'latin-ext', 'vietnamese'],
    category: 'sans-serif',
    version: 'v31',
    lastModified: '2024-01-01',
    files: {
      '400':
        'https://fonts.gstatic.com/s/quicksand/v31/6xK-dSZaM9iE8KbpRA_LJ3z8mH9BOJvgkP8o58a-xDwxUD2GF9Zc.woff2',
    },
  },
  {
    family: 'Karla',
    variants: ['200', '300', '400', '500', '600', '700', '800'],
    subsets: ['latin', 'latin-ext'],
    category: 'sans-serif',
    version: 'v31',
    lastModified: '2024-01-01',
    files: {
      '400':
        'https://fonts.gstatic.com/s/karla/v31/qkBIXvYC6trAT55ZBi1ueQVIjQTDeJqqFENLR7fHGw.woff2',
    },
  },
  {
    family: 'Rubik',
    variants: ['300', '400', '500', '600', '700', '800', '900'],
    subsets: ['latin', 'latin-ext', 'cyrillic', 'cyrillic-ext', 'hebrew'],
    category: 'sans-serif',
    version: 'v28',
    lastModified: '2024-01-01',
    files: {
      '400': 'https://fonts.gstatic.com/s/rubik/v28/iJWZBXyIfDnIV5PNhY1KTN7Z-Yh-B4iFV0U1.woff2',
    },
  },
  {
    family: 'DM Sans',
    variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
    subsets: ['latin', 'latin-ext'],
    category: 'sans-serif',
    version: 'v15',
    lastModified: '2024-01-01',
    files: {
      '400':
        'https://fonts.gstatic.com/s/dmsans/v15/rP2tp2ywxg089UriI5-g4vlH9VoD8CmcqZG40F9JadbnoEwAopxRR236MF0WOQ.woff2',
    },
  },
  {
    family: 'Josefin Sans',
    variants: ['100', '200', '300', '400', '500', '600', '700'],
    subsets: ['latin', 'latin-ext', 'vietnamese'],
    category: 'sans-serif',
    version: 'v32',
    lastModified: '2024-01-01',
    files: {
      '400':
        'https://fonts.gstatic.com/s/josefinsans/v32/Qw3PZQNVED7rKGKxtqIqX5E-AVSJrOCfjY46_DjRXMFrLgTsQV0.woff2',
    },
  },
  {
    family: 'Libre Baskerville',
    variants: ['400', '700'],
    subsets: ['latin', 'latin-ext'],
    category: 'serif',
    version: 'v14',
    lastModified: '2024-01-01',
    files: {
      '400':
        'https://fonts.gstatic.com/s/librebaskerville/v14/kmKnZrc3Hgbbcjq75U4uslyuy4kn0pNeYRI4CN2V.woff2',
    },
  },
  {
    family: 'Source Sans 3',
    variants: ['200', '300', '400', '500', '600', '700', '800', '900'],
    subsets: ['latin', 'latin-ext', 'cyrillic', 'cyrillic-ext', 'greek', 'greek-ext', 'vietnamese'],
    category: 'sans-serif',
    version: 'v15',
    lastModified: '2024-01-01',
    files: {
      '400':
        'https://fonts.gstatic.com/s/sourcesans3/v15/nwpBtKy2OAdR1K-IwhWudF-R9QMylBJAV3Bo8Kw461EN_io6npfB.woff2',
    },
  },
  {
    family: 'Be Vietnam Pro',
    variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
    subsets: ['latin', 'latin-ext', 'vietnamese'],
    category: 'sans-serif',
    version: 'v11',
    lastModified: '2024-01-01',
    files: {
      '400':
        'https://fonts.gstatic.com/s/bevietnampro/v11/QdVMSTAyLFyeg_IDWvOJmVES_HRUBX8YYbAiah8.woff2',
    },
  },
  {
    family: 'Lexend',
    variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
    subsets: ['latin', 'latin-ext', 'vietnamese'],
    category: 'sans-serif',
    version: 'v19',
    lastModified: '2024-01-01',
    files: {
      '400':
        'https://fonts.gstatic.com/s/lexend/v19/wlptgwvFAVdoq2_F94zlCfv0bz1WCzsX_LBte6KuGEo.woff2',
    },
  },
  {
    family: 'Archivo',
    variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
    subsets: ['latin', 'latin-ext', 'vietnamese'],
    category: 'sans-serif',
    version: 'v19',
    lastModified: '2024-01-01',
    files: {
      '400':
        'https://fonts.gstatic.com/s/archivo/v19/k3kQo8UDI-1M0wlSV9XAw6lQkqWY8Q82sJaRE-NWIDdgffTTNDJp8B1oJ0vyVQ.woff2',
    },
  },
  {
    family: 'Space Grotesk',
    variants: ['300', '400', '500', '600', '700'],
    subsets: ['latin', 'latin-ext', 'vietnamese'],
    category: 'sans-serif',
    version: 'v16',
    lastModified: '2024-01-01',
    files: {
      '400':
        'https://fonts.gstatic.com/s/spacegrotesk/v16/V8mQoQDjQSkFtoMM3T6r8E7mF71Q-gOoraIAEj7oUUsjNsFjTDJK.woff2',
    },
  },
  {
    family: 'Outfit',
    variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
    subsets: ['latin', 'latin-ext'],
    category: 'sans-serif',
    version: 'v11',
    lastModified: '2024-01-01',
    files: {
      '400':
        'https://fonts.gstatic.com/s/outfit/v11/QGYyz_MVcBeNP4NjuGObqx1XmO1I4TC1O4a0EwEpq6W1J3f6ltDB.woff2',
    },
  },
  {
    family: 'Crimson Text',
    variants: ['400', '600', '700'],
    subsets: ['latin', 'latin-ext', 'vietnamese'],
    category: 'serif',
    version: 'v19',
    lastModified: '2024-01-01',
    files: {
      '400': 'https://fonts.gstatic.com/s/crimsontext/v19/wlp2gwHKFkZgtmSR3NB0oRJvaAJSA_JN3Q.woff2',
    },
  },
  {
    family: 'Inconsolata',
    variants: ['200', '300', '400', '500', '600', '700', '800', '900'],
    subsets: ['latin', 'latin-ext', 'vietnamese'],
    category: 'monospace',
    version: 'v32',
    lastModified: '2024-01-01',
    files: {
      '400':
        'https://fonts.gstatic.com/s/inconsolata/v32/QldgNThLqRwH-OJ1UHjlKENVzkWGVkL3GZQmAwLYxYWI2qfdm7Lpp4U8aRr8lleY2co.woff2',
    },
  },
  {
    family: 'Dancing Script',
    variants: ['400', '500', '600', '700'],
    subsets: ['latin', 'latin-ext', 'vietnamese'],
    category: 'handwriting',
    version: 'v25',
    lastModified: '2024-01-01',
    files: {
      '400':
        'https://fonts.gstatic.com/s/dancingscript/v25/If2cXTr6YS-zF4S-kcSWSVi_sxjsohD9F50Ruu7B1i03Rep8ltA.woff2',
    },
  },
  {
    family: 'Pacifico',
    variants: ['400'],
    subsets: ['latin', 'latin-ext', 'cyrillic', 'cyrillic-ext', 'vietnamese'],
    category: 'handwriting',
    version: 'v22',
    lastModified: '2024-01-01',
    files: {
      '400': 'https://fonts.gstatic.com/s/pacifico/v22/FwZY7-Qmy14u9lezJ96A4sijpFu_.woff2',
    },
  },
  {
    family: 'Bebas Neue',
    variants: ['400'],
    subsets: ['latin', 'latin-ext'],
    category: 'display',
    version: 'v14',
    lastModified: '2024-01-01',
    files: {
      '400': 'https://fonts.gstatic.com/s/bebasneue/v14/JTUSjIg69CK48gW7PXooxW5rygbi49c.woff2',
    },
  },
  {
    family: 'Righteous',
    variants: ['400'],
    subsets: ['latin', 'latin-ext'],
    category: 'display',
    version: 'v17',
    lastModified: '2024-01-01',
    files: {
      '400': 'https://fonts.gstatic.com/s/righteous/v17/1cXxaUPXBpj2rGoU7C9mj3uEicG01A.woff2',
    },
  },
]

/**
 * Filter fonts based on search, category, and subset
 */
function filterFonts(
  fonts: GoogleFont[],
  search: string,
  category: FontCategory,
  subset: LanguageSubset,
): GoogleFont[] {
  let filtered = fonts

  // Filter by search
  if (search) {
    const searchLower = search.toLowerCase()
    filtered = filtered.filter((font) => font.family.toLowerCase().includes(searchLower))
  }

  // Filter by category
  if (category !== 'all') {
    filtered = filtered.filter((font) => font.category === category)
  }

  // Filter by subset
  if (subset !== 'all') {
    filtered = filtered.filter((font) => font.subsets.includes(subset))
  }

  return filtered
}

/**
 * GET /api/google-fonts
 *
 * Query params:
 * - search: string (optional) - Search query
 * - category: FontCategory (optional) - Font category filter
 * - subset: LanguageSubset (optional) - Language subset filter
 * - limit: number (optional, default 100) - Number of fonts to return
 * - offset: number (optional, default 0) - Pagination offset
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const category = (searchParams.get('category') || 'all') as FontCategory
    const subset = (searchParams.get('subset') || 'all') as LanguageSubset
    const limit = Math.min(Number.parseInt(searchParams.get('limit') || '100'), 200)
    const offset = Number.parseInt(searchParams.get('offset') || '0')

    // Generate cache key
    const cacheKey = `${search}|${category}|${subset}`

    // Check cache
    const cached = cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      const fonts = cached.data.fonts.slice(offset, offset + limit)
      return NextResponse.json({
        fonts,
        total: cached.data.total,
      })
    }

    // Get Google Fonts API key from environment
    const apiKey = process.env.GOOGLE_FONTS_API_KEY

    let allFonts: GoogleFont[] = []

    if (apiKey) {
      try {
        // Fetch from Google Fonts API
        const response = await fetch(
          `https://www.googleapis.com/webfonts/v1/webfonts?key=${apiKey}&sort=popularity`,
          {
            next: { revalidate: 86400 }, // Revalidate every 24 hours
          },
        )

        if (!response.ok) {
          throw new Error(`Google Fonts API error: ${response.statusText}`)
        }

        const data = await response.json()
        allFonts = data.items || []
      } catch (error) {
        console.error('Google Fonts API error:', error)
        // Fall back to fallback fonts
        allFonts = FALLBACK_FONTS
      }
    } else {
      // No API key, use fallback fonts
      console.warn('GOOGLE_FONTS_API_KEY not set, using fallback fonts')
      allFonts = FALLBACK_FONTS
    }

    // Filter fonts
    const filteredFonts = filterFonts(allFonts, search, category, subset)

    // Cache the full filtered result
    cache.set(cacheKey, {
      data: {
        fonts: filteredFonts,
        total: filteredFonts.length,
      },
      timestamp: Date.now(),
    })

    // Return paginated result
    const fonts = filteredFonts.slice(offset, offset + limit)

    return NextResponse.json({
      fonts,
      total: filteredFonts.length,
    })
  } catch (error) {
    console.error('Error in /api/google-fonts:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch Google Fonts',
        fonts: FALLBACK_FONTS.slice(0, 100),
        total: FALLBACK_FONTS.length,
      },
      { status: 500 },
    )
  }
}
