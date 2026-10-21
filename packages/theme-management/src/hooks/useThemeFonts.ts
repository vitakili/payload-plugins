'use client'

import * as PayloadUI from '@payloadcms/ui'
import { useEffect } from 'react'
import { buildThemeFontsHref } from '../constants/themeFonts.js'

type UseConfig = () => { config?: { routes?: { api?: string } } } | undefined

// Tolerate a missing export (older Payload, unit-test mocks): fall back to '/api'.
const useConfigSafe: UseConfig =
  (PayloadUI as unknown as { useConfig?: UseConfig }).useConfig ?? (() => undefined)

/** Payload's REST API route (`routes.api`), '/api' by default. */
export function useApiRoute(): string {
  return useConfigSafe()?.config?.routes?.api ?? '/api'
}

/**
 * Load catalog fonts into the admin document through the plugin's self-hosted
 * font endpoint, so previews render in the real faces without the editor's
 * browser contacting Google. One `<link>` per distinct font set, shared by every
 * field that asks for the same set.
 */
export function useThemeFonts(values: Array<string | null | undefined>): void {
  const apiRoute = useApiRoute()
  const href = buildThemeFontsHref(values, { apiRoute })

  useEffect(() => {
    if (!href || typeof document === 'undefined') return
    const exists = [...document.querySelectorAll<HTMLLinkElement>('link[data-tm-fonts]')].some(
      (link) => link.getAttribute('href') === href,
    )
    if (exists) return
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = href
    link.dataset.tmFonts = ''
    document.head.appendChild(link)
  }, [href])
}
