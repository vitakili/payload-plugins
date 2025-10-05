'use client'

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { defaultMode, modeLocalStorageKey } from './shared'
import type { Mode, ThemeContextType, ThemeDefaults } from './types'

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
  // State pro light/dark mode switching
  const [mode, setMode] = useState<Mode | null>(initialMode || defaultMode)
  const [theme] = useState<ThemeDefaults | null>(initialTheme || null)

  // Funkce pro získání skutečného módu (resolve "auto" mode)
  const getResolvedMode = useCallback((currentMode: Mode | null): 'light' | 'dark' => {
    if (currentMode === 'auto' && typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      return mediaQuery.matches ? 'dark' : 'light'
    }
    return currentMode === 'dark' ? 'dark' : 'light'
  }, [])

  // Aplikace módu na DOM a CSS variables
  const applyMode = useCallback(
    (currentMode: Mode | null) => {
      if (typeof window !== 'undefined') {
        const resolvedMode = getResolvedMode(currentMode)

        // Získej aktuální theme z DOM nebo použij fallback
        const currentTheme =
          document.documentElement.getAttribute('data-theme') ||
          (typeof theme === 'string' ? theme : 'cool')

        // Aplikuj data atributy a třídy (kompatibilní s CSS selektory)
        document.documentElement.setAttribute('data-color-mode', resolvedMode)
        document.documentElement.setAttribute('data-theme-mode', resolvedMode)
        document.documentElement.setAttribute('data-theme', currentTheme)
        document.documentElement.classList.remove('light', 'dark', 'auto')
        document.documentElement.classList.add(resolvedMode)

        // Force re-computation of CSS custom properties
        document.documentElement.style.setProperty('--color-mode', resolvedMode)

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

  // Uložení light/dark mode do localStorage a aplikace
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

  // Načtení mode z localStorage při startu
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedMode = localStorage.getItem(modeLocalStorageKey) as Mode | null
      if (storedMode && ['light', 'dark', 'auto'].includes(storedMode)) {
        setMode(storedMode)
        applyMode(storedMode)
      } else {
        // Fallback na default mode
        applyMode(defaultMode)
      }
    }
  }, [applyMode])

  // Listener pro změny system preference (pouze při auto mode)
  useEffect(() => {
    if (mode === 'auto' && typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

      const handleChange = () => {
        applyMode('auto') // Re-resolve auto mode
      }

      mediaQuery.addEventListener('change', handleChange)

      return () => {
        mediaQuery.removeEventListener('change', handleChange)
      }
    }
  }, [mode, applyMode])

  const refreshTheme = useCallback(() => {
    // Refresh theme - aplikuj aktuální mode
    applyMode(mode)
  }, [mode, applyMode])

  const contextValue = useMemo(
    () => ({
      theme,
      mode,
      setTheme: () => {}, // Nepoužíváme - theme se nastavuje přes SSR
      setMode: updateMode,
      isColorModeToggleAllowed: allowColorModeToggle,
      refreshTheme,
    }),
    [theme, mode, updateMode, allowColorModeToggle, refreshTheme],
  )

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>
}
