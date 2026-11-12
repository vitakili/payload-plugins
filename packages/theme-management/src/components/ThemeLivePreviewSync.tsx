'use client'

import { useLivePreview } from '@payloadcms/live-preview-react'
import React, { useEffect, useMemo, useRef } from 'react'
import type { ThemeFontLoading } from '../constants/themeFonts.js'
import {
  buildLivePreviewThemeRuntime,
  extractThemeConfigurationFromLiveData,
} from '../utils/livePreviewThemeRuntime.js'

interface ThemeLivePreviewSyncProps {
  initialData: Record<string, unknown>
  serverURL: string
  apiRoute?: string
  depth?: number
  themeConfigurationKey?: string
  styleElementId?: string
  /** Same as ServerThemeInjector's `fontLoading`; use 'none' with next/font. */
  fontLoading?: ThemeFontLoading
  /** Same as ServerThemeInjector's `selfHostedFonts`: fonts the site loads itself. */
  selfHostedFonts?: readonly string[]
}

export const ThemeLivePreviewSync: React.FC<ThemeLivePreviewSyncProps> = ({
  initialData,
  serverURL,
  apiRoute,
  depth,
  themeConfigurationKey = 'themeConfiguration',
  styleElementId = 'theme-live-preview-css',
  fontLoading = 'self-hosted',
  selfHostedFonts,
}) => {
  const { data } = useLivePreview<Record<string, unknown>>({
    apiRoute,
    depth,
    initialData,
    serverURL,
  })

  const appliedAttributes = useRef<string[]>([])

  const themeConfiguration = useMemo(
    () => extractThemeConfigurationFromLiveData(data, themeConfigurationKey),
    [data, themeConfigurationKey],
  )

  useEffect(() => {
    if (typeof document === 'undefined' || !themeConfiguration) {
      return
    }

    const runtime = buildLivePreviewThemeRuntime(
      themeConfiguration,
      apiRoute,
      fontLoading,
      selfHostedFonts,
    )

    let styleElement = document.getElementById(styleElementId) as HTMLStyleElement | null
    if (!styleElement) {
      styleElement = document.createElement('style')
      styleElement.id = styleElementId
      document.head.appendChild(styleElement)
    }

    styleElement.innerHTML = runtime.css

    const fontsLinkId = `${styleElementId}-fonts`
    let fontsLink = document.getElementById(fontsLinkId) as HTMLLinkElement | null
    const fontsAlreadyLoaded =
      runtime.fontsHref !== null &&
      [...document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')].some(
        (link) => link !== fontsLink && link.getAttribute('href') === runtime.fontsHref,
      )
    if (runtime.fontsHref && !fontsAlreadyLoaded) {
      if (!fontsLink) {
        fontsLink = document.createElement('link')
        fontsLink.id = fontsLinkId
        fontsLink.rel = 'stylesheet'
        document.head.appendChild(fontsLink)
      }
      if (fontsLink.getAttribute('href') !== runtime.fontsHref) fontsLink.href = runtime.fontsHref
    } else {
      fontsLink?.remove()
    }

    const root = document.documentElement
    // Drop style attributes that are no longer configured, then apply the current set.
    appliedAttributes.current
      .filter((name) => !(name in runtime.attributes))
      .forEach((name) => root.removeAttribute(name))
    Object.entries(runtime.attributes).forEach(([name, value]) => root.setAttribute(name, value))
    appliedAttributes.current = Object.keys(runtime.attributes)

    document.documentElement.dataset.theme = runtime.theme
    document.documentElement.dataset.colorMode = runtime.mode
    document.documentElement.dataset.themeMode = runtime.mode
    document.documentElement.classList.remove('light', 'dark', 'auto')
    document.documentElement.classList.add(runtime.mode)
    // Joined: a new array from the caller on every render must not re-run this.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [themeConfiguration, styleElementId, apiRoute, fontLoading, selfHostedFonts?.join(',')])

  return null
}
