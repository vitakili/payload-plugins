import fs from 'node:fs/promises'
import path from 'node:path'
import { expect, test } from '@playwright/test'

test.describe('Theme Management livePreview config', () => {
  test('dev-local plugin config enables home-based livePreview with fallback', async () => {
    const pluginsFile = path.resolve(process.cwd(), 'src/plugins/index.ts')
    const content = await fs.readFile(pluginsFile, 'utf8')

    expect(content).toContain('livePreview: {')
    expect(content).toContain('enabled: true')
    expect(content).toContain("pageCollection: 'pages'")
    expect(content).toContain("pageSlug: 'home'")
    expect(content).toContain('fallbackToFirstPage: true')
    expect(content).toContain('generatePreviewPath')
  })
})
