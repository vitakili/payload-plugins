// Theme font constants for the plugin
export const BODY_FONT_OPTIONS = [
  { label: { en: 'Use theme preset', cs: 'Použít výchozí' }, value: 'preset' },
  {
    label: { en: 'System', cs: 'Systémové' },
    value: 'system-ui',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    category: 'sans-serif' as const,
  },
  {
    label: { en: 'Inter', cs: 'Inter' },
    value: 'Inter',
    fontFamily: '"Inter", sans-serif',
    category: 'sans-serif' as const,
  },
  {
    label: { en: 'Roboto', cs: 'Roboto' },
    value: 'Roboto',
    fontFamily: '"Roboto", sans-serif',
    category: 'sans-serif' as const,
  },
  {
    label: { en: 'Open Sans', cs: 'Open Sans' },
    value: 'Open Sans',
    fontFamily: '"Open Sans", sans-serif',
    category: 'sans-serif' as const,
  },
  {
    label: { en: 'Lato', cs: 'Lato' },
    value: 'Lato',
    fontFamily: '"Lato", sans-serif',
    category: 'sans-serif' as const,
  },
  {
    label: { en: 'Montserrat', cs: 'Montserrat' },
    value: 'Montserrat',
    fontFamily: '"Montserrat", sans-serif',
    category: 'sans-serif' as const,
  },
  {
    label: { en: 'Poppins', cs: 'Poppins' },
    value: 'Poppins',
    fontFamily: '"Poppins", sans-serif',
    category: 'sans-serif' as const,
  },
  { label: { en: 'Custom font...', cs: 'Vlastní písmo...' }, value: 'custom' },
] as const

export const HEADING_FONT_OPTIONS = [
  { label: { en: 'Use theme preset', cs: 'Použít výchozí' }, value: 'preset' },
  {
    label: { en: 'System', cs: 'Systémové' },
    value: 'system-ui',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    category: 'sans-serif' as const,
  },
  {
    label: { en: 'Inter', cs: 'Inter' },
    value: 'Inter',
    fontFamily: '"Inter", sans-serif',
    category: 'sans-serif' as const,
  },
  {
    label: { en: 'Playfair Display', cs: 'Playfair Display' },
    value: 'Playfair Display',
    fontFamily: '"Playfair Display", serif',
    category: 'serif' as const,
  },
  {
    label: { en: 'Merriweather', cs: 'Merriweather' },
    value: 'Merriweather',
    fontFamily: '"Merriweather", serif',
    category: 'serif' as const,
  },
  {
    label: { en: 'Montserrat', cs: 'Montserrat' },
    value: 'Montserrat',
    fontFamily: '"Montserrat", sans-serif',
    category: 'sans-serif' as const,
  },
  {
    label: { en: 'Raleway', cs: 'Raleway' },
    value: 'Raleway',
    fontFamily: '"Raleway", sans-serif',
    category: 'sans-serif' as const,
  },
  { label: { en: 'Custom font...', cs: 'Vlastní písmo...' }, value: 'custom' },
] as const

export const BASE_FONT_SIZE_OPTIONS = [
  { label: 'preset', value: 'preset' },
  { label: '14px', value: '14' },
  { label: '15px', value: '15' },
  { label: '16px', value: '16' },
  { label: '17px', value: '17' },
  { label: '18px', value: '18' },
] as const

export const LINE_HEIGHT_OPTIONS = [
  { label: 'preset', value: 'preset' },
  { label: '1.4', value: '1.4' },
  { label: '1.5', value: '1.5' },
  { label: '1.6', value: '1.6' },
  { label: '1.7', value: '1.7' },
  { label: '1.8', value: '1.8' },
] as const

export const FONT_VALUE_TO_CSS: Record<string, string> = {
  'system-ui': 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  Inter: '"Inter", sans-serif',
  Roboto: '"Roboto", sans-serif',
  'Open Sans': '"Open Sans", sans-serif',
  Lato: '"Lato", sans-serif',
  Montserrat: '"Montserrat", sans-serif',
  Poppins: '"Poppins", sans-serif',
  'Playfair Display': '"Playfair Display", serif',
  Merriweather: '"Merriweather", serif',
  Raleway: '"Raleway", sans-serif',
}
