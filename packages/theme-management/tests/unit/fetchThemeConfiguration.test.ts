import { fetchThemeConfiguration } from '../../src/index.js'

describe('fetchThemeConfiguration URL building', () => {
  let origFetch: typeof fetch

  beforeEach(() => {
    origFetch = global.fetch
    global.fetch = jest.fn(async () => ({ ok: true, json: async () => ({}) })) as any
  })

  afterEach(() => {
    global.fetch = origFetch
    jest.resetAllMocks()
  })

  it('adds where[tenant][equals] for collection fetches', async () => {
    await fetchThemeConfiguration({ tenantSlug: 't1', collectionSlug: 'site-settings' })
    const called = (global.fetch as jest.Mock).mock.calls[0][0] as string
    expect(called).toContain('/api/site-settings?')
    expect(called).toContain('where%5Btenant%5D%5Bequals%5D=t1') // encoded where[tenant][equals]=t1
  })

  it('includes where[tenant][equals] for global fetches and keeps tenant param', async () => {
    await fetchThemeConfiguration({
      tenantSlug: 't1',
      collectionSlug: 'appearance-settings',
      useGlobal: true,
    })
    const called = (global.fetch as jest.Mock).mock.calls[0][0] as string
    expect(called).toContain('/api/globals/appearance-settings')
    expect(called).toContain('tenant=t1')
    expect(called).toContain('where%5Btenant%5D%5Bequals%5D=t1')
  })
})
