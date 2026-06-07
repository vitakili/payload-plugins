/**
 * Shared device-preview definitions used by:
 *  - the in-admin live preview panels (AppearancePreviewField / ThemePreviewField device switcher)
 *  - the native Payload Live Preview toolbar (admin.livePreview.breakpoints)
 *
 * Keeping a single source of truth means the device chrome shown inside the
 * theme editor matches the iframe sizes editors get in the real Live Preview.
 */

export type DevicePreviewId = 'mobile' | 'tablet' | 'desktop'

export type DevicePreview = {
  /** Stable identifier, also used as Payload breakpoint `name`. */
  id: DevicePreviewId
  /** Human-readable label (bilingual handled at the UI layer). */
  label: string
  /** Czech label for admin UI. */
  labelCs: string
  /** Viewport width in px. */
  width: number
  /** Viewport height in px. */
  height: number
}

export const DEVICE_PREVIEWS: readonly DevicePreview[] = [
  {
    id: 'mobile',
    label: 'Mobile',
    labelCs: 'Mobil',
    width: 390,
    height: 844,
  },
  {
    id: 'tablet',
    label: 'Tablet',
    labelCs: 'Tablet',
    width: 768,
    height: 1024,
  },
  {
    id: 'desktop',
    label: 'Desktop',
    labelCs: 'Desktop',
    width: 1440,
    height: 900,
  },
] as const

export const DEFAULT_DEVICE_PREVIEW_ID: DevicePreviewId = 'desktop'

export const getDevicePreview = (id: DevicePreviewId): DevicePreview =>
  DEVICE_PREVIEWS.find((device) => device.id === id) ?? DEVICE_PREVIEWS[DEVICE_PREVIEWS.length - 1]

/**
 * Default breakpoints for Payload's native Live Preview toolbar.
 * Derived from DEVICE_PREVIEWS so both stay in sync.
 */
export const DEFAULT_LIVE_PREVIEW_BREAKPOINTS: Array<{
  name: string
  label: string
  width: number
  height: number
}> = DEVICE_PREVIEWS.map((device) => ({
  name: device.id,
  label: device.label,
  width: device.width,
  height: device.height,
}))
