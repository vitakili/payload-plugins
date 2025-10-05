/**
 * Payload types for theme configuration
 * These are placeholder types that will be extended in the consuming application
 */

export interface ThemeColorOverride {
  [token: string]: string | null | undefined;
  primary?: string | null;
  secondary?: string | null;
  accent?: string | null;
  background?: string | null;
  surface?: string | null;
  surfaceVariant?: string | null;
  text?: string | null;
  textSecondary?: string | null;
  border?: string | null;
  success?: string | null;
  warning?: string | null;
  error?: string | null;
  info?: string | null;
  foreground?: string | null;
  card?: string | null;
  cardForeground?: string | null;
  popover?: string | null;
  popoverForeground?: string | null;
  primaryForeground?: string | null;
  secondaryForeground?: string | null;
  muted?: string | null;
  mutedForeground?: string | null;
  accentForeground?: string | null;
  destructive?: string | null;
  destructiveForeground?: string | null;
  input?: string | null;
  ring?: string | null;
}

export interface ThemeTypographyOverride {
  bodyFont?:
    | (
        | 'preset'
        | 'system'
        | 'geist-sans'
        | 'inter'
        | 'manrope'
        | 'urbanist'
        | 'outfit'
        | 'lora'
        | 'custom'
      )
    | null;
  headingFont?:
    | (
        | 'preset'
        | 'geist-sans'
        | 'geist-mono'
        | 'outfit'
        | 'playfair'
        | 'lora'
        | 'serif-classic'
        | 'custom'
      )
    | null;
  bodyFontCustom?: string | null;
  headingFontCustom?: string | null;
  baseFontSize?: ('preset' | '14px' | '16px' | '18px' | '20px') | null;
  lineHeight?: ('preset' | '1.4' | '1.5' | '1.6' | '1.75' | '1.9') | null;
  fontWeights?: Partial<
    Record<'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'black', string | null>
  > | null;
  letterSpacing?: Partial<Record<'tight' | 'normal' | 'wide' | 'wider', string | null>> | null;
}

export interface ThemeCustomization {
  primaryColor?: string | null;
  accentColor?: string | null;
  backgroundColor?: string | null;
  textColor?: string | null;
  customCSS?: string | null;
}

export interface SiteThemeConfiguration {
  theme?: string | null;
  preset?: string | null;
  colorMode?: 'auto' | 'light' | 'dark' | null;
  allowColorModeToggle?: boolean | null;
  lightMode?: ThemeColorOverride | null;
  darkMode?: ThemeColorOverride | null;
  colors?: ThemeColorOverride | null;
  typography?: ThemeTypographyOverride | null;
  borderRadius?: 'none' | 'small' | 'medium' | 'large' | 'xl' | null;
  fontScale?: 'small' | 'medium' | 'large' | 'xl' | null;
  spacing?: 'compact' | 'medium' | 'spacious' | null;
  animationLevel?: 'none' | 'reduced' | 'medium' | 'high' | null;
  customCSS?: string | null;
  customization?: ThemeCustomization | null;
  radius?: string | null;
}

export interface SiteSetting {
  id: string;
  title?: string | null;
  slug?: string | null;
  themeConfiguration: SiteThemeConfiguration | null;
  updatedAt: string;
  createdAt: string;
}

export interface Config {
  collections: {
    'site-settings': SiteSetting;
  };
  globals: Record<string, unknown>;
}
