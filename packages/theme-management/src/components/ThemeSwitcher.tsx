'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { allThemePresets, type ThemePreset } from '../presets.js'
import { themeLocalStorageKey } from '../providers/Theme/shared.js'
import { generateThemeColorsCss } from '../utils/themeColors.js'

const STYLE_ID = 'tm-theme-switcher-css'

export type SwitchablePreset = Pick<ThemePreset, 'name' | 'label' | 'lightMode' | 'darkMode'>

export interface ThemeSwitcherProps {
  /**
   * Presets the visitor can switch between. Defaults to all bundled presets.
   * Pass a curated subset for a focused switcher.
   */
  presets?: SwitchablePreset[]
  className?: string
  style?: React.CSSProperties
  'aria-label'?: string
  /** Persist the choice to localStorage and restore it on load. Default true. */
  persist?: boolean
  /** Called after a preset is applied. */
  onChange?: (presetName: string) => void
}

const applyPreset = (preset: SwitchablePreset): void => {
  if (typeof document === 'undefined') return

  // Generate with the preset name so selectors match `:root[data-theme='name']`
  // and override the SSR-injected theme (same specificity, injected later wins).
  const css = generateThemeColorsCss({
    themeName: preset.name,
    lightMode: preset.lightMode,
    darkMode: preset.darkMode,
  })

  let styleElement = document.getElementById(STYLE_ID) as HTMLStyleElement | null
  if (!styleElement) {
    styleElement = document.createElement('style')
    styleElement.id = STYLE_ID
    document.head.appendChild(styleElement)
  }
  styleElement.innerHTML = css
  document.documentElement.setAttribute('data-theme', preset.name)
}

/**
 * Front-end theme-preset switcher. Lets visitors swap between bundled (or a
 * curated subset of) theme presets at runtime by injecting the preset's colour
 * CSS and updating `data-theme`. The choice is persisted to localStorage and
 * restored on the next visit.
 *
 * Note: colour-mode (light/dark) is handled by {@link ColorModeToggle} and the
 * SSR injector with no flash; preset switching re-applies on mount, so a brief
 * flash to the SSR default can occur before the stored preset is restored.
 *
 * @example
 * ```tsx
 * import { ThemeSwitcher } from '@kilivi-dev/payloadcms-theme-management/components/ThemeSwitcher'
 * <ThemeSwitcher presets={[oceanPreset, forestPreset]} />
 * ```
 */
export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  presets,
  className,
  style,
  'aria-label': ariaLabel,
  persist = true,
  onChange,
}) => {
  const list: SwitchablePreset[] = presets && presets.length > 0 ? presets : allThemePresets
  const [selected, setSelected] = useState<string>('')

  // Restore the stored preset (or reflect the current data-theme) after mount.
  useEffect(() => {
    if (typeof document === 'undefined') return

    const current = document.documentElement.getAttribute('data-theme') ?? ''
    const stored = persist ? window.localStorage.getItem(themeLocalStorageKey) : null
    const initial = stored && list.some((p) => p.name === stored) ? stored : current

    if (initial) {
      setSelected(initial)
      const preset = list.find((p) => p.name === initial)
      // Only re-inject when the stored preset differs from what SSR rendered.
      if (preset && stored && stored !== current) {
        applyPreset(preset)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const name = event.target.value
      const preset = list.find((p) => p.name === name)
      if (!preset) return

      setSelected(name)
      applyPreset(preset)
      if (persist) {
        window.localStorage.setItem(themeLocalStorageKey, name)
      }
      onChange?.(name)
    },
    [list, persist, onChange],
  )

  return (
    <select
      value={selected}
      onChange={handleChange}
      className={className}
      style={style}
      aria-label={ariaLabel ?? 'Select theme'}
    >
      {list.map((preset) => (
        <option key={preset.name} value={preset.name}>
          {preset.label}
        </option>
      ))}
    </select>
  )
}

export default ThemeSwitcher
