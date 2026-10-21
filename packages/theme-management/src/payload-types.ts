/**
 * Payload types for theme configuration
 * These are placeholder types that will be extended in the consuming application
 */

export interface ThemeColorOverride {
  [token: string]: string | null | undefined
  primary?: string | null
  secondary?: string | null
  accent?: string | null
  background?: string | null
  surface?: string | null
  surfaceVariant?: string | null
  text?: string | null
  textSecondary?: string | null
  border?: string | null
  success?: string | null
  warning?: string | null
  error?: string | null
  info?: string | null
  foreground?: string | null
  card?: string | null
  cardForeground?: string | null
  popover?: string | null
  popoverForeground?: string | null
  primaryForeground?: string | null
  secondaryForeground?: string | null
  muted?: string | null
  mutedForeground?: string | null
  accentForeground?: string | null
  destructive?: string | null
  destructiveForeground?: string | null
  input?: string | null
  ring?: string | null
}

export interface ThemeTypographyOverride {
  /** 'preset', 'custom' or a font from FONT_CATALOG (e.g. 'Inter', 'Playfair Display'). */
  bodyFont?: string | null
  /** 'preset', 'custom' or a font from FONT_CATALOG. */
  headingFont?: string | null
  bodyFontCustom?: string | null
  headingFontCustom?: string | null
  /** 'preset' or a pixel number without unit ('14' … '20'). */
  baseFontSize?: string | null
  /** 'preset' or a unitless line height ('1.4' … '1.8'). */
  lineHeight?: string | null
  headingWeight?: ('preset' | '300' | '400' | '500' | '600' | '700' | '800') | null
  letterSpacing?: ('preset' | 'tight' | 'normal' | 'wide' | 'wider') | null
}

export interface ThemeCustomization {
  primaryColor?: string | null
  accentColor?: string | null
  backgroundColor?: string | null
  textColor?: string | null
  customCSS?: string | null
}

export interface ThemeVisualEffects {
  effectStyle?: 'flat' | 'elevated' | 'glass' | 'neumorphic' | 'clay' | null
  shadowIntensity?: 'none' | 'subtle' | 'medium' | 'strong' | 'dramatic' | null
  backdropBlur?: 'none' | 'slight' | 'medium' | 'strong' | 'heavy' | null
  borderStyle?: 'none' | 'solid' | 'dashed' | 'dotted' | 'double' | null
  borderWidth?: '0px' | '1px' | '2px' | '3px' | '4px' | null
  glassOpacity?: number | null
}

export interface ThemeComponentStyles {
  buttonVariant?: 'filled' | 'outlined' | 'ghost' | 'gradient' | 'pill' | 'brutal' | null
  buttonSize?: 'small' | 'medium' | 'large' | 'xl' | null
  cardStyle?: 'elevated' | 'flat' | 'bordered' | 'glass' | 'neumorphic' | 'gradient-border' | null
  cardHoverEffect?: 'none' | 'lift' | 'scale' | 'shadow' | 'glow' | 'tilt' | null
  imageStyle?:
    | 'default'
    | 'rounded'
    | 'circle'
    | 'vignette'
    | 'grayscale'
    | 'duotone'
    | 'polaroid'
    | null
  iconSet?: 'lucide' | 'heroicons' | 'phosphor' | 'tabler' | 'font-awesome' | null
  navbarStyle?: 'solid' | 'transparent' | 'blur' | 'floating' | 'minimal' | null
  footerStyle?: 'standard' | 'minimal' | 'dark' | 'gradient-top' | 'full-color' | null
  linkStyle?: 'underline' | 'underline-hover' | 'none' | 'highlight' | 'animated' | null
  enableScrollReveal?: boolean | null
  enableHoverAnimations?: boolean | null
}

export interface SiteThemeConfiguration {
  theme?: string | null
  preset?: string | null
  colorMode?: 'auto' | 'light' | 'dark' | null
  allowColorModeToggle?: boolean | null
  lightMode?: ThemeColorOverride | null
  darkMode?: ThemeColorOverride | null
  colors?: ThemeColorOverride | null
  typography?: ThemeTypographyOverride | null
  borderRadius?: 'none' | 'small' | 'medium' | 'large' | 'xl' | null
  fontScale?: 'small' | 'medium' | 'large' | 'xl' | null
  spacing?: 'compact' | 'medium' | 'spacious' | null
  animationLevel?: 'none' | 'reduced' | 'medium' | 'high' | null
  customCSS?: string | null
  customization?: ThemeCustomization | null
  radius?: string | null
  visualEffects?: ThemeVisualEffects | null
  componentStyles?: ThemeComponentStyles | null
  stylePreset?: string | null
}

export interface SiteSetting {
  id: string
  title?: string | null
  slug?: string | null
  themeConfiguration: SiteThemeConfiguration | null
  updatedAt: string
  createdAt: string
}

export interface Config {
  collections: {
    'site-settings': SiteSetting
  }
  globals: Record<string, unknown>
}
