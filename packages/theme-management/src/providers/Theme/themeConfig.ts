import type { ThemeConfig, ThemeDefaults } from './types.js'

export const themeConfigs: Record<ThemeDefaults, ThemeConfig> = {
  cool: {
    name: 'cool',
    label: 'Cool & Professional',
    borderRadius: 'medium',
    dynamicCSS: true,
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
    dynamicCSS: true,
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
    dynamicCSS: true,
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
    dynamicCSS: true,
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
    dynamicCSS: true,
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
    dynamicCSS: true,
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
    dynamicCSS: true,
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
    dynamicCSS: true,
    preview: {
      colors: {
        primary: 'hsl(25 35% 25%)',
        background: 'hsl(30 8% 98%)',
        accent: 'hsl(35 25% 45%)',
      },
    },
  },
  // Extended 20 color themes (Dynamic CSS generation)
  cyberpunk: {
    name: 'cyberpunk',
    label: 'Cyberpunk Neon',
    borderRadius: 'large',
    dynamicCSS: true,
    preview: {
      colors: {
        primary: 'hsl(320, 25%, 65%)',
        background: 'hsl(180, 2%, 98%)',
        accent: 'hsl(290, 22%, 75%)',
      },
    },
  },
  minimal: {
    name: 'minimal',
    label: 'Minimal Clean',
    borderRadius: 'none',
    dynamicCSS: true,
    preview: {
      colors: {
        primary: 'hsl(0, 0%, 12%)',
        background: 'hsl(0, 0%, 100%)',
        accent: 'hsl(0, 0%, 96%)',
      },
    },
  },
  retro: {
    name: 'retro',
    label: 'Retro Vintage',
    borderRadius: 'small',
    dynamicCSS: true,
    preview: {
      colors: {
        primary: 'hsl(35, 18%, 55%)',
        background: 'hsl(80, 3%, 96%)',
        accent: 'hsl(50, 16%, 68%)',
      },
    },
  },
  pastel: {
    name: 'pastel',
    label: 'Pastel Soft',
    borderRadius: 'xl',
    dynamicCSS: true,
    preview: {
      colors: {
        primary: 'hsl(270, 12%, 70%)',
        background: 'hsl(250, 1%, 98%)',
        accent: 'hsl(300, 8%, 85%)',
      },
    },
  },
  ocean: {
    name: 'ocean',
    label: 'Ocean Deep',
    borderRadius: 'medium',
    dynamicCSS: true,
    preview: {
      colors: {
        primary: 'hsl(230, 18%, 55%)',
        background: 'hsl(220, 2%, 97%)',
        accent: 'hsl(190, 15%, 68%)',
      },
    },
  },
  forest: {
    name: 'forest',
    label: 'Forest Green',
    borderRadius: 'medium',
    dynamicCSS: true,
    preview: {
      colors: {
        primary: 'hsl(145, 16%, 52%)',
        background: 'hsl(145, 2%, 97%)',
        accent: 'hsl(155, 14%, 65%)',
      },
    },
  },
  sunset: {
    name: 'sunset',
    label: 'Sunset Warm',
    borderRadius: 'large',
    dynamicCSS: true,
    preview: {
      colors: {
        primary: 'hsl(35, 20%, 60%)',
        background: 'hsl(50, 3%, 97%)',
        accent: 'hsl(20, 18%, 68%)',
      },
    },
  },
  lavender: {
    name: 'lavender',
    label: 'Lavender Dream',
    borderRadius: 'xl',
    dynamicCSS: true,
    preview: {
      colors: {
        primary: 'hsl(295, 16%, 62%)',
        background: 'hsl(295, 2%, 98%)',
        accent: 'hsl(310, 14%, 72%)',
      },
    },
  },
  neutral: {
    name: 'neutral',
    label: 'Neutral',
    borderRadius: 'medium',
    dynamicCSS: true,
    preview: {
      colors: {
        primary: 'hsl(0, 0%, 0%)',
        background: 'hsl(0, 0%, 99%)',
        accent: 'hsl(0, 0%, 94%)',
      },
    },
  },
  blue: {
    name: 'blue',
    label: 'Blue',
    borderRadius: 'large',
    dynamicCSS: true,
    preview: {
      colors: {
        primary: 'hsl(221, 83%, 53%)',
        background: 'hsl(0, 0%, 100%)',
        accent: 'hsl(0, 0%, 97%)',
      },
    },
  },
  green: {
    name: 'green',
    label: 'Green',
    borderRadius: 'large',
    dynamicCSS: true,
    preview: {
      colors: {
        primary: 'hsl(85, 85%, 35%)',
        background: 'hsl(0, 0%, 100%)',
        accent: 'hsl(0, 0%, 97%)',
      },
    },
  },
  red: {
    name: 'red',
    label: 'Red',
    borderRadius: 'large',
    dynamicCSS: true,
    preview: {
      colors: {
        primary: 'hsl(0, 72%, 51%)',
        background: 'hsl(0, 0%, 100%)',
        accent: 'hsl(0, 0%, 97%)',
      },
    },
  },
  orange: {
    name: 'orange',
    label: 'Orange',
    borderRadius: 'large',
    dynamicCSS: true,
    preview: {
      colors: {
        primary: 'hsl(21, 90%, 48%)',
        background: 'hsl(0, 0%, 100%)',
        accent: 'hsl(0, 0%, 97%)',
      },
    },
  },
  rose: {
    name: 'rose',
    label: 'Rose',
    borderRadius: 'large',
    dynamicCSS: true,
    preview: {
      colors: {
        primary: 'hsl(347, 77%, 50%)',
        background: 'hsl(0, 0%, 100%)',
        accent: 'hsl(0, 0%, 97%)',
      },
    },
  },
  violet: {
    name: 'violet',
    label: 'Violet',
    borderRadius: 'large',
    dynamicCSS: true,
    preview: {
      colors: {
        primary: 'hsl(262, 83%, 58%)',
        background: 'hsl(0, 0%, 100%)',
        accent: 'hsl(0, 0%, 97%)',
      },
    },
  },
  zinc: {
    name: 'zinc',
    label: 'Zinc',
    borderRadius: 'medium',
    dynamicCSS: true,
    preview: {
      colors: {
        primary: 'hsl(286.375, 1%, 14%)',
        background: 'hsl(0, 0%, 100%)',
        accent: 'hsl(286.375, 0%, 96%)',
      },
    },
  },
  slate: {
    name: 'slate',
    label: 'Slate',
    borderRadius: 'medium',
    dynamicCSS: true,
    preview: {
      colors: {
        primary: 'hsl(254.624, 1%, 15%)',
        background: 'hsl(0, 0%, 100%)',
        accent: 'hsl(254.624, 0%, 96%)',
      },
    },
  },
  stone: {
    name: 'stone',
    label: 'Stone',
    borderRadius: 'medium',
    dynamicCSS: true,
    preview: {
      colors: {
        primary: 'hsl(56.365, 1%, 14%)',
        background: 'hsl(0, 0%, 100%)',
        accent: 'hsl(60, 0%, 96%)',
      },
    },
  },
  gray: {
    name: 'gray',
    label: 'Gray',
    borderRadius: 'medium',
    dynamicCSS: true,
    preview: {
      colors: {
        primary: 'hsl(0, 0%, 14%)',
        background: 'hsl(0, 0%, 100%)',
        accent: 'hsl(0, 0%, 96%)',
      },
    },
  },
  glassmorphism: {
    name: 'glassmorphism',
    label: 'Glassmorphism',
    borderRadius: 'large',
    dynamicCSS: true,
    preview: {
      colors: {
        primary: 'oklch(0.60 0.18 250)',
        background: 'oklch(0.97 0.015 230)',
        accent: 'oklch(0.72 0.15 190)',
      },
    },
  },
  claymorphism: {
    name: 'claymorphism',
    label: 'Claymorphism',
    borderRadius: 'xl',
    dynamicCSS: true,
    preview: {
      colors: {
        primary: 'oklch(0.65 0.20 255)',
        background: 'oklch(0.96 0.02 200)',
        accent: 'oklch(0.80 0.12 40)',
      },
    },
  },
  neumorphism: {
    name: 'neumorphism',
    label: 'Neumorphism',
    borderRadius: 'large',
    dynamicCSS: true,
    preview: {
      colors: {
        primary: 'oklch(0.60 0.16 250)',
        background: 'oklch(0.93 0.01 240)',
        accent: 'oklch(0.68 0.14 215)',
      },
    },
  },
  aurora: {
    name: 'aurora',
    label: 'Aurora Borealis',
    borderRadius: 'large',
    dynamicCSS: true,
    preview: {
      colors: {
        primary: 'oklch(0.62 0.18 175)',
        background: 'oklch(0.97 0.02 175)',
        accent: 'oklch(0.72 0.16 300)',
      },
    },
  },
  luxury: {
    name: 'luxury',
    label: 'Luxury Gold',
    borderRadius: 'small',
    dynamicCSS: true,
    preview: {
      colors: {
        primary: 'oklch(0.72 0.14 75)',
        background: 'oklch(0.98 0.01 80)',
        accent: 'oklch(0.62 0.18 55)',
      },
    },
  },
  healthcare: {
    name: 'healthcare',
    label: 'Healthcare Clean',
    borderRadius: 'medium',
    dynamicCSS: true,
    preview: {
      colors: {
        primary: 'oklch(0.55 0.16 218)',
        background: 'oklch(0.99 0.005 210)',
        accent: 'oklch(0.68 0.14 170)',
      },
    },
  },
  nordic: {
    name: 'nordic',
    label: 'Nordic Minimal',
    borderRadius: 'small',
    dynamicCSS: true,
    preview: {
      colors: {
        primary: 'oklch(0.42 0.10 225)',
        background: 'oklch(0.97 0.01 220)',
        accent: 'oklch(0.65 0.10 195)',
      },
    },
  },
  'warm-earth': {
    name: 'warm-earth',
    label: 'Warm Earth',
    borderRadius: 'medium',
    dynamicCSS: true,
    preview: {
      colors: {
        primary: 'oklch(0.52 0.12 50)',
        background: 'oklch(0.97 0.025 75)',
        accent: 'oklch(0.68 0.14 145)',
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
