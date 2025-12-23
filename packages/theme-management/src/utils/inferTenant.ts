export function inferTenantFromUrl(): string | undefined {
  if (typeof window === 'undefined') return undefined
  try {
    const params = new URLSearchParams(window.location.search)
    return params.get('tenant') ?? params.get('tenantSlug') ?? params.get('tenantId') ?? undefined
  } catch (e) {
    return undefined
  }
}

export function inferTenantFromCookie(): string | undefined {
  if (typeof document === 'undefined' || !document.cookie) return undefined
  try {
    const cookies = document.cookie.split(';').map((c) => c.trim())
    for (const c of cookies) {
      const [k, v] = c.split('=')
      const key = k?.trim().toLowerCase()
      if (!key || !v) continue
      if (
        [
          'tenant',
          'tenantslug',
          'tenant-slug',
          'x-tenant-id',
          'x-tenant',
          'payload-tenant',
          'payload-tenant-slug',
        ].includes(key)
      )
        return decodeURIComponent(v)
    }
    return undefined
  } catch (e) {
    return undefined
  }
}

export function inferTenantFromGlobal(): string | undefined {
  if (typeof window === 'undefined') return undefined
  try {
    const anyWin = window as unknown as Record<string, any>
    return (
      anyWin?.__payload?.tenant?.slug ||
      anyWin?.payload?.tenant ||
      anyWin?.__PAYLOAD__?.tenantSlug ||
      anyWin?.PAYLOAD?.tenantSlug ||
      undefined
    )
  } catch (e) {
    return undefined
  }
}

export function inferTenantFromDomAttr(): string | undefined {
  if (typeof document === 'undefined') return undefined
  try {
    // Look for common attributes placed on parent elements in the admin UI
    const el = document.querySelector('[data-selected-tenant-id], [data-selected-tenant-slug]')
    if (!el) return undefined
    const value =
      el.getAttribute('data-selected-tenant-id') ?? el.getAttribute('data-selected-tenant-slug')
    return value && value.length > 0 ? value : undefined
  } catch (e) {
    return undefined
  }
}

export function inferTenant(customTenant?: string): string | undefined {
  // Order: explicit override -> URL params -> global runtime -> DOM attribute -> cookie
  return (
    customTenant ??
    inferTenantFromUrl() ??
    inferTenantFromGlobal() ??
    inferTenantFromDomAttr() ??
    inferTenantFromCookie()
  )
}
