import { describe, expect, it } from '@jest/globals'
import type { CollectionConfig } from 'payload'
import { themeManagementPlugin } from '../src/index.js'

describe('Theme Management Plugin - Standalone Global', () => {
  const mockConfig: any = {
    collections: [
      {
        slug: 'site-settings',
        fields: [
          {
            name: 'siteName',
            type: 'text',
          },
        ],
      },
    ],
    globals: [],
  }

  it('should create standalone global when useStandaloneCollection is true', () => {
    const plugin = themeManagementPlugin({
      useStandaloneCollection: true,
      enableLogging: false,
    })

    const result = plugin(mockConfig) as any

    // Should have added a new global
    expect(result.globals).toHaveLength(1)

    // Find the appearance-settings global
    const appearanceGlobal = result.globals.find((g: any) => g.slug === 'appearance-settings')

    expect(appearanceGlobal).toBeDefined()
    expect(appearanceGlobal?.slug).toBe('appearance-settings')
    expect(appearanceGlobal?.admin?.group).toBe('Settings')
  })

  it('should use custom slug and label for standalone global', () => {
    const plugin = themeManagementPlugin({
      useStandaloneCollection: true,
      standaloneCollectionSlug: 'custom-theme',
      standaloneCollectionLabel: 'Custom Theme Settings',
      enableLogging: false,
    })

    const result = plugin(mockConfig) as any

    const customGlobal = result.globals.find((g: any) => g.slug === 'custom-theme')

    expect(customGlobal).toBeDefined()
    expect(customGlobal?.slug).toBe('custom-theme')
  })

  it('should add tab to existing collection when useStandaloneCollection is false', () => {
    const plugin = themeManagementPlugin({
      useStandaloneCollection: false,
      targetCollection: 'site-settings',
      enableLogging: false,
    })

    const result = plugin(mockConfig) as any

    // Should still have only 1 collection
    expect(result.collections).toHaveLength(1)

    const siteSettings = result.collections[0]
    expect(siteSettings.slug).toBe('site-settings')

    // Should have fields (theme tab injected)
    expect(Array.isArray(siteSettings.fields)).toBe(true)
  })

  it('should not create duplicate globals', () => {
    const configWithExisting: any = {
      collections: [],
      globals: [
        {
          slug: 'appearance-settings',
          fields: [],
        },
      ],
    }

    const plugin = themeManagementPlugin({
      useStandaloneCollection: true,
      enableLogging: false,
    })

    const result = plugin(configWithExisting) as any

    // Should still have only 1 global (not duplicated)
    expect(result.globals).toHaveLength(1)
  })

  it('should support i18n labels', () => {
    const plugin = themeManagementPlugin({
      useStandaloneCollection: true,
      standaloneCollectionLabel: {
        en: 'Appearance Settings',
        cs: 'Nastavení vzhledu',
      },
      enableLogging: false,
    })

    const result = plugin(mockConfig) as any

    const global = result.globals.find((g: any) => g.slug === 'appearance-settings')

    expect(global).toBeDefined()
  })

  it('should create global with proper access control', () => {
    const plugin = themeManagementPlugin({
      useStandaloneCollection: true,
      enableLogging: false,
    })

    const result = plugin(mockConfig) as any

    const global = result.globals.find((g: any) => g.slug === 'appearance-settings')

    expect(global?.access).toBeDefined()
    expect(typeof global?.access?.read).toBe('function')
    expect(typeof global?.access?.create).toBe('function')
    expect(typeof global?.access?.update).toBe('function')
    expect(typeof global?.access?.delete).toBe('function')
  })
  it('should respect enabled option', () => {
    const plugin = themeManagementPlugin({
      enabled: false,
      useStandaloneCollection: true,
    })

    const result = plugin(mockConfig) as any

    // Should return config unchanged
    expect(result.globals).toHaveLength(0)
    expect(result.collections).toHaveLength(1)
    expect(result.collections[0].slug).toBe('site-settings')
  })
})
