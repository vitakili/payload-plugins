import type { BorderRadiusPreset } from './types';

export const borderRadiusPresets: Record<string, BorderRadiusPreset> = {
  none: {
    label: 'None',
    css: {
      '--radius-small': '0px',
      '--radius-default': '0px',
      '--radius-medium': '0px',
      '--radius-large': '0px',
      '--radius-xl': '0px',
    },
  },
  small: {
    label: 'Small',
    css: {
      '--radius-small': '0.125rem',
      '--radius-default': '0.25rem',
      '--radius-medium': '0.25rem',
      '--radius-large': '0.5rem',
      '--radius-xl': '0.75rem',
    },
  },
  medium: {
    label: 'Medium',
    css: {
      '--radius-small': '0.25rem',
      '--radius-default': '0.5rem',
      '--radius-medium': '0.75rem',
      '--radius-large': '1rem',
      '--radius-xl': '1.5rem',
    },
  },
  large: {
    label: 'Large',
    css: {
      '--radius-small': '0.4rem',
      '--radius-default': '0.75rem',
      '--radius-medium': '1rem',
      '--radius-large': '1.5rem',
      '--radius-xl': '2rem',
    },
  },
  xl: {
    label: 'Extra Large',
    css: {
      '--radius-small': '0.5rem',
      '--radius-default': '1rem',
      '--radius-medium': '1.5rem',
      '--radius-large': '2rem',
      '--radius-xl': '3rem',
    },
  },
  full: {
    label: 'Full',
    css: {
      '--radius-small': '9999px',
      '--radius-default': '9999px',
      '--radius-medium': '9999px',
      '--radius-large': '9999px',
      '--radius-xl': '9999px',
    },
  },
};

export function getBorderRadiusConfig(key: string): BorderRadiusPreset | undefined {
  return borderRadiusPresets[key];
}
