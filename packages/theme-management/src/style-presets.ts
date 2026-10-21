/**
 * Style presets — define the visual style (type, rhythm, effects, component
 * styles) WITHOUT touching colour palettes.
 *
 * A user can combine any colour preset (ThemePreset) with any style preset
 * (StylePreset). Every value here must be a valid option of the matching admin
 * field (see `themeConfigurationField.ts` and `constants/themeFonts.ts`),
 * otherwise the document cannot be saved — `tests/unit/stylePresets.test.ts`
 * guards this.
 */

export interface StylePresetTypography {
  /** Body font: a FONT_CATALOG value (e.g. 'Inter', 'Lora'). */
  bodyFont?: string
  /** Heading font: a FONT_CATALOG value. */
  headingFont?: string
  /** Base font size in px, stored without unit. Legacy 'small' | 'medium' | 'large' are mapped. */
  baseFontSize?: '14' | '15' | '16' | '17' | '18' | '20' | 'small' | 'medium' | 'large'
  /** Legacy 'compact' | 'normal' | 'relaxed' are mapped. */
  lineHeight?: '1.4' | '1.5' | '1.6' | '1.7' | '1.8' | 'compact' | 'normal' | 'relaxed'
  /** Heading tracking. 'wider' also sets headings in capitals. */
  letterSpacing?: 'tight' | 'normal' | 'wide' | 'wider'
  headingWeight?: '300' | '400' | '500' | '600' | '700' | '800'
}

export interface StylePreset {
  name: string
  label: { en: string; cs: string }
  description: { en: string; cs: string }
  category: 'classic' | 'effect'
  borderRadius?: 'none' | 'small' | 'medium' | 'large' | 'xl'
  animationLevel?: 'none' | 'reduced' | 'medium' | 'high'
  /** Spacing scale: 'compact' = tighter, 'medium' = default, 'comfortable' = generous whitespace ('spacious' is a legacy alias). */
  spacing?: 'compact' | 'medium' | 'comfortable' | 'spacious'
  typography?: StylePresetTypography
  visualEffects?: {
    effectStyle?: 'flat' | 'elevated' | 'glass' | 'neumorphic' | 'clay'
    shadowIntensity?: 'none' | 'subtle' | 'medium' | 'strong' | 'dramatic'
    backdropBlur?: 'none' | 'slight' | 'medium' | 'strong' | 'heavy'
    borderStyle?: 'none' | 'solid' | 'dashed' | 'dotted' | 'double'
    borderWidth?: '0px' | '1px' | '2px' | '3px' | '4px'
    glassOpacity?: number
  }
  componentStyles?: {
    buttonVariant?: 'filled' | 'outlined' | 'ghost' | 'gradient' | 'pill' | 'brutal'
    buttonSize?: 'small' | 'medium' | 'large' | 'xl'
    cardStyle?: 'elevated' | 'flat' | 'bordered' | 'glass' | 'neumorphic' | 'gradient-border'
    cardHoverEffect?: 'none' | 'lift' | 'scale' | 'shadow' | 'glow' | 'tilt'
    navbarStyle?: 'solid' | 'transparent' | 'blur' | 'floating' | 'minimal'
    footerStyle?: 'standard' | 'minimal' | 'dark' | 'gradient-top' | 'full-color'
    imageStyle?: 'default' | 'rounded' | 'circle' | 'vignette' | 'grayscale' | 'duotone' | 'polaroid'
    linkStyle?: 'underline' | 'underline-hover' | 'none' | 'highlight' | 'animated'
  }
}

const LEGACY_STYLE_VALUES: Record<string, Record<string, string>> = {
  spacing: { spacious: 'comfortable' },
  'typography.baseFontSize': { small: '15', medium: '16', large: '18' },
  'typography.lineHeight': { compact: '1.4', normal: '1.6', relaxed: '1.8' },
  'typography.bodyFont': { 'Source Sans Pro': 'Source Sans 3', 'Helvetica Neue': 'helvetica' },
  'typography.headingFont': { 'Source Sans Pro': 'Source Sans 3', 'Helvetica Neue': 'helvetica' },
}

/** Maps values from older StylePreset definitions onto the current field options. */
export function normalizeStylePresetValue(path: string, value: unknown): unknown {
  return typeof value === 'string' ? (LEGACY_STYLE_VALUES[path]?.[value] ?? value) : value
}

export const allStylePresets: StylePreset[] = [
  // ─── Classic styles ───────────────────────────────────────────────────────
  {
    name: 'swiss',
    label: { en: 'Swiss / Clean', cs: 'Švýcarský / čistý' },
    description: {
      en: 'Typographic clarity. Square corners, outlined buttons, strict grid, no decoration.',
      cs: 'Typografická jasnost. Ostré rohy, obrysová tlačítka, přísná mřížka, žádná dekorace.',
    },
    category: 'classic',
    borderRadius: 'none',
    animationLevel: 'reduced',
    spacing: 'comfortable',
    typography: {
      bodyFont: 'helvetica',
      headingFont: 'helvetica',
      baseFontSize: '16',
      lineHeight: '1.5',
      letterSpacing: 'tight',
      headingWeight: '700',
    },
    visualEffects: {
      effectStyle: 'flat',
      shadowIntensity: 'none',
      backdropBlur: 'none',
      borderStyle: 'solid',
      borderWidth: '1px',
    },
    componentStyles: {
      buttonVariant: 'outlined',
      buttonSize: 'medium',
      cardStyle: 'flat',
      cardHoverEffect: 'none',
      navbarStyle: 'minimal',
      footerStyle: 'minimal',
      imageStyle: 'default',
      linkStyle: 'underline',
    },
  },
  {
    name: 'editorial',
    label: { en: 'Editorial / Magazine', cs: 'Redakční / časopis' },
    description: {
      en: 'Serif headings, generous line spacing, ink-on-paper feel. Typography is the hero.',
      cs: 'Patkové nadpisy, velké řádkování, pocit tisku na papíře. Hlavní roli hraje typografie.',
    },
    category: 'classic',
    borderRadius: 'none',
    animationLevel: 'reduced',
    spacing: 'comfortable',
    typography: {
      bodyFont: 'Lora',
      headingFont: 'Playfair Display',
      baseFontSize: '18',
      lineHeight: '1.8',
      letterSpacing: 'tight',
      headingWeight: '700',
    },
    visualEffects: {
      effectStyle: 'flat',
      shadowIntensity: 'none',
      backdropBlur: 'none',
      borderStyle: 'solid',
      borderWidth: '1px',
    },
    componentStyles: {
      buttonVariant: 'outlined',
      buttonSize: 'medium',
      cardStyle: 'flat',
      cardHoverEffect: 'none',
      navbarStyle: 'minimal',
      footerStyle: 'minimal',
      imageStyle: 'default',
      linkStyle: 'underline',
    },
  },
  {
    name: 'luxury',
    label: { en: 'Luxury / Boutique', cs: 'Luxusní / butik' },
    description: {
      en: 'High-contrast display serif, light airy text, wide tracking and black-and-white imagery.',
      cs: 'Kontrastní výrazné patkové písmo, lehký vzdušný text, široké prostrkání a černobílé fotky.',
    },
    category: 'classic',
    borderRadius: 'none',
    animationLevel: 'reduced',
    spacing: 'comfortable',
    typography: {
      bodyFont: 'Manrope',
      headingFont: 'DM Serif Display',
      baseFontSize: '16',
      lineHeight: '1.8',
      letterSpacing: 'wide',
      headingWeight: '400',
    },
    visualEffects: {
      effectStyle: 'flat',
      shadowIntensity: 'none',
      backdropBlur: 'none',
      borderStyle: 'solid',
      borderWidth: '1px',
    },
    componentStyles: {
      buttonVariant: 'outlined',
      buttonSize: 'large',
      cardStyle: 'flat',
      cardHoverEffect: 'none',
      navbarStyle: 'transparent',
      footerStyle: 'dark',
      imageStyle: 'grayscale',
      linkStyle: 'animated',
    },
  },
  {
    name: 'art-deco',
    label: { en: 'Art Deco', cs: 'Art deco' },
    description: {
      en: 'Capitalised serif headings, double rules and a strong vertical rhythm.',
      cs: 'Patkové nadpisy verzálkami, dvojité linky a silný vertikální rytmus.',
    },
    category: 'classic',
    borderRadius: 'none',
    animationLevel: 'reduced',
    spacing: 'comfortable',
    typography: {
      bodyFont: 'Libre Baskerville',
      headingFont: 'Cormorant Garamond',
      baseFontSize: '17',
      lineHeight: '1.7',
      letterSpacing: 'wider',
      headingWeight: '600',
    },
    visualEffects: {
      effectStyle: 'flat',
      shadowIntensity: 'none',
      backdropBlur: 'none',
      borderStyle: 'double',
      borderWidth: '4px',
    },
    componentStyles: {
      buttonVariant: 'outlined',
      buttonSize: 'large',
      cardStyle: 'flat',
      cardHoverEffect: 'none',
      navbarStyle: 'solid',
      footerStyle: 'dark',
      imageStyle: 'vignette',
      linkStyle: 'underline',
    },
  },
  {
    name: 'corporate',
    label: { en: 'Corporate / Professional', cs: 'Firemní / profesionální' },
    description: {
      en: 'Trustworthy and calm. Clean sans-serif, soft shadows, solid buttons.',
      cs: 'Důvěryhodný a klidný. Čisté bezpatkové písmo, jemné stíny, plná tlačítka.',
    },
    category: 'classic',
    borderRadius: 'small',
    animationLevel: 'reduced',
    spacing: 'medium',
    typography: {
      bodyFont: 'Source Sans 3',
      headingFont: 'Source Sans 3',
      baseFontSize: '16',
      lineHeight: '1.6',
      letterSpacing: 'normal',
      headingWeight: '600',
    },
    visualEffects: {
      effectStyle: 'elevated',
      shadowIntensity: 'subtle',
      backdropBlur: 'none',
      borderStyle: 'solid',
      borderWidth: '1px',
    },
    componentStyles: {
      buttonVariant: 'filled',
      buttonSize: 'medium',
      cardStyle: 'elevated',
      cardHoverEffect: 'lift',
      navbarStyle: 'solid',
      footerStyle: 'standard',
      imageStyle: 'rounded',
      linkStyle: 'underline-hover',
    },
  },
  {
    name: 'material',
    label: { en: 'Material / Elevated', cs: 'Material / vyvýšený' },
    description: {
      en: 'Layered surfaces with clear shadows, medium rounding and lively motion.',
      cs: 'Vrstvené plochy s výraznými stíny, středním zaoblením a živým pohybem.',
    },
    category: 'classic',
    borderRadius: 'medium',
    animationLevel: 'high',
    spacing: 'medium',
    typography: {
      bodyFont: 'Roboto',
      headingFont: 'Roboto',
      baseFontSize: '16',
      lineHeight: '1.5',
      letterSpacing: 'normal',
      headingWeight: '500',
    },
    visualEffects: {
      effectStyle: 'elevated',
      shadowIntensity: 'medium',
      backdropBlur: 'none',
      borderStyle: 'none',
      borderWidth: '0px',
    },
    componentStyles: {
      buttonVariant: 'filled',
      buttonSize: 'medium',
      cardStyle: 'elevated',
      cardHoverEffect: 'lift',
      navbarStyle: 'solid',
      footerStyle: 'standard',
      imageStyle: 'rounded',
      linkStyle: 'underline-hover',
    },
  },
  {
    name: 'minimalism',
    label: { en: 'Minimalism', cs: 'Minimalismus' },
    description: {
      en: 'Maximum whitespace, thin headings, ghost buttons. Only what is necessary.',
      cs: 'Maximum volného prostoru, tenké nadpisy, průhledná tlačítka. Jen to nezbytné.',
    },
    category: 'classic',
    borderRadius: 'small',
    animationLevel: 'reduced',
    spacing: 'comfortable',
    typography: {
      bodyFont: 'DM Sans',
      headingFont: 'DM Sans',
      baseFontSize: '17',
      lineHeight: '1.8',
      letterSpacing: 'wide',
      headingWeight: '300',
    },
    visualEffects: {
      effectStyle: 'flat',
      shadowIntensity: 'none',
      backdropBlur: 'none',
      borderStyle: 'solid',
      borderWidth: '1px',
    },
    componentStyles: {
      buttonVariant: 'ghost',
      buttonSize: 'small',
      cardStyle: 'flat',
      cardHoverEffect: 'none',
      navbarStyle: 'minimal',
      footerStyle: 'minimal',
      imageStyle: 'default',
      linkStyle: 'underline',
    },
  },
  {
    name: 'tech',
    label: { en: 'Tech / Product', cs: 'Tech / produkt' },
    description: {
      en: 'Geometric grotesk, tight headings, hairline borders and a glow on hover.',
      cs: 'Geometrický grotesk, sevřené nadpisy, vlasové linky a záře při najetí.',
    },
    category: 'classic',
    borderRadius: 'small',
    animationLevel: 'medium',
    spacing: 'medium',
    typography: {
      bodyFont: 'Inter',
      headingFont: 'Space Grotesk',
      baseFontSize: '16',
      lineHeight: '1.6',
      letterSpacing: 'tight',
      headingWeight: '600',
    },
    visualEffects: {
      effectStyle: 'flat',
      shadowIntensity: 'none',
      backdropBlur: 'medium',
      borderStyle: 'solid',
      borderWidth: '1px',
    },
    componentStyles: {
      buttonVariant: 'filled',
      buttonSize: 'small',
      cardStyle: 'flat',
      cardHoverEffect: 'glow',
      navbarStyle: 'blur',
      footerStyle: 'minimal',
      imageStyle: 'rounded',
      linkStyle: 'animated',
    },
  },
  {
    name: 'poster',
    label: { en: 'Bold / Poster', cs: 'Výrazný / plakát' },
    description: {
      en: 'Huge expressive headings, extra-large buttons and a full-colour footer.',
      cs: 'Velké výrazné nadpisy, extra velká tlačítka a patička v plné barvě.',
    },
    category: 'classic',
    borderRadius: 'medium',
    animationLevel: 'medium',
    spacing: 'comfortable',
    typography: {
      bodyFont: 'Archivo',
      headingFont: 'Syne',
      baseFontSize: '17',
      lineHeight: '1.6',
      letterSpacing: 'tight',
      headingWeight: '800',
    },
    visualEffects: {
      effectStyle: 'flat',
      shadowIntensity: 'none',
      backdropBlur: 'none',
      borderStyle: 'none',
      borderWidth: '0px',
    },
    componentStyles: {
      buttonVariant: 'filled',
      buttonSize: 'xl',
      cardStyle: 'flat',
      cardHoverEffect: 'lift',
      navbarStyle: 'solid',
      footerStyle: 'full-color',
      imageStyle: 'rounded',
      linkStyle: 'highlight',
    },
  },
  {
    name: 'playful',
    label: { en: 'Playful / Rounded', cs: 'Hravý / zaoblený' },
    description: {
      en: 'Bubbly corners, pill buttons, a floating navbar and friendly rounded type.',
      cs: 'Bublinkové rohy, oblá tlačítka, plovoucí navigace a přátelské zaoblené písmo.',
    },
    category: 'classic',
    borderRadius: 'xl',
    animationLevel: 'high',
    spacing: 'medium',
    typography: {
      bodyFont: 'Nunito',
      headingFont: 'Nunito',
      baseFontSize: '17',
      lineHeight: '1.7',
      letterSpacing: 'normal',
      headingWeight: '800',
    },
    visualEffects: {
      effectStyle: 'elevated',
      shadowIntensity: 'medium',
      backdropBlur: 'none',
      borderStyle: 'none',
      borderWidth: '0px',
    },
    componentStyles: {
      buttonVariant: 'pill',
      buttonSize: 'large',
      cardStyle: 'elevated',
      cardHoverEffect: 'scale',
      navbarStyle: 'floating',
      footerStyle: 'full-color',
      imageStyle: 'rounded',
      linkStyle: 'highlight',
    },
  },
  {
    name: 'organic',
    label: { en: 'Organic / Nature', cs: 'Organický / příroda' },
    description: {
      en: 'Soft serif headings, warm spacing, large rounding and a transparent navbar.',
      cs: 'Měkké patkové nadpisy, vzdušné rozestupy, velké zaoblení a průhledná navigace.',
    },
    category: 'classic',
    borderRadius: 'large',
    animationLevel: 'medium',
    spacing: 'comfortable',
    typography: {
      bodyFont: 'Work Sans',
      headingFont: 'Fraunces',
      baseFontSize: '18',
      lineHeight: '1.7',
      letterSpacing: 'tight',
      headingWeight: '500',
    },
    visualEffects: {
      effectStyle: 'flat',
      shadowIntensity: 'subtle',
      backdropBlur: 'none',
      borderStyle: 'none',
      borderWidth: '0px',
    },
    componentStyles: {
      buttonVariant: 'pill',
      buttonSize: 'medium',
      cardStyle: 'flat',
      cardHoverEffect: 'lift',
      navbarStyle: 'transparent',
      footerStyle: 'gradient-top',
      imageStyle: 'rounded',
      linkStyle: 'highlight',
    },
  },
  {
    name: 'brutalism',
    label: { en: 'Brutalism', cs: 'Brutalismus' },
    description: {
      en: 'Raw and loud. Thick borders, hard offset shadows, zero rounding.',
      cs: 'Surový a hlasitý. Silné okraje, tvrdé posunuté stíny, žádné zaoblení.',
    },
    category: 'classic',
    borderRadius: 'none',
    animationLevel: 'none',
    spacing: 'comfortable',
    typography: {
      bodyFont: 'Space Grotesk',
      headingFont: 'Archivo Black',
      baseFontSize: '17',
      lineHeight: '1.5',
      letterSpacing: 'tight',
      headingWeight: '400',
    },
    visualEffects: {
      effectStyle: 'flat',
      shadowIntensity: 'none',
      backdropBlur: 'none',
      borderStyle: 'solid',
      borderWidth: '3px',
    },
    componentStyles: {
      buttonVariant: 'brutal',
      buttonSize: 'large',
      cardStyle: 'bordered',
      cardHoverEffect: 'shadow',
      navbarStyle: 'solid',
      footerStyle: 'dark',
      imageStyle: 'grayscale',
      linkStyle: 'highlight',
    },
  },
  {
    name: 'retro',
    label: { en: 'Retro / 90s', cs: 'Retro / 90. léta' },
    description: {
      en: 'Condensed capital headings, typewriter text, polaroid images and chunky outlines.',
      cs: 'Úzké nadpisy verzálkami, strojopisný text, fotky jako polaroid a silné obrysy.',
    },
    category: 'classic',
    borderRadius: 'none',
    animationLevel: 'medium',
    spacing: 'compact',
    typography: {
      bodyFont: 'IBM Plex Mono',
      headingFont: 'Bebas Neue',
      baseFontSize: '16',
      lineHeight: '1.6',
      letterSpacing: 'wider',
      headingWeight: '400',
    },
    visualEffects: {
      effectStyle: 'flat',
      shadowIntensity: 'none',
      backdropBlur: 'none',
      borderStyle: 'solid',
      borderWidth: '2px',
    },
    componentStyles: {
      buttonVariant: 'brutal',
      buttonSize: 'medium',
      cardStyle: 'bordered',
      cardHoverEffect: 'shadow',
      navbarStyle: 'solid',
      footerStyle: 'full-color',
      imageStyle: 'polaroid',
      linkStyle: 'highlight',
    },
  },

  // ─── Visual effect styles ─────────────────────────────────────────────────
  {
    name: 'glassmorphism',
    label: { en: 'Glassmorphism', cs: 'Mléčné sklo' },
    description: {
      en: 'Frosted glass panels over colour — blur, translucency, soft edges. Best on a vivid background.',
      cs: 'Panely z mléčného skla nad barvou — rozostření, průsvitnost, jemné hrany. Nejlépe na sytém pozadí.',
    },
    category: 'effect',
    borderRadius: 'large',
    animationLevel: 'medium',
    spacing: 'medium',
    typography: {
      bodyFont: 'Inter',
      headingFont: 'Outfit',
      baseFontSize: '16',
      lineHeight: '1.6',
      letterSpacing: 'tight',
      headingWeight: '600',
    },
    visualEffects: {
      effectStyle: 'glass',
      shadowIntensity: 'subtle',
      backdropBlur: 'strong',
      borderStyle: 'solid',
      borderWidth: '1px',
      glassOpacity: 55,
    },
    componentStyles: {
      buttonVariant: 'filled',
      buttonSize: 'medium',
      cardStyle: 'glass',
      cardHoverEffect: 'glow',
      navbarStyle: 'blur',
      footerStyle: 'minimal',
      imageStyle: 'rounded',
      linkStyle: 'animated',
    },
  },
  {
    name: 'neumorphism',
    label: { en: 'Soft UI', cs: 'Měkké UI' },
    description: {
      en: 'Elements look pressed out of the background with paired light and dark shadows.',
      cs: 'Prvky vypadají vytlačené z pozadí díky dvojici světlého a tmavého stínu.',
    },
    category: 'effect',
    borderRadius: 'large',
    animationLevel: 'medium',
    spacing: 'medium',
    typography: {
      bodyFont: 'DM Sans',
      headingFont: 'DM Sans',
      baseFontSize: '16',
      lineHeight: '1.6',
      letterSpacing: 'normal',
      headingWeight: '500',
    },
    visualEffects: {
      effectStyle: 'neumorphic',
      shadowIntensity: 'strong',
      backdropBlur: 'none',
      borderStyle: 'none',
      borderWidth: '0px',
    },
    componentStyles: {
      buttonVariant: 'filled',
      buttonSize: 'medium',
      cardStyle: 'neumorphic',
      cardHoverEffect: 'shadow',
      navbarStyle: 'solid',
      footerStyle: 'standard',
      imageStyle: 'rounded',
      linkStyle: 'underline-hover',
    },
  },
  {
    name: 'claymorphism',
    label: { en: 'Clay', cs: 'Plastelína' },
    description: {
      en: 'Soft, inflated 3D clay shapes with large rounding and chunky type.',
      cs: 'Měkké nafouklé 3D tvary jako z plastelíny, velké zaoblení a tučné písmo.',
    },
    category: 'effect',
    borderRadius: 'xl',
    animationLevel: 'high',
    spacing: 'medium',
    typography: {
      bodyFont: 'Nunito',
      headingFont: 'Nunito',
      baseFontSize: '18',
      lineHeight: '1.7',
      letterSpacing: 'normal',
      headingWeight: '800',
    },
    visualEffects: {
      effectStyle: 'clay',
      shadowIntensity: 'strong',
      backdropBlur: 'none',
      borderStyle: 'solid',
      borderWidth: '1px',
    },
    componentStyles: {
      buttonVariant: 'pill',
      buttonSize: 'large',
      cardStyle: 'elevated',
      cardHoverEffect: 'scale',
      navbarStyle: 'floating',
      footerStyle: 'full-color',
      imageStyle: 'rounded',
      linkStyle: 'highlight',
    },
  },
  {
    name: 'gradient-heavy',
    label: { en: 'Gradient', cs: 'Přechodový' },
    description: {
      en: 'The brand gradient leads: gradient buttons, gradient card borders and a glow.',
      cs: 'Hlavní roli hraje brandový přechod: přechodová tlačítka, okraje karet a záře.',
    },
    category: 'effect',
    borderRadius: 'medium',
    animationLevel: 'medium',
    spacing: 'medium',
    typography: {
      bodyFont: 'Inter',
      headingFont: 'Plus Jakarta Sans',
      baseFontSize: '16',
      lineHeight: '1.6',
      letterSpacing: 'tight',
      headingWeight: '800',
    },
    visualEffects: {
      effectStyle: 'elevated',
      shadowIntensity: 'medium',
      backdropBlur: 'medium',
      borderStyle: 'none',
      borderWidth: '0px',
    },
    componentStyles: {
      buttonVariant: 'gradient',
      buttonSize: 'medium',
      cardStyle: 'gradient-border',
      cardHoverEffect: 'glow',
      navbarStyle: 'blur',
      footerStyle: 'gradient-top',
      imageStyle: 'rounded',
      linkStyle: 'animated',
    },
  },
]

export const stylePresetCategories = [
  { name: 'classic', label: { en: 'Styles', cs: 'Styly' } },
  { name: 'effect', label: { en: 'Effect styles', cs: 'Styly s efekty' } },
] as const
