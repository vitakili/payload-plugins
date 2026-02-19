'use client'
import { ThemeLivePreviewSync } from '@kilivi/payloadcms-theme-management/components/ThemeLivePreviewSync'
import React from 'react'

type LivePreviewListenerProps = {
  initialData: Record<string, unknown>
}

export const LivePreviewListener: React.FC<LivePreviewListenerProps> = ({ initialData }) => {
  return (
    <ThemeLivePreviewSync
      initialData={initialData}
      serverURL={process.env.NEXT_PUBLIC_SERVER_URL || ''}
    />
  )
}
