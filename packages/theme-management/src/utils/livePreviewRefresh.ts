export interface CreateThemeLivePreviewRefreshOptions {
  /** Endpoint exposed by theme-management plugin for cache revalidation. */
  endpoint?: string
  /** Optional secret sent as x-theme-revalidate-secret header. */
  secret?: string
  /** Request credentials mode (default: include). */
  credentials?: RequestCredentials
  /** Optional callback triggered when revalidation request fails. */
  onError?: (error: unknown) => void
  /** Optional callback executed after revalidation attempt (typically router.refresh). */
  onAfterRevalidate?: () => void | Promise<void>
  /** Test hook to override fetch implementation. */
  fetchImpl?: typeof fetch
}

export const DEFAULT_THEME_REVALIDATE_ENDPOINT = '/api/theme/revalidate'

export const createThemeLivePreviewRefresh = (
  options: CreateThemeLivePreviewRefreshOptions = {},
): (() => Promise<void>) => {
  const {
    endpoint = process.env.NEXT_PUBLIC_THEME_REVALIDATE_ENDPOINT ||
      DEFAULT_THEME_REVALIDATE_ENDPOINT,
    secret = process.env.NEXT_PUBLIC_THEME_REVALIDATE_SECRET,
    credentials = 'include',
    onError,
    onAfterRevalidate,
    fetchImpl = fetch,
  } = options

  return async () => {
    try {
      await fetchImpl(endpoint, {
        method: 'POST',
        credentials,
        headers: secret
          ? {
              'x-theme-revalidate-secret': secret,
            }
          : undefined,
      })
    } catch (error) {
      onError?.(error)
    }

    await onAfterRevalidate?.()
  }
}
