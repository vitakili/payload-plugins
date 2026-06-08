'use client'

import { Monitor, Moon, Sun, type LucideIcon } from 'lucide-react'
import React, { useCallback } from 'react'
import { useTheme } from '../providers/Theme/index.js'
import type { Mode } from '../providers/Theme/types.js'
import './ColorModeToggle.css'

export interface ColorModeToggleProps {
  /** Extra class applied to the button (alongside `tm-color-mode-toggle`). */
  className?: string
  style?: React.CSSProperties
  /** Icon size in px. Default 20. */
  size?: number
  /**
   * Cycle light → dark → auto on each click instead of a simple light/dark
   * toggle. Default false.
   */
  includeAuto?: boolean
  /** Disable the View Transitions ripple (falls back to an instant switch). */
  disableAnimation?: boolean
  /** Override the icons used for each mode. */
  icons?: Partial<Record<Mode, LucideIcon>>
  'aria-label'?: string
}

const DEFAULT_ICONS: Record<Mode, LucideIcon> = {
  light: Sun,
  dark: Moon,
  auto: Monitor,
}

type StartViewTransition = (callback: () => void) => { ready: Promise<void> }

/**
 * Drop-in, accessible light/dark (optionally auto) toggle for the front-end.
 *
 * Renders a single icon button wired to the plugin's `ThemeProvider`. When the
 * browser supports the View Transitions API (and the user hasn't requested
 * reduced motion) the theme change animates as a circular "ripple" expanding
 * from the click position.
 *
 * Returns `null` when the admin has disabled the color-mode toggle.
 *
 * @example
 * ```tsx
 * import { ColorModeToggle } from '@kilivi-dev/payloadcms-theme-management/components/ColorModeToggle'
 * <ColorModeToggle />
 * ```
 */
export const ColorModeToggle: React.FC<ColorModeToggleProps> = ({
  className,
  style,
  size = 20,
  includeAuto = false,
  disableAnimation = false,
  icons,
  'aria-label': ariaLabel,
}) => {
  const { mode, setMode, isColorModeToggleAllowed } = useTheme()

  const resolvedCurrent = useCallback((): 'light' | 'dark' => {
    if (typeof document !== 'undefined') {
      const attr = document.documentElement.getAttribute('data-theme-mode')
      if (attr === 'dark' || attr === 'light') return attr
    }
    return mode === 'dark' ? 'dark' : 'light'
  }, [mode])

  const getNextMode = useCallback((): Mode => {
    if (includeAuto) {
      if (mode === 'light') return 'dark'
      if (mode === 'dark') return 'auto'
      return 'light'
    }
    return resolvedCurrent() === 'dark' ? 'light' : 'dark'
  }, [includeAuto, mode, resolvedCurrent])

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const next = getNextMode()
      const prefersReduced =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const canAnimate =
        !disableAnimation &&
        !prefersReduced &&
        typeof document !== 'undefined' &&
        'startViewTransition' in document

      if (!canAnimate) {
        setMode(next)
        return
      }

      const x = event.clientX
      const y = event.clientY
      const endRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y),
      )

      const startViewTransition = (
        document as unknown as { startViewTransition: StartViewTransition }
      ).startViewTransition

      const transition = startViewTransition(() => {
        setMode(next)
      })

      transition.ready
        .then(() => {
          document.documentElement.animate(
            {
              clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`],
            },
            {
              duration: 450,
              easing: 'ease-in-out',
              pseudoElement: '::view-transition-new(root)',
            },
          )
        })
        .catch(() => {
          /* animation is best-effort; the mode change already applied */
        })
    },
    [disableAnimation, getNextMode, setMode],
  )

  // Honour the admin "allow color mode toggle" switch.
  if (isColorModeToggleAllowed === false) {
    return null
  }

  const iconSet = { ...DEFAULT_ICONS, ...icons }
  const activeMode: Mode = mode ?? 'light'
  const Icon = iconSet[activeMode] ?? DEFAULT_ICONS.light

  return (
    <button
      type="button"
      onClick={handleClick}
      className={['tm-color-mode-toggle', className].filter(Boolean).join(' ')}
      style={style}
      aria-label={ariaLabel ?? `Switch color mode (current: ${activeMode})`}
      title={ariaLabel ?? `Color mode: ${activeMode}`}
    >
      <Icon size={size} aria-hidden />
    </button>
  )
}

export default ColorModeToggle
