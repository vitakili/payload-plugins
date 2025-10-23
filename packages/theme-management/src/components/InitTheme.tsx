import React from 'react'
import Script from 'next/script'
import { modeLocalStorageKey } from '../providers/Theme/shared.js'

/**
 * Client-side theme initialization script
 * Prevents FOUC by applying theme mode before React hydration
 * Handles:
 * - System preference detection
 * - User preference from localStorage
 * - Admin-controlled color mode toggle
 * - Auto mode with system preference fallback
 *
 * Note: Uses Next.js Script component with beforeInteractive strategy
 * to ensure theme is applied before React hydration, preventing flash of unstyled content.
 */
export const InitTheme: React.FC = () => {
  const scriptContent = `
  (function () {
    function getImplicitModePreference() {
      var mediaQuery = '(prefers-color-scheme: dark)'
      var mql = window.matchMedia(mediaQuery)
      return mql.matches ? 'dark' : 'light'
    }

    function modeIsValid(mode) {
      return mode === 'light' || mode === 'dark'
    }

    // Get current mode from server-set attribute
    var currentMode = document.documentElement.getAttribute('data-theme-mode')
    var allowToggle = document.documentElement.getAttribute('data-allow-color-mode-toggle') === 'true'
    
    // Only override mode if admin allows toggle and user has preference
    if (allowToggle) {
      var modePreference = window.localStorage.getItem('${modeLocalStorageKey}')
      
      if (modeIsValid(modePreference)) {
        currentMode = modePreference
      } else if (currentMode === 'auto') {
        currentMode = getImplicitModePreference()
      }
    } else if (currentMode === 'auto') {
      // Admin set auto mode - use system preference
      currentMode = getImplicitModePreference()
    }

    // Apply the determined mode
    if (currentMode && modeIsValid(currentMode)) {
      document.documentElement.setAttribute('data-theme-mode', currentMode)
    }

    // Listen for system theme changes only when needed
    if (allowToggle || currentMode === 'auto') {
      var mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      mediaQuery.addEventListener('change', function(e) {
        var shouldUpdate = allowToggle 
          ? !window.localStorage.getItem('${modeLocalStorageKey}')
          : document.documentElement.getAttribute('data-theme-mode') === 'auto'
        
        if (shouldUpdate) {
          document.documentElement.setAttribute('data-theme-mode', e.matches ? 'dark' : 'light')
        }
      })
    }
  })();
  `

  return (
    <Script id="theme-script" strategy="beforeInteractive">
      {scriptContent}
    </Script>
  )
}
