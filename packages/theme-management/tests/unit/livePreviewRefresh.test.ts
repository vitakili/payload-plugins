import {
  createThemeLivePreviewRefresh,
  DEFAULT_THEME_REVALIDATE_ENDPOINT,
} from '../../src/utils/livePreviewRefresh.js'

describe('createThemeLivePreviewRefresh', () => {
  it('calls endpoint and then runs onAfterRevalidate', async () => {
    const fetchImpl = jest.fn().mockResolvedValue({ ok: true })
    const onAfterRevalidate = jest.fn()

    const refresh = createThemeLivePreviewRefresh({
      endpoint: '/api/theme/revalidate',
      fetchImpl,
      onAfterRevalidate,
    })

    await refresh()

    expect(fetchImpl).toHaveBeenCalledWith('/api/theme/revalidate', {
      method: 'POST',
      credentials: 'include',
      headers: undefined,
    })
    expect(onAfterRevalidate).toHaveBeenCalledTimes(1)
  })

  it('keeps refresh functional even when revalidation request fails', async () => {
    const fetchImpl = jest.fn().mockRejectedValue(new Error('network failure'))
    const onAfterRevalidate = jest.fn()
    const onError = jest.fn()

    const refresh = createThemeLivePreviewRefresh({
      fetchImpl,
      onAfterRevalidate,
      onError,
    })

    await refresh()

    expect(fetchImpl).toHaveBeenCalledWith(DEFAULT_THEME_REVALIDATE_ENDPOINT, {
      method: 'POST',
      credentials: 'include',
      headers: undefined,
    })
    expect(onError).toHaveBeenCalledTimes(1)
    expect(onAfterRevalidate).toHaveBeenCalledTimes(1)
  })
})
