import { inferTenant, inferTenantFromCookie } from '../../src/utils/inferTenant.js'

describe('inferTenant utils', () => {
  beforeEach(() => {
    // default cookie
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: '',
    })
  })

  it('reads payload-tenant from cookie', () => {
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: 'payload-tenant=Silverigo; other=1',
    })

    const tenant = inferTenantFromCookie()
    expect(tenant).toBe('Silverigo')
  })

  it('inferTenant prefers explicit custom value over cookie', () => {
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: 'payload-tenant=Silverigo; other=1',
    })

    const tenant = inferTenant('MyExplicit')
    expect(tenant).toBe('MyExplicit')
  })
})
