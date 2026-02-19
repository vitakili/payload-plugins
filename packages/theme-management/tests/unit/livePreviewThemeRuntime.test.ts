import {
  buildLivePreviewThemeRuntime,
  extractThemeConfigurationFromLiveData,
} from '../../src/utils/livePreviewThemeRuntime.js'

describe('live preview theme runtime helpers', () => {
  it('extracts themeConfiguration object from global live data payload', () => {
    const input = {
      id: 'appearance-settings',
      themeConfiguration: {
        theme: 'retro',
      },
    }

    expect(extractThemeConfigurationFromLiveData(input)).toEqual({ theme: 'retro' })
  })

  it('falls back to root object when themeConfiguration key does not exist', () => {
    const input = {
      theme: 'cool',
      colorMode: 'light',
    }

    expect(extractThemeConfigurationFromLiveData(input)).toEqual(input)
  })

  it('builds runtime css and resolved attributes from theme configuration', () => {
    const runtime = buildLivePreviewThemeRuntime({
      theme: 'neon',
      colorMode: 'dark',
      borderRadius: 'large',
      lightMode: {
        background: '#ffffff',
        foreground: '#0a0a0a',
      },
      darkMode: {
        background: '#09090b',
        foreground: '#fafafa',
      },
    })

    expect(runtime.theme).toBe('neon')
    expect(runtime.mode).toBe('dark')
    expect(runtime.css).toContain('--radius-default')
    expect(runtime.css).toContain(":root[data-theme='neon']")
    expect(runtime.css).toContain('--background:')
    expect(runtime.css).toContain("[data-theme-mode='dark']")
  })
})
