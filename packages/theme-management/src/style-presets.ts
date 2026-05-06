/**
 * Style presets — define visual style (effects, component defaults, layout)
 * WITHOUT touching color palettes.
 *
 * A user can combine any color preset (ThemePreset) with any style preset (StylePreset).
 */

export interface StylePreset {
  name: string
  label: { en: string; cs: string }
  description: { en: string; cs: string }
  category: 'classic' | 'effect'
  borderRadius?: 'none' | 'small' | 'medium' | 'large' | 'xl'
  animationLevel?: 'none' | 'reduced' | 'medium' | 'high'
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
