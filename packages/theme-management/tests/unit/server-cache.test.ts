const revalidateTagMock = jest.fn()
const revalidatePathMock = jest.fn()
const unstableCacheMock = jest.fn((fn: () => Promise<unknown>) => fn)

jest.mock('server-only', () => ({}))

jest.mock('next/cache', () => ({
  revalidateTag: (...args: unknown[]) => revalidateTagMock(...args),
  revalidatePath: (...args: unknown[]) => revalidatePathMock(...args),
  unstable_cache: unstableCacheMock,
}))

let createCachedThemeFetcher: typeof import('../../src/server.js').createCachedThemeFetcher
let getThemeCacheTag: typeof import('../../src/server.js').getThemeCacheTag
let revalidateThemeCache: typeof import('../../src/server.js').revalidateThemeCache

beforeAll(async () => {
  const serverHelpers = await import('../../src/server.js')
  createCachedThemeFetcher = serverHelpers.createCachedThemeFetcher
  getThemeCacheTag = serverHelpers.getThemeCacheTag
  revalidateThemeCache = serverHelpers.revalidateThemeCache
})

describe('server cache helpers', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('builds default cache tag from global slug', () => {
    expect(getThemeCacheTag()).toBe('global_appearance-settings')
    expect(getThemeCacheTag('custom-appearance')).toBe('global_custom-appearance')
  })

  it('creates cached theme fetcher with default tag and options', async () => {
    const loadAppearanceSettings = jest.fn().mockResolvedValue({
      themeConfiguration: {
        lightMode: {
          background: '#111111',
          foreground: '#fefefe',
        },
      },
    })

    const getCachedTheme = createCachedThemeFetcher({
      loadAppearanceSettings,
      globalSlug: 'appearance-settings',
      revalidate: 600,
      cacheKeyParts: ['tenant-a'],
      tags: ['tenant:tenant-a'],
    })

    const result = await getCachedTheme()

    expect(loadAppearanceSettings).toHaveBeenCalledTimes(1)
    expect(unstableCacheMock).toHaveBeenCalledWith(
      expect.any(Function),
      ['appearance-settings-theme', 'tenant-a'],
      {
        tags: ['global_appearance-settings', 'tenant:tenant-a'],
        revalidate: 600,
      },
    )
    expect(result).toEqual(
      expect.objectContaining({
        lightMode: expect.objectContaining({
          background: '#111111',
          foreground: '#fefefe',
        }),
      }),
    )
  })

  it('revalidates default global tag and additional paths', async () => {
    const result = await revalidateThemeCache({
      globalSlug: 'appearance-settings',
      tags: ['tenant:tenant-a'],
      paths: ['/'],
    })

    expect(revalidateTagMock).toHaveBeenCalledWith('global_appearance-settings')
    expect(revalidateTagMock).toHaveBeenCalledWith('tenant:tenant-a')
    expect(revalidatePathMock).toHaveBeenCalledWith('/')
    expect(result).toEqual({
      tags: ['global_appearance-settings', 'tenant:tenant-a'],
      paths: ['/'],
    })
  })
})
