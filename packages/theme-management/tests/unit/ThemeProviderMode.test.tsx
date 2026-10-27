import { render } from '@testing-library/react'
import React from 'react'

import { ThemeProvider } from '../../src/providers/Theme/index.js'
import { modeLocalStorageKey } from '../../src/providers/Theme/shared.js'

/** jsdom has no matchMedia; this one says the system prefers light. */
const mockSystemPrefersLight = () => {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }),
  })
}

describe('ThemeProvider colour mode on first load', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme-mode')
    mockSystemPrefersLight()
  })

  it("applies the site's configured mode when the visitor has no preference", () => {
    render(
      <ThemeProvider initialMode="dark">
        <span />
      </ThemeProvider>,
    )
    expect(document.documentElement.getAttribute('data-theme-mode')).toBe('dark')
  })

  it("lets a visitor's stored choice win over the site's mode", () => {
    localStorage.setItem(modeLocalStorageKey, 'light')
    render(
      <ThemeProvider initialMode="dark">
        <span />
      </ThemeProvider>,
    )
    expect(document.documentElement.getAttribute('data-theme-mode')).toBe('light')
  })

  it('follows the system preference when the site leaves it on auto', () => {
    render(
      <ThemeProvider>
        <span />
      </ThemeProvider>,
    )
    expect(document.documentElement.getAttribute('data-theme-mode')).toBe('light')
  })
})
