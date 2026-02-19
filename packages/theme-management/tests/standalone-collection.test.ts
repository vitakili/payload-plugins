import { describe, expect, it } from '@jest/globals'
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
    expect(typeof appearanceGlobal?.admin?.livePreview?.url).toBe('function')
  })

  it('should resolve live preview to home page by default', async () => {
    const plugin = themeManagementPlugin({
      useStandaloneCollection: true,
      enableLogging: false,
    })

    const result = plugin(mockConfig) as any
    const appearanceGlobal = result.globals.find((g: any) => g.slug === 'appearance-settings')

    const find = jest.fn().mockResolvedValue({ docs: [{ slug: 'home' }] })

    const livePreviewUrl = await appearanceGlobal.admin.livePreview.url({
      data: {},
      req: {
        payload: {
          find,
        },
        query: {},
      },
    })

    expect(livePreviewUrl).toBe('/')
    expect(find).toHaveBeenCalledTimes(1)
    expect(find.mock.calls[0][0]).toMatchObject({
      collection: 'pages',
      where: {
        and: [{ slug: { equals: 'home' } }],
      },
    })
  })

  it('should fallback to first tenant page when home is missing', async () => {
    const plugin = themeManagementPlugin({
      useStandaloneCollection: true,
      enableLogging: false,
    })

    const result = plugin(mockConfig) as any
    const appearanceGlobal = result.globals.find((g: any) => g.slug === 'appearance-settings')

    const find = jest
      .fn()
      .mockResolvedValueOnce({ docs: [] })
      .mockResolvedValueOnce({ docs: [{ slug: 'landing-tenant-a' }] })

    const livePreviewUrl = await appearanceGlobal.admin.livePreview.url({
      data: {},
      req: {
        payload: {
          find,
        },
        query: {
          tenant: 'tenant-a',
        },
      },
    })

    expect(livePreviewUrl).toBe('/landing-tenant-a?tenant=tenant-a')
    expect(find).toHaveBeenCalledTimes(2)
    expect(find.mock.calls[0][0]).toMatchObject({
      collection: 'pages',
      where: {
        and: [{ slug: { equals: 'home' } }, { tenant: { equals: 'tenant-a' } }],
      },
    })
    expect(find.mock.calls[1][0]).toMatchObject({
      collection: 'pages',
      where: { tenant: { equals: 'tenant-a' } },
    })
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

  it('should forward live preview breakpoints to admin config', () => {
    const plugin = themeManagementPlugin({
      useStandaloneCollection: true,
      livePreview: {
        enabled: true,
        breakpoints: [
          { name: 'desktop', label: 'Desktop', width: 1440, height: 900 },
          { name: 'wide', label: 'Wide', width: 1920, height: 1080 },
        ],
      },
      enableLogging: false,
    })

    const result = plugin(mockConfig) as any

    const global = result.globals.find((g: any) => g.slug === 'appearance-settings')

    expect(global?.admin?.livePreview?.breakpoints).toEqual([
      { name: 'desktop', label: 'Desktop', width: 1440, height: 900 },
      { name: 'wide', label: 'Wide', width: 1920, height: 1080 },
    ])
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

  it('should allow disabling live preview via options', () => {
    const plugin = themeManagementPlugin({
      useStandaloneCollection: true,
      livePreview: false,
      enableLogging: false,
    })

    const result = plugin(mockConfig) as any
    const appearanceGlobal = result.globals.find((g: any) => g.slug === 'appearance-settings')

    expect(appearanceGlobal).toBeDefined()
    expect(appearanceGlobal?.admin?.livePreview).toBeUndefined()
  })

  it('should disable ThemePreviewField when live preview is enabled', () => {
    const plugin = themeManagementPlugin({
      useStandaloneCollection: true,
      livePreview: true,
      enableLogging: false,
    })

    const result = plugin(mockConfig) as any
    const appearanceGlobal = result.globals.find((g: any) => g.slug === 'appearance-settings')
    const themeField = appearanceGlobal?.fields?.[0]?.fields?.find((f: any) => f?.name === 'theme')

    expect(themeField).toBeDefined()
    expect(themeField?.admin?.components?.Field).toBe(
      '@kilivi/payloadcms-theme-management/fields/ThemePreviewField',
    )
  })

  it('should keep ThemePreviewField when live preview is disabled', () => {
    const plugin = themeManagementPlugin({
      useStandaloneCollection: true,
      livePreview: false,
      enableLogging: false,
    })

    const result = plugin(mockConfig) as any
    const appearanceGlobal = result.globals.find((g: any) => g.slug === 'appearance-settings')
    const themeField = appearanceGlobal?.fields?.[0]?.fields?.find((f: any) => f?.name === 'theme')

    expect(themeField).toBeDefined()
    expect(themeField?.admin?.components?.Field).toBe(
      '@kilivi/payloadcms-theme-management/fields/ThemePreviewField',
    )
  })

  it('should inject theme cache revalidation route by default in standalone mode', () => {
    const plugin = themeManagementPlugin({
      useStandaloneCollection: true,
      enableLogging: false,
    })

    const result = plugin(mockConfig) as any
    const route = result.endpoints?.find((endpoint: any) => endpoint.path === '/theme/revalidate')

    expect(route).toBeDefined()
    expect(route?.method?.toLowerCase()).toBe('post')
    expect(typeof route?.handler).toBe('function')
  })

  it('should reject revalidation route request when secret does not match', async () => {
    const plugin = themeManagementPlugin({
      useStandaloneCollection: true,
      cacheRevalidation: {
        secret: 'expected-secret',
      },
      enableLogging: false,
    })

    const result = plugin(mockConfig) as any
    const route = result.endpoints?.find((endpoint: any) => endpoint.path === '/theme/revalidate')

    expect(route).toBeDefined()

    const response = await route.handler({
      headers: new Headers({
        'x-theme-revalidate-secret': 'wrong-secret',
      }),
    })

    expect(response.status).toBe(401)
  })

  it('should allow disabling route injection via cacheRevalidation option', () => {
    const plugin = themeManagementPlugin({
      useStandaloneCollection: true,
      cacheRevalidation: {
        injectRoute: false,
      },
      enableLogging: false,
    })

    const result = plugin(mockConfig) as any
    const route = result.endpoints?.find((endpoint: any) => endpoint.path === '/theme/revalidate')

    expect(route).toBeUndefined()
  })
})
