/**
 * Style presets — define visual style (effects, component defaults, layout)
 * WITHOUT touching color palettes.
 *
 * A user can combine any color preset (ThemePreset) with any style preset (StylePreset).
 */

export interface StylePresetTypography {
  /** Body / paragraph font family (CSS font-family value or Google Fonts name) */
  bodyFont?: string
  /** Heading font family */
  headingFont?: string
  /** Base font size token: 'small' | 'medium' | 'large' */
  baseFontSize?: 'small' | 'medium' | 'large'
  /** Line-height token: 'compact' | 'normal' | 'relaxed' */
  lineHeight?: 'compact' | 'normal' | 'relaxed'
  /** Letter-spacing character: 'tight' | 'normal' | 'wide' | 'wider' */
  letterSpacing?: 'tight' | 'normal' | 'wide' | 'wider'
  /** Heading weight: normal CSS font-weight string */
  headingWeight?: '300' | '400' | '500' | '600' | '700' | '800' | '900'
}

export interface StylePreset {
  name: string
  label: { en: string; cs: string }
  description: { en: string; cs: string }
  category: 'classic' | 'effect'
  borderRadius?: 'none' | 'small' | 'medium' | 'large' | 'xl'
  animationLevel?: 'none' | 'reduced' | 'medium' | 'high'
  /** Spacing scale: 'compact' = tighter padding/gap, 'medium' = default, 'spacious' = generous whitespace */
  spacing?: 'compact' | 'medium' | 'spacious'
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
    cardStyle?: 'elevated' | 'flat' | 'bordered' | 'glass' | 'neumorphic' | 'gradient-border'
    cardHoverEffect?: 'none' | 'lift' | 'scale' | 'shadow' | 'glow' | 'tilt'
    navbarStyle?: 'solid' | 'transparent' | 'blur' | 'floating' | 'minimal'
  }
}

export const allStylePresets: StylePreset[] = [
  // ─── Classic styles ───────────────────────────────────────────────────────
  {
    name: 'brutalism',
    label: { en: 'Brutalism', cs: 'Brutalismus' },
    description: {
      en: 'Raw, anti-aesthetic design. Thick borders, harsh shadows, zero roundness.',
      cs: 'Surový, anti-estetický design. Silné okraje, tvrdé stíny, žádné zaoblení.',
    },
    category: 'classic',
    borderRadius: 'none',
    animationLevel: 'none',
    spacing: 'spacious',
    typography: {
      bodyFont: 'Space Mono',
      headingFont: 'Space Mono',
      baseFontSize: 'medium',
      lineHeight: 'compact',
      letterSpacing: 'normal',
      headingWeight: '700',
    },
    visualEffects: {
      effectStyle: 'elevated',
      shadowIntensity: 'dramatic',
      borderStyle: 'solid',
      borderWidth: '3px',
    },
    componentStyles: {
      buttonVariant: 'brutal',
      cardStyle: 'bordered',
      cardHoverEffect: 'shadow',
      navbarStyle: 'solid',
    },
  },
  {
    name: 'swiss',
    label: { en: 'Swiss / Clean', cs: 'Švýcarský / čistý' },
    description: {
      en: 'Typographic clarity. No radius, outlined elements, strict grid, zero decoration.',
      cs: 'Typografická jasnost. Žádné zaoblení, obrysové prvky, přísný grid, nulová dekorace.',
    },
    category: 'classic',
    borderRadius: 'none',
    animationLevel: 'reduced',
    spacing: 'spacious',
    typography: {
      bodyFont: 'Helvetica Neue, Arial, sans-serif',
      headingFont: 'Helvetica Neue, Arial, sans-serif',
      baseFontSize: 'medium',
      lineHeight: 'normal',
      letterSpacing: 'tight',
      headingWeight: '700',
    },
    visualEffects: {
      effectStyle: 'flat',
      shadowIntensity: 'none',
      borderStyle: 'solid',
      borderWidth: '1px',
    },
    componentStyles: {
      buttonVariant: 'outlined',
      cardStyle: 'flat',
      cardHoverEffect: 'none',
      navbarStyle: 'minimal',
    },
  },
  {
    name: 'flat-design',
    label: { en: 'Flat Design', cs: 'Plochý design' },
    description: {
      en: 'No shadows, no depth. Clean colours, simple icons, purely functional UI.',
      cs: 'Bez stínů, bez hloubky. Čisté barvy, jednoduché ikony, čistě funkční UI.',
    },
    category: 'classic',
    borderRadius: 'small',
    animationLevel: 'reduced',
    spacing: 'medium',
    typography: {
      bodyFont: 'Inter',
      headingFont: 'Inter',
      baseFontSize: 'medium',
      lineHeight: 'normal',
      letterSpacing: 'normal',
      headingWeight: '600',
    },
    visualEffects: {
      effectStyle: 'flat',
      shadowIntensity: 'none',
      borderStyle: 'none',
      borderWidth: '0px',
    },
    componentStyles: {
      buttonVariant: 'filled',
      cardStyle: 'flat',
      cardHoverEffect: 'scale',
      navbarStyle: 'solid',
    },
  },
  {
    name: 'material',
    label: { en: 'Material / Elevated', cs: 'Material / Vyvýšený' },
    description: {
      en: 'Google Material style — cards with shadows, layered surfaces, subtle depth.',
      cs: 'Google Material styl — karty se stíny, vrstvené povrchy, jemná hloubka.',
    },
    category: 'classic',
    borderRadius: 'medium',
    animationLevel: 'high',
    spacing: 'medium',
    typography: {
      bodyFont: 'Roboto',
      headingFont: 'Roboto',
      baseFontSize: 'medium',
      lineHeight: 'normal',
      letterSpacing: 'normal',
      headingWeight: '500',
    },
    visualEffects: {
      effectStyle: 'elevated',
      shadowIntensity: 'medium',
      borderStyle: 'none',
      borderWidth: '0px',
    },
    componentStyles: {
      buttonVariant: 'filled',
      cardStyle: 'elevated',
      cardHoverEffect: 'lift',
      navbarStyle: 'solid',
    },
  },
  {
    name: 'minimalism',
    label: { en: 'Minimalism', cs: 'Minimalismus' },
    description: {
      en: 'Maximum whitespace, near-invisible borders, thin type. Only what is necessary.',
      cs: 'Maximální bílý prostor, téměř neviditelné okraje, tenké písmo. Jen to nezbytné.',
    },
    category: 'classic',
    borderRadius: 'small',
    animationLevel: 'reduced',
    spacing: 'spacious',
    typography: {
      bodyFont: 'DM Sans',
      headingFont: 'DM Sans',
      baseFontSize: 'medium',
      lineHeight: 'relaxed',
      letterSpacing: 'wide',
      headingWeight: '300',
    },
    visualEffects: {
      effectStyle: 'flat',
      shadowIntensity: 'none',
      borderStyle: 'solid',
      borderWidth: '1px',
    },
    componentStyles: {
      buttonVariant: 'ghost',
      cardStyle: 'flat',
      cardHoverEffect: 'none',
      navbarStyle: 'minimal',
    },
  },
  {
    name: 'editorial',
    label: { en: 'Editorial / Magazine', cs: 'Redakční / Časopis' },
    description: {
      en: 'Serif headings, generous line spacing, ink-on-paper feel. Bold typography as the hero.',
      cs: 'Serifové nadpisy, velké řádkování, pocit inkoustu na papíře. Typografie jako hrdina.',
    },
    category: 'classic',
    borderRadius: 'none',
    animationLevel: 'reduced',
    spacing: 'spacious',
    typography: {
      bodyFont: 'Lora',
      headingFont: 'Playfair Display',
      baseFontSize: 'large',
      lineHeight: 'relaxed',
      letterSpacing: 'tight',
      headingWeight: '700',
    },
    visualEffects: {
      effectStyle: 'flat',
      shadowIntensity: 'none',
      borderStyle: 'solid',
      borderWidth: '1px',
    },
    componentStyles: {
      buttonVariant: 'outlined',
      cardStyle: 'flat',
      cardHoverEffect: 'none',
      navbarStyle: 'minimal',
    },
  },
  {
    name: 'retro',
    label: { en: 'Retro / 90s', cs: 'Retro / 90. léta' },
    description: {
      en: 'Chunky type, bold outlines, pixel-inspired borders. Nostalgic web aesthetic.',
      cs: 'Tučné písmo, silné obrysy, pixelové hranice. Nostalgická webová estetika.',
    },
    category: 'classic',
    borderRadius: 'none',
    animationLevel: 'medium',
    spacing: 'compact',
    typography: {
      bodyFont: 'IBM Plex Mono',
      headingFont: 'Bebas Neue',
      baseFontSize: 'large',
      lineHeight: 'compact',
      letterSpacing: 'wider',
      headingWeight: '400',
    },
    visualEffects: {
      effectStyle: 'elevated',
      shadowIntensity: 'dramatic',
      borderStyle: 'solid',
      borderWidth: '2px',
    },
    componentStyles: {
      buttonVariant: 'brutal',
      cardStyle: 'bordered',
      cardHoverEffect: 'shadow',
      navbarStyle: 'solid',
    },
  },
  {
    name: 'art-deco',
    label: { en: 'Art Deco', cs: 'Art Deco' },
    description: {
      en: 'Geometric symmetry, ornate headings, gold accents and strong vertical rhythm.',
      cs: 'Geometrická symetrie, ozdobné nadpisy, zlaté akcenty a silný vertikální rytmus.',
    },
    category: 'classic',
    borderRadius: 'none',
    animationLevel: 'reduced',
    spacing: 'spacious',
    typography: {
      bodyFont: 'Cormorant Garamond',
      headingFont: 'Cormorant Garamond',
      baseFontSize: 'medium',
      lineHeight: 'relaxed',
      letterSpacing: 'wider',
      headingWeight: '600',
    },
    visualEffects: {
      effectStyle: 'flat',
      shadowIntensity: 'subtle',
      borderStyle: 'double',
      borderWidth: '3px',
    },
    componentStyles: {
      buttonVariant: 'outlined',
      cardStyle: 'bordered',
      cardHoverEffect: 'none',
      navbarStyle: 'solid',
    },
  },
  {
    name: 'corporate',
    label: { en: 'Corporate / Professional', cs: 'Korporátní / Profesionální' },
    description: {
      en: 'Trustworthy, conservative design. Clean sans-serif, ample whitespace, minimal decoration.',
      cs: 'Důvěryhodný, konzervativní design. Čisté sans-serif, dostatek prostoru, minimální dekorace.',
    },
    category: 'classic',
    borderRadius: 'small',
    animationLevel: 'reduced',
    spacing: 'medium',
    typography: {
      bodyFont: 'Source Sans Pro',
      headingFont: 'Source Sans Pro',
      baseFontSize: 'medium',
      lineHeight: 'normal',
      letterSpacing: 'normal',
      headingWeight: '600',
    },
    visualEffects: {
      effectStyle: 'elevated',
      shadowIntensity: 'subtle',
      borderStyle: 'solid',
      borderWidth: '1px',
    },
    componentStyles: {
      buttonVariant: 'filled',
      cardStyle: 'elevated',
      cardHoverEffect: 'lift',
      navbarStyle: 'solid',
    },
  },
  {
    name: 'playful',
    label: { en: 'Playful / Rounded', cs: 'Hravý / Zaoblený' },
    description: {
      en: 'Bubbly rounded corners, bouncy animations, friendly typefaces. Fun and approachable.',
      cs: 'Bublinkové zaoblení, skákavé animace, přátelské písmo. Zábavné a přístupné.',
    },
    category: 'classic',
    borderRadius: 'xl',
    animationLevel: 'high',
    spacing: 'medium',
    typography: {
      bodyFont: 'Nunito',
      headingFont: 'Nunito',
      baseFontSize: 'medium',
      lineHeight: 'relaxed',
      letterSpacing: 'normal',
      headingWeight: '700',
    },
    visualEffects: {
      effectStyle: 'elevated',
      shadowIntensity: 'medium',
      borderStyle: 'none',
      borderWidth: '0px',
    },
    componentStyles: {
      buttonVariant: 'pill',
      cardStyle: 'elevated',
      cardHoverEffect: 'scale',
      navbarStyle: 'floating',
    },
  },
  {
    name: 'organic',
    label: { en: 'Organic / Nature', cs: 'Organický / Příroda' },
    description: {
      en: 'Soft curves, earthy tones, hand-crafted feel. Asymmetric shapes and warm spacing.',
      cs: 'Jemné křivky, zemité tóny, ručně vyrobený pocit. Asymetrické tvary a teplé mezery.',
    },
    category: 'classic',
    borderRadius: 'large',
    animationLevel: 'medium',
    spacing: 'spacious',
    typography: {
      bodyFont: 'Crimson Pro',
      headingFont: 'Crimson Pro',
      baseFontSize: 'large',
      lineHeight: 'relaxed',
      letterSpacing: 'tight',
      headingWeight: '600',
    },
    visualEffects: {
      effectStyle: 'flat',
      shadowIntensity: 'subtle',
      borderStyle: 'none',
      borderWidth: '0px',
    },
    componentStyles: {
      buttonVariant: 'pill',
      cardStyle: 'flat',
      cardHoverEffect: 'lift',
      navbarStyle: 'transparent',
    },
  },

  // ─── Visual effect styles ─────────────────────────────────────────────────
  {
    name: 'glassmorphism',
    label: { en: 'Glassmorphism', cs: 'Glassmorphism' },
    description: {
      en: 'Frosted glass — blurred backgrounds, transparency, soft borders.',
      cs: 'Mléčné sklo — rozmazané pozadí, průhlednost, jemné hranice.',
    },
    category: 'effect',
    borderRadius: 'large',
    animationLevel: 'medium',
    spacing: 'medium',
    typography: {
      bodyFont: 'Inter',
      headingFont: 'Inter',
      baseFontSize: 'medium',
      lineHeight: 'normal',
      letterSpacing: 'normal',
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
      buttonVariant: 'ghost',
      cardStyle: 'glass',
      cardHoverEffect: 'glow',
      navbarStyle: 'blur',
    },
  },
  {
    name: 'neumorphism',
    label: { en: 'Neumorphism', cs: 'Neumorphism' },
    description: {
      en: 'Soft UI — elements look extruded from the background using dual light/dark shadows.',
      cs: 'Měkké UI — prvky vypadají vytlačené z pozadí díky dvojitým stínům.',
    },
    category: 'effect',
    borderRadius: 'large',
    animationLevel: 'medium',
    spacing: 'medium',
    typography: {
      bodyFont: 'DM Sans',
      headingFont: 'DM Sans',
      baseFontSize: 'medium',
      lineHeight: 'normal',
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
      cardStyle: 'neumorphic',
      cardHoverEffect: 'shadow',
      navbarStyle: 'solid',
    },
  },
  {
    name: 'claymorphism',
    label: { en: 'Claymorphism', cs: 'Claymorphism' },
    description: {
      en: 'Soft, colourful 3D clay-like elements with large radius and inflated look.',
      cs: 'Měkké, barevné 3D „plastelínové" prvky s velkým zaoblením a nafouklým vzhledem.',
    },
    category: 'effect',
    borderRadius: 'xl',
    animationLevel: 'high',
    spacing: 'medium',
    typography: {
      bodyFont: 'Nunito',
      headingFont: 'Nunito',
      baseFontSize: 'large',
      lineHeight: 'relaxed',
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
      cardStyle: 'elevated',
      cardHoverEffect: 'scale',
      navbarStyle: 'floating',
    },
  },
  {
    name: 'gradient-heavy',
    label: { en: 'Gradient', cs: 'Gradientový' },
    description: {
      en: 'Gradient borders and glow effects as the primary visual accent.',
      cs: 'Gradientové okraje a záře jako hlavní vizuální akcent.',
    },
    category: 'effect',
    borderRadius: 'medium',
    animationLevel: 'medium',
    spacing: 'medium',
    typography: {
      bodyFont: 'Inter',
      headingFont: 'Plus Jakarta Sans',
      baseFontSize: 'medium',
      lineHeight: 'normal',
      letterSpacing: 'tight',
      headingWeight: '700',
    },
    visualEffects: {
      effectStyle: 'elevated',
      shadowIntensity: 'medium',
      borderStyle: 'none',
      borderWidth: '0px',
    },
    componentStyles: {
      buttonVariant: 'gradient',
      cardStyle: 'gradient-border',
      cardHoverEffect: 'glow',
      navbarStyle: 'blur',
    },
  },
]

export const stylePresetCategories = [
  { name: 'classic', label: { en: 'Classic Styles', cs: 'Klasické styly' } },
  { name: 'effect', label: { en: 'Visual Effects', cs: 'Vizuální efekty' } },
] as const
