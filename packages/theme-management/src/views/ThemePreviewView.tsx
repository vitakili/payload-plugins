'use server'

/**
 * Theme Preview View - Server Component
 * Custom admin view for live theme preview
 */

import type { AdminViewServerProps } from 'payload'

import { DefaultTemplate } from '@payloadcms/next/templates'
import { Gutter } from '@payloadcms/ui'
import React from 'react'

import { ThemeLivePreviewClient } from './ThemePreviewViewClient.js'

export default async function ThemePreviewView({
  initPageResult,
  params,
  searchParams,
}: AdminViewServerProps) {
  return (
    <DefaultTemplate
      i18n={initPageResult.req.i18n}
      locale={initPageResult.locale}
      params={params}
      payload={initPageResult.req.payload}
      permissions={initPageResult.permissions}
      searchParams={searchParams}
      user={initPageResult.req.user || undefined}
      visibleEntities={initPageResult.visibleEntities}
    >
      <Gutter>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ marginBottom: '0.5rem' }}>Theme Preview</h1>
          <p style={{ color: 'var(--theme-elevation-500)' }}>
            Real-time preview of your theme configuration. Changes are reflected instantly as
            you edit theme settings.
          </p>
        </div>
        <ThemeLivePreviewClient />
      </Gutter>
    </DefaultTemplate>
  )
}
