export type ThemeDefaults =
  | 'cool'
  | 'brutal'
  | 'neon'
  | 'solar'
  | 'dealership'
  | 'real-estate'
  | 'real-estate-gold'
  | 'real-estate-neutral';

export type Mode = 'dark' | 'light' | 'auto';

export type BorderRadiusPreset = 'none' | 'small' | 'medium' | 'large' | 'xl';

export type FontScalePreset = 'small' | 'medium' | 'large' | 'xl';

export type SpacingPreset = 'compact' | 'medium' | 'spacious';

export type AnimationLevelPreset = 'none' | 'reduced' | 'medium' | 'high';

export type ColorModePreset = 'auto' | 'light' | 'dark';

export interface ThemeConfig {
  name: string;
  label: string;
  borderRadius: BorderRadiusPreset;
  cssFile: string;
  preview?: {
    colors: {
      primary: string;
      background: string;
      accent: string;
    };
  };
}

export interface ThemeContextType {
  // Theme management
  theme?: ThemeDefaults | null;
  setTheme?: (theme: ThemeDefaults) => void; // Add setTheme for enhanced functionality
  refreshTheme: () => void; // Refresh theme (now handled server-side)

  // Color mode
  mode?: Mode | null;
  setMode: (mode: Mode | null) => void;
  isColorModeToggleAllowed?: boolean; // Whether admin allows color mode changes

  // Design controls
  borderRadius?: BorderRadiusPreset;
  setBorderRadius?: (radius: BorderRadiusPreset) => void;
  fontScale?: FontScalePreset;
  setFontScale?: (scale: FontScalePreset) => void;
  spacing?: SpacingPreset;
  setSpacing?: (spacing: SpacingPreset) => void;
  animationLevel?: AnimationLevelPreset;
  setAnimationLevel?: (level: AnimationLevelPreset) => void;

  // Theme loading
  preloadTheme?: (theme: ThemeDefaults) => Promise<boolean>;
  isThemeLoaded?: (theme: ThemeDefaults) => boolean;

  // Enhanced configuration
  themeConfig?: any; // Enhanced theme configuration from plugin
}

export interface ThemeOption {
  label: string;
  value: ThemeDefaults;
  config?: ThemeConfig;
}

export function themeIsValid(string: null | string): string is ThemeDefaults {
  return string
    ? [
        'cool',
        'brutal',
        'neon',
        'solar',
        'dealership',
        'real-estate',
        'real-estate-gold',
        'real-estate-neutral',
      ].includes(string)
    : false;
}

export function modeIsValid(string: null | string): string is Mode {
  return string ? ['dark', 'light'].includes(string) : false;
}
