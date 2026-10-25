import { DEFAULT_FONT_SUBSETS, loadThemeFontFaces } from '../utils/themeFontFaces.js'

interface ThemeFontFacesProps {
  /** Catalog font values (`FONT_CATALOG`), e.g. `['Outfit', 'Lora']`. */
  fonts: ReadonlyArray<string | null | undefined>
  /** Payload `routes.api` when it is not '/api'. */
  apiRoute?: string
  /** Google Fonts subsets to load. Default Latin + Latin Extended. */
  subsets?: readonly string[]
}

/**
 * Loads catalog fonts outside the theme — a page with its own typography
 * (a menu, a landing page) renders this next to its content and sets
 * `font-family: fontFamilyFor('Outfit')`. Same trimmed, inlined, self-hosted
 * `@font-face` rules as `ServerThemeInjector`. A font the theme already loads
 * may be listed again: the browser downloads each file once.
 */
export async function ThemeFontFaces({
  fonts,
  apiRoute = '/api',
  subsets = DEFAULT_FONT_SUBSETS,
}: Readonly<ThemeFontFacesProps>) {
  const { css } = await loadThemeFontFaces(fonts, { apiRoute, subsets })
  return css ? <style data-theme-font-faces="" dangerouslySetInnerHTML={{ __html: css }} /> : null
}
