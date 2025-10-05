// Theme types for the plugin
export type Mode = 'light' | 'dark' | 'auto';

export type ThemePreset = 
  | 'default'
  | 'ocean'
  | 'forest'
  | 'sunset'
  | 'midnight'
  | 'rose'
  | 'cool'
  | 'custom';

export const THEME_PRESETS: ThemePreset[] = [
  'default',
  'ocean',
  'forest',
  'sunset',
  'midnight',
  'rose',
  'cool',
  'custom',
];

export function themeIsValid(theme: string): theme is ThemePreset {
  return THEME_PRESETS.includes(theme as ThemePreset);
}

export interface BorderRadiusPreset {
  label: string;
  css: string | Record<string, string>;
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent?: string;
  background: string;
  text: string;
}
