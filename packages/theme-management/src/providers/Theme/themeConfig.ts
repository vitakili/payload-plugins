import type { ThemeConfig, ThemeDefaults } from './types.js'

export const themeConfigs: Record<ThemeDefaults, ThemeConfig> = {
  cool: {
    name: 'cool',
    label: 'Cool & Professional',
    borderRadius: 'medium',
    cssFile: '/themes/cool.css',
    preview: {
      colors: {
        primary: 'hsl(221 83% 53%)',
        background: 'hsl(0 0% 100%)',
        accent: 'hsl(210 40% 95%)',
      },
    },
  },
  brutal: {
    name: 'brutal',
    label: 'Modern Brutalism',
    borderRadius: 'none',
    cssFile: '/themes/brutal.css',
    preview: {
      colors: {
        primary: 'hsl(0 0% 0%)',
        background: 'hsl(0 0% 100%)',
        accent: 'hsl(0 72% 51%)',
      },
    },
  },
  neon: {
    name: 'neon',
    label: 'Neon Cyberpunk',
    borderRadius: 'medium',
    cssFile: '/themes/neon.css',
    preview: {
      colors: {
        primary: 'hsl(263 90% 51%)',
        background: 'hsl(230 25% 5%)',
        accent: 'hsl(180 100% 50%)',
      },
    },
  },
  solar: {
    name: 'solar',
    label: 'Solar',
    borderRadius: 'large',
    cssFile: '/themes/solar.css',
    preview: {
      colors: {
        primary: 'hsl(20 90% 45%)',
        background: 'hsl(40 30% 95%)',
        accent: 'hsl(40 100% 50%)',
      },
    },
  },
  dealership: {
    name: 'dealership',
    label: 'Dealership',
    borderRadius: 'medium',
    cssFile: '/themes/dealership.css',
    preview: {
      colors: {
        primary: 'hsl(225 25% 25%)',
        background: 'hsl(0 0% 98%)',
        accent: 'hsl(15 85% 55%)',
      },
    },
  },
  'real-estate': {
    name: 'real-estate',
    label: 'Real Estate Blue',
    borderRadius: 'large',
    cssFile: '/themes/real-estate.css',
    preview: {
      colors: {
        primary: 'hsl(220 90% 48%)',
        background: 'hsl(220 40% 98.5%)',
        accent: 'hsl(210 85% 55%)',
      },
    },
  },
  'real-estate-gold': {
    name: 'real-estate-gold',
    label: 'Real Estate Gold',
    borderRadius: 'large',
    cssFile: '/themes/real-estate-gold.css',
    preview: {
      colors: {
        primary: 'hsl(38 75% 45%)',
        background: 'hsl(45 25% 97%)',
        accent: 'hsl(42 85% 55%)',
      },
    },
  },
  'real-estate-neutral': {
    name: 'real-estate-neutral',
    label: 'Real Estate Neutral',
    borderRadius: 'large',
    cssFile: '/themes/real-estate-neutral.css',
    preview: {
      colors: {
        primary: 'hsl(25 35% 25%)',
        background: 'hsl(30 8% 98%)',
        accent: 'hsl(35 25% 45%)',
      },
    },
  },
}

export const borderRadiusPresets = {
  none: {
    label: 'None',
    value: 'none',
    css: {
      '--radius-xs': '0',
      '--radius-small': '0',
      '--radius-default': '0',
      '--radius-medium': '0',
      '--radius-large': '0',
      '--radius-xl': '0',
    },
  },
  small: {
    label: 'Small',
    value: 'small',
    css: {
      '--radius-xs': '0.125rem',
      '--radius-small': '0.25rem',
      '--radius-default': '0.375rem',
      '--radius-medium': '0.5rem',
      '--radius-large': '0.75rem',
      '--radius-xl': '1rem',
    },
  },
  medium: {
    label: 'Medium',
    value: 'medium',
    css: {
      '--radius-xs': '0.25rem',
      '--radius-small': '0.5rem',
      '--radius-default': '0.75rem',
      '--radius-medium': '1rem',
      '--radius-large': '1.5rem',
      '--radius-xl': '2rem',
    },
  },
  large: {
    label: 'Large',
    value: 'large',
    css: {
      '--radius-xs': '0.5rem',
      '--radius-small': '0.75rem',
      '--radius-default': '1rem',
      '--radius-medium': '1.5rem',
      '--radius-large': '2rem',
      '--radius-xl': '2.5rem',
    },
  },
  xl: {
    label: 'Extra Large',
    value: 'xl',
    css: {
      '--radius-xs': '0.75rem',
      '--radius-small': '1rem',
      '--radius-default': '1.5rem',
      '--radius-medium': '2rem',
      '--radius-large': '2.5rem',
      '--radius-xl': '3rem',
    },
  },
} as const

export function getThemeConfig(theme: ThemeDefaults): ThemeConfig {
  return themeConfigs[theme]
}

export function getBorderRadiusConfig(preset: keyof typeof borderRadiusPresets) {
  return borderRadiusPresets[preset]
}
