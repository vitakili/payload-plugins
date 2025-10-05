// Theme font constants for the plugin
export const BODY_FONT_OPTIONS = [
  { label: 'System', value: 'system-ui' },
  { label: 'Inter', value: 'Inter' },
  { label: 'Roboto', value: 'Roboto' },
  { label: 'Open Sans', value: 'Open Sans' },
  { label: 'Lato', value: 'Lato' },
  { label: 'Montserrat', value: 'Montserrat' },
  { label: 'Poppins', value: 'Poppins' },
] as const;

export const HEADING_FONT_OPTIONS = [
  { label: 'System', value: 'system-ui' },
  { label: 'Inter', value: 'Inter' },
  { label: 'Playfair Display', value: 'Playfair Display' },
  { label: 'Merriweather', value: 'Merriweather' },
  { label: 'Montserrat', value: 'Montserrat' },
  { label: 'Raleway', value: 'Raleway' },
] as const;

export const BASE_FONT_SIZE_OPTIONS = [
  { label: '14px', value: '14' },
  { label: '15px', value: '15' },
  { label: '16px', value: '16' },
  { label: '17px', value: '17' },
  { label: '18px', value: '18' },
] as const;

export const LINE_HEIGHT_OPTIONS = [
  { label: '1.4', value: '1.4' },
  { label: '1.5', value: '1.5' },
  { label: '1.6', value: '1.6' },
  { label: '1.7', value: '1.7' },
  { label: '1.8', value: '1.8' },
] as const;

export const FONT_VALUE_TO_CSS: Record<string, string> = {
  'system-ui': 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  'Inter': '"Inter", sans-serif',
  'Roboto': '"Roboto", sans-serif',
  'Open Sans': '"Open Sans", sans-serif',
  'Lato': '"Lato", sans-serif',
  'Montserrat': '"Montserrat", sans-serif',
  'Poppins': '"Poppins", sans-serif',
  'Playfair Display': '"Playfair Display", serif',
  'Merriweather': '"Merriweather", serif',
  'Raleway': '"Raleway", sans-serif',
};
