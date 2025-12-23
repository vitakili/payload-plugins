import { inferTenant, inferTenantFromCookie } from '../../src/utils/inferTenant.js'

describe('inferTenant utils', () => {
  beforeEach(() => {
    // default cookie
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: '',
    })
    // clear DOM
    document.body.innerHTML = ''
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

  it('reads data-selected-tenant-id from DOM attribute', () => {
    document.body.innerHTML = '<span data-selected-tenant-id="Silverigo"></span>'
    const tenant = inferTenant()
    expect(tenant).toBe('Silverigo')
  })

  it('prefers DOM attribute over cookie when both present', () => {
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: 'payload-tenant=OtherTenant; other=1',
    })
    document.body.innerHTML = '<div><span data-selected-tenant-id="Silverigo"></span></div>'

    const tenant = inferTenant()
    expect(tenant).toBe('Silverigo')
  })
})
