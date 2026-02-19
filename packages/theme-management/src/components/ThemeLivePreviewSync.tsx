'use client'

import { useLivePreview } from '@payloadcms/live-preview-react'
import { useEffect, useMemo } from 'react'
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
}

export const ThemeLivePreviewSync: React.FC<ThemeLivePreviewSyncProps> = ({
  initialData,
  serverURL,
  apiRoute,
  depth,
  themeConfigurationKey = 'themeConfiguration',
  styleElementId = 'theme-live-preview-css',
}) => {
  const { data } = useLivePreview<Record<string, unknown>>({
    apiRoute,
    depth,
    initialData,
    serverURL,
  })

  const themeConfiguration = useMemo(
    () => extractThemeConfigurationFromLiveData(data, themeConfigurationKey),
    [data, themeConfigurationKey],
  )

  useEffect(() => {
    if (typeof document === 'undefined' || !themeConfiguration) {
      return
    }

    const runtime = buildLivePreviewThemeRuntime(themeConfiguration)

    let styleElement = document.getElementById(styleElementId) as HTMLStyleElement | null
    if (!styleElement) {
      styleElement = document.createElement('style')
      styleElement.id = styleElementId
      document.head.appendChild(styleElement)
    }

    styleElement.innerHTML = runtime.css

    document.documentElement.dataset.theme = runtime.theme
    document.documentElement.dataset.colorMode = runtime.mode
    document.documentElement.dataset.themeMode = runtime.mode
    document.documentElement.classList.remove('light', 'dark', 'auto')
    document.documentElement.classList.add(runtime.mode)
  }, [themeConfiguration, styleElementId])

  return null
}
