'use client'

import * as PayloadUI from '@payloadcms/ui'

interface NativeLivePreview {
  /** Payload Live Preview is configured for this document. */
  isEnabled: boolean
  /** The Live Preview iframe / popup is open. */
  isOpen: boolean
  /** Opens the Live Preview panel (no-op when unavailable). */
  open: () => void
}

type LivePreviewContextLike = {
  isLivePreviewEnabled?: boolean
  isLivePreviewing?: boolean
  setIsLivePreviewing?: (value: boolean) => void
}

// `useLivePreviewContext` is exported at runtime but missing from some type
// chains and from unit-test mocks: fall back to "not available".
const useLivePreviewContextSafe: () => LivePreviewContextLike =
  (PayloadUI as unknown as { useLivePreviewContext?: () => LivePreviewContextLike })
    .useLivePreviewContext ?? (() => ({}))

/**
 * State of Payload's native Live Preview for the current document. When it is
 * available, the real site is the preview, so the plugin's mock previews step aside.
 */
export function useNativeLivePreview(): NativeLivePreview {
  const context = useLivePreviewContextSafe() ?? {}
  return {
    isEnabled: Boolean(context.isLivePreviewEnabled),
    isOpen: Boolean(context.isLivePreviewing),
    open: () => context.setIsLivePreviewing?.(true),
  }
}
