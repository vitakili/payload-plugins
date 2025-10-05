import type { BorderRadiusPreset } from './types';

export const borderRadiusPresets: Record<string, BorderRadiusPreset> = {
  none: {
    label: 'None',
    css: '0px',
  },
  sm: {
    label: 'Small',
    css: '0.25rem',
  },
  md: {
    label: 'Medium',
    css: '0.5rem',
  },
  lg: {
    label: 'Large',
    css: '1rem',
  },
  xl: {
    label: 'Extra Large',
    css: '1.5rem',
  },
  full: {
    label: 'Full',
    css: '9999px',
  },
};

export function getBorderRadiusConfig(key: string): BorderRadiusPreset | undefined {
  return borderRadiusPresets[key];
}
