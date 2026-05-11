'use client'

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { defaultMode, modeLocalStorageKey } from './shared.js'
import type { Mode, ThemeContextType, ThemeDefaults } from './types.js'

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

interface ThemeProviderProps {
  children: React.ReactNode
  initialTheme?: ThemeDefaults
  initialMode?: Mode
  allowColorModeToggle?: boolean
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  initialTheme,
  initialMode,
  allowColorModeToggle = true,
}) => {
  // Light/dark mode state
  const [mode, setMode] = useState<Mode | null>(initialMode || defaultMode)
  const [theme] = useState<ThemeDefaults | null>(initialTheme || null)

  // Resolve the effective mode: "auto" maps to the system preference
  const getResolvedMode = useCallback((currentMode: Mode | null): 'light' | 'dark' => {
    if (currentMode === 'auto' && typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      return mediaQuery.matches ? 'dark' : 'light'
    }
    return currentMode === 'dark' ? 'dark' : 'light'
  }, [])

  // Apply color mode to DOM attributes and CSS variables
  const applyMode = useCallback(
    (currentMode: Mode | null) => {
      if (typeof window !== 'undefined') {
        const resolvedMode = getResolvedMode(currentMode)

        // Read current theme from DOM or fall back to default
        const currentTheme =
          document.documentElement.getAttribute('data-theme') ||
          (typeof theme === 'string' ? theme : 'cool')

        // Set data attributes and classes (compatible with CSS selectors)
        document.documentElement.setAttribute('data-color-mode', resolvedMode)
        document.documentElement.setAttribute('data-theme-mode', resolvedMode)
        document.documentElement.setAttribute('data-theme', currentTheme)
        document.documentElement.classList.remove('light', 'dark', 'auto')
        document.documentElement.classList.add(resolvedMode)

        // Force re-computation of CSS custom properties
        document.documentElement.style.setProperty('--color-mode', resolvedMode)

        // Synchronise data attributes for effect/component styles from CSS vars
        // (set by ServerThemeInjector; this ensures client hydration matches SSR)
        const computedStyle = getComputedStyle(document.documentElement)
        const effectStyle = computedStyle.getPropertyValue('--effect-style').trim()
        const cardStyle = computedStyle.getPropertyValue('--card-style').trim()
        const buttonVariant = computedStyle.getPropertyValue('--button-variant').trim()
        const navbarStyle = computedStyle.getPropertyValue('--navbar-style').trim()
        const cardHoverEffect = computedStyle.getPropertyValue('--card-hover-effect').trim()
        const borderWidth = computedStyle.getPropertyValue('--border-width').trim()

        if (effectStyle) document.documentElement.setAttribute('data-effect-style', effectStyle)
        if (cardStyle) document.documentElement.setAttribute('data-card-style', cardStyle)
        if (buttonVariant)
          document.documentElement.setAttribute('data-button-variant', buttonVariant)
        if (navbarStyle) document.documentElement.setAttribute('data-navbar-style', navbarStyle)
        if (cardHoverEffect)
          document.documentElement.setAttribute('data-card-hover', cardHoverEffect)
        if (borderWidth) document.documentElement.setAttribute('data-border-width', borderWidth)

        // Force repaint to ensure CSS variables update
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        document.documentElement.offsetHeight

        // Dispatch custom event for components that need to react to theme changes
        window.dispatchEvent(
          new CustomEvent('themeChange', {
            detail: { mode: resolvedMode, originalMode: currentMode, theme: currentTheme },
          }),
        )
      }
    },
    [getResolvedMode, theme],
  )

  // Persist the selected mode to localStorage and apply it to the DOM
  const updateMode = useCallback(
    (newMode: Mode | null) => {
      setMode(newMode)
      if (newMode && typeof window !== 'undefined') {
        localStorage.setItem(modeLocalStorageKey, newMode)
        applyMode(newMode)
      }
    },
    [applyMode],
  )

  // Restore mode from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedMode = localStorage.getItem(modeLocalStorageKey) as Mode | null
      if (storedMode && ['light', 'dark', 'auto'].includes(storedMode)) {
        setMode(storedMode)
        applyMode(storedMode)
      } else {
        // Fall back to the default mode
        applyMode(defaultMode)
      }
    }
  }, [applyMode])

  // Listen for system color-scheme changes (only relevant when mode === 'auto')
  useEffect(() => {
    if (mode === 'auto' && typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

      const handleChange = () => {
        applyMode('auto') // Re-evaluate auto mode against current system preference
      }

      mediaQuery.addEventListener('change', handleChange)

      return () => {
        mediaQuery.removeEventListener('change', handleChange)
      }
    }
  }, [mode, applyMode])

  const refreshTheme = useCallback(() => {
    // Re-apply the current mode (e.g. after external DOM changes)
    applyMode(mode)
  }, [mode, applyMode])

  const contextValue = useMemo(
    () => ({
      theme,
      mode,
      setTheme: () => {}, // Theme is set via SSR; client-side mutation is intentionally a no-op
      setMode: updateMode,
      isColorModeToggleAllowed: allowColorModeToggle,
      refreshTheme,
    }),
    [theme, mode, updateMode, allowColorModeToggle, refreshTheme],
  )

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>
}
