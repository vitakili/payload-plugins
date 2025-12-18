/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable import/no-anonymous-default-export */
import defaultTheme from 'tailwindcss/defaultTheme'

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  safelist: [
    // Grid columns
    'col-span-4',
    'md:col-span-2',
    'lg:col-span-4',
    'lg:col-span-6',
    'lg:col-span-8',
    'lg:col-span-12',
    // Border colors
    'border-border',
    'border-error',
    'border-success',
    'border-warning',
    // Background colors
    'bg-card',
    'bg-error/30',
    'bg-success/30',
    'bg-warning/30',
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: 'var(--layout-containerPadding)',
        md: 'var(--layout-containerPaddingTablet)',
        lg: 'var(--layout-containerPaddingDesktop)',
      },
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
      },
    },
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: 'var(--card)',
        'card-foreground': 'var(--card-foreground)',
        popover: 'var(--popover)',
        'popover-foreground': 'var(--popover-foreground)',
        primary: 'var(--primary)',
        'primary-foreground': 'var(--primary-foreground)',
        secondary: 'var(--secondary)',
        'secondary-foreground': 'var(--secondary-foreground)',
        muted: 'var(--muted)',
        'muted-foreground': 'var(--muted-foreground)',
        accent: 'var(--accent)',
        'accent-foreground': 'var(--accent-foreground)',
        destructive: 'var(--destructive)',
        'destructive-foreground': 'var(--destructive-foreground)',
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        success: 'var(--success)',
        'success-foreground': 'var(--success-foreground)',
        warning: 'var(--warning)',
        'warning-foreground': 'var(--warning-foreground)',
        error: 'var(--error)',
        'error-foreground': 'var(--error-foreground)',
        info: 'var(--info)',
        'info-foreground': 'var(--info-foreground)',
      },
      borderRadius: {
        sm: 'var(--radius-small)',
        DEFAULT: 'var(--radius-default)',
        md: 'var(--radius-medium)',
        lg: 'var(--radius-large)',
      },
      fontFamily: {
        sans: ['var(--typography-fontFamily)', ...defaultTheme.fontFamily.sans],
        heading: ['var(--typography-headingFamily)', ...defaultTheme.fontFamily.sans],
        mono: ['var(--font-geist-mono)', ...defaultTheme.fontFamily.mono],
      },
      fontSize: {
        base: ['var(--typography-baseFontSize)', { lineHeight: 'var(--typography-lineHeight)' }],
      },
      letterSpacing: {
        tight: 'var(--typography-letterSpacing-tight)',
        normal: 'var(--typography-letterSpacing-normal)',
        wide: 'var(--typography-letterSpacing-wide)',
      },
      fontWeight: {
        normal: 'var(--typography-fontWeights-normal)',
        medium: 'var(--typography-fontWeights-medium)',
        semibold: 'var(--typography-fontWeights-semibold)',
        bold: 'var(--typography-fontWeights-bold)',
      },
      spacing: {
        section: {
          DEFAULT: 'var(--layout-sectionSpacing)',
          md: 'var(--layout-sectionSpacingTablet)',
          lg: 'var(--layout-sectionSpacingDesktop)',
        },
      },
      transitionProperty: {
        button: 'var(--components-button-transition)',
      },
      scale: {
        'button-hover': 'var(--components-button-hover-scale)',
      },
      opacity: {
        'button-hover': 'var(--components-button-hover-opacity)',
      },
      boxShadow: {
        card: 'var(--components-card-shadow)',
      },
      padding: {
        card: 'var(--components-card-padding)',
        button: 'var(--components-button-padding)',
        input: 'var(--components-input-padding)',
      },
      height: {
        input: 'var(--components-input-height)',
      },
      typography: ({ theme }) => ({
        DEFAULT: {
          css: {
            '--tw-prose-body': theme('colors.foreground'),
            '--tw-prose-headings': theme('colors.foreground'),
            '--tw-prose-lead': theme('colors.muted.foreground'),
            '--tw-prose-links': theme('colors.primary'),
            '--tw-prose-bold': theme('colors.foreground'),
            '--tw-prose-counters': theme('colors.foreground'),
            '--tw-prose-bullets': theme('colors.foreground'),
            '--tw-prose-hr': theme('colors.border'),
            '--tw-prose-quotes': theme('colors.foreground'),
            '--tw-prose-quote-borders': theme('colors.border'),
            '--tw-prose-captions': theme('colors.muted.foreground'),
            '--tw-prose-code': theme('colors.foreground'),
            '--tw-prose-pre-code': theme('colors.foreground'),
            '--tw-prose-pre-bg': theme('colors.muted'),
            '--tw-prose-th-borders': theme('colors.border'),
            '--tw-prose-td-borders': theme('colors.border'),
            h1: {
              fontWeight: 'var(--typography-fontWeights-bold)',
              marginBottom: '0.25em',
              fontFamily: theme('fontFamily.heading'),
              letterSpacing: 'var(--typography-letterSpacing-tight)',
            },
            h2: {
              fontFamily: theme('fontFamily.heading'),
              fontWeight: 'var(--typography-fontWeights-semibold)',
              letterSpacing: 'var(--typography-letterSpacing-tight)',
            },
            h3: {
              fontFamily: theme('fontFamily.heading'),
              fontWeight: 'var(--typography-fontWeights-semibold)',
              letterSpacing: 'var(--typography-letterSpacing-tight)',
            },
            h4: {
              fontFamily: theme('fontFamily.heading'),
              fontWeight: 'var(--typography-fontWeights-medium)',
              letterSpacing: 'var(--typography-letterSpacing-normal)',
            },
          },
        },
        base: {
          css: [
            {
              h1: { fontSize: '2.5rem' },
              h2: { fontSize: '1.25rem' },
            },
          ],
        },
        md: {
          css: [
            {
              h1: { fontSize: '3.5rem' },
              h2: { fontSize: '1.5rem' },
            },
          ],
        },
        invert: {
          css: {
            '--tw-prose-body': 'var(--foreground)',
            '--tw-prose-headings': 'var(--foreground)',
            '--tw-prose-lead': 'var(--muted-foreground)',
            '--tw-prose-links': 'var(--primary)',
            '--tw-prose-bold': 'var(--foreground)',
            '--tw-prose-counters': 'var(--foreground)',
            '--tw-prose-bullets': 'var(--foreground)',
            '--tw-prose-hr': 'var(--border)',
            '--tw-prose-quotes': 'var(--foreground)',
            '--tw-prose-quote-borders': 'var(--border)',
            '--tw-prose-captions': 'var(--muted-foreground)',
            '--tw-prose-code': 'var(--foreground)',
            '--tw-prose-pre-code': 'var(--foreground)',
            '--tw-prose-pre-bg': 'var(--muted)',
            '--tw-prose-th-borders': 'var(--border)',
            '--tw-prose-td-borders': 'var(--border)',
          },
        },
      }),
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
      keyframes: {
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 },
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate'), require('@tailwindcss/typography')],
}
