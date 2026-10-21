/**
 * Theme fonts via next/font — the Next.js best practice, opt-in.
 *
 * Every font an editor can pick in Appearance Settings (FONT_CATALOG) declared
 * once with `next/font/google`: the files are downloaded at build time and
 * served from your own domain with metric-matched fallbacks (no layout shift),
 * and the visitor's browser never contacts Google.
 *
 * - `preload: false` — the tenant picks the font at runtime, so nothing is
 *   preloaded; the browser downloads only the face the page actually uses.
 * - Each `variable` matches the `--font-*` name in FONT_CATALOG, and the theme
 *   CSS reads `var(--font-lora, "Lora")`, so these copies win automatically.
 *
 * Usage (app/layout.tsx):
 *
 *   import { themeFontVariables } from '@kilivi/payloadcms-theme-management/next-fonts'
 *   <html className={themeFontVariables}>
 *     <head><ServerThemeInjector themeConfiguration={…} fontLoading="none" /></head>
 *
 * Without this module the plugin still serves the fonts from your own domain
 * through its `/api/theme-fonts` endpoints (the default, no setup needed).
 */
import {
  Archivo,
  Archivo_Black,
  Bebas_Neue,
  Cormorant_Garamond,
  Crimson_Pro,
  DM_Sans,
  DM_Serif_Display,
  Fraunces,
  IBM_Plex_Mono,
  Inter,
  JetBrains_Mono,
  Lato,
  Libre_Baskerville,
  Lora,
  Manrope,
  Merriweather,
  Montserrat,
  Nunito,
  Open_Sans,
  Outfit,
  Playfair_Display,
  Plus_Jakarta_Sans,
  Poppins,
  Raleway,
  Roboto,
  Source_Sans_3,
  Space_Grotesk,
  Space_Mono,
  Syne,
  Work_Sans,
} from 'next/font/google'

// Variable fonts: one file covers every weight.
const inter = Inter({ subsets: ['latin', 'latin-ext'], variable: '--font-inter', display: 'swap', preload: false })
const roboto = Roboto({ subsets: ['latin', 'latin-ext'], variable: '--font-roboto', display: 'swap', preload: false })
const openSans = Open_Sans({ subsets: ['latin', 'latin-ext'], variable: '--font-open-sans', display: 'swap', preload: false })
const montserrat = Montserrat({ subsets: ['latin', 'latin-ext'], variable: '--font-montserrat', display: 'swap', preload: false })
const raleway = Raleway({ subsets: ['latin', 'latin-ext'], variable: '--font-raleway', display: 'swap', preload: false })
const dmSans = DM_Sans({ subsets: ['latin', 'latin-ext'], variable: '--font-dm-sans', display: 'swap', preload: false })
const nunito = Nunito({ subsets: ['latin', 'latin-ext'], variable: '--font-nunito', display: 'swap', preload: false })
const plusJakarta = Plus_Jakarta_Sans({ subsets: ['latin', 'latin-ext'], variable: '--font-plus-jakarta', display: 'swap', preload: false })
const manrope = Manrope({ subsets: ['latin', 'latin-ext'], variable: '--font-manrope', display: 'swap', preload: false })
const spaceGrotesk = Space_Grotesk({ subsets: ['latin', 'latin-ext'], variable: '--font-space-grotesk', display: 'swap', preload: false })
const sourceSans = Source_Sans_3({ subsets: ['latin', 'latin-ext'], variable: '--font-source-sans', display: 'swap', preload: false })
const workSans = Work_Sans({ subsets: ['latin', 'latin-ext'], variable: '--font-work-sans', display: 'swap', preload: false })
const archivo = Archivo({ subsets: ['latin', 'latin-ext'], variable: '--font-archivo', display: 'swap', preload: false })
const outfit = Outfit({ subsets: ['latin', 'latin-ext'], variable: '--font-outfit', display: 'swap', preload: false })
const playfair = Playfair_Display({ subsets: ['latin', 'latin-ext'], variable: '--font-playfair', display: 'swap', preload: false })
const merriweather = Merriweather({ subsets: ['latin', 'latin-ext'], variable: '--font-merriweather', display: 'swap', preload: false })
const lora = Lora({ subsets: ['latin', 'latin-ext'], variable: '--font-lora', display: 'swap', preload: false })
const cormorant = Cormorant_Garamond({ subsets: ['latin', 'latin-ext'], variable: '--font-cormorant', display: 'swap', preload: false })
const crimson = Crimson_Pro({ subsets: ['latin', 'latin-ext'], variable: '--font-crimson', display: 'swap', preload: false })
const fraunces = Fraunces({ subsets: ['latin', 'latin-ext'], variable: '--font-fraunces', display: 'swap', preload: false })
const syne = Syne({ subsets: ['latin', 'latin-ext'], variable: '--font-syne', display: 'swap', preload: false })
const jetbrains = JetBrains_Mono({ subsets: ['latin', 'latin-ext'], variable: '--font-jetbrains-mono', display: 'swap', preload: false })

// Static fonts: weights must be listed.
const lato = Lato({ subsets: ['latin', 'latin-ext'], weight: ['300', '400', '700', '900'], variable: '--font-lato', display: 'swap', preload: false })
const poppins = Poppins({ subsets: ['latin', 'latin-ext'], weight: ['300', '400', '500', '600', '700', '800'], variable: '--font-poppins', display: 'swap', preload: false })
const libreBaskerville = Libre_Baskerville({ subsets: ['latin', 'latin-ext'], weight: ['400', '700'], variable: '--font-libre-baskerville', display: 'swap', preload: false })
const dmSerif = DM_Serif_Display({ subsets: ['latin', 'latin-ext'], weight: '400', variable: '--font-dm-serif', display: 'swap', preload: false })
const bebas = Bebas_Neue({ subsets: ['latin', 'latin-ext'], weight: '400', variable: '--font-bebas', display: 'swap', preload: false })
const archivoBlack = Archivo_Black({ subsets: ['latin', 'latin-ext'], weight: '400', variable: '--font-archivo-black', display: 'swap', preload: false })
const spaceMono = Space_Mono({ subsets: ['latin', 'latin-ext'], weight: ['400', '700'], variable: '--font-space-mono', display: 'swap', preload: false })
const ibmPlexMono = IBM_Plex_Mono({ subsets: ['latin', 'latin-ext'], weight: ['300', '400', '500', '600', '700'], variable: '--font-ibm-plex-mono', display: 'swap', preload: false })

/** Class names that define every `--font-*` variable; put them on <html>. */
export const themeFontVariables = [
  inter,
  roboto,
  openSans,
  lato,
  montserrat,
  poppins,
  raleway,
  dmSans,
  nunito,
  plusJakarta,
  manrope,
  spaceGrotesk,
  sourceSans,
  workSans,
  archivo,
  outfit,
  playfair,
  merriweather,
  lora,
  cormorant,
  crimson,
  fraunces,
  libreBaskerville,
  dmSerif,
  bebas,
  archivoBlack,
  syne,
  spaceMono,
  ibmPlexMono,
  jetbrains,
]
  .map((font) => font.variable)
  .join(' ')
