import { expect, test, vi } from 'vitest'
import { createPopulateLocalizedSlugsHook } from '../dist/hooks/populateLocalizedSlugs.js'

// Collections like categories have a slug but no fullPath field. The hook used
// to store `fullPath: undefined`, which a Payload group update skips — so the
// fullPath of the first slug (`/sluby`) outlived the rename to `sluzby`.
test('derives fullPath from the slug when the collection has no fullPath field', async () => {
  const hook = createPopulateLocalizedSlugsHook({
    locales: ['cs', 'en'],
    slugField: 'slug',
    fullPathField: 'fullPath',
    enableLogging: false,
  })

  const update = vi.fn().mockResolvedValue({})
  const findByID = vi.fn().mockResolvedValue({ id: 1, slug: 'services' })

  const result = await hook({
    doc: { id: 1, slug: 'sluzby', localizedSlugs: { cs: { slug: 'sluby', fullPath: '/sluby' } } },
    operation: 'update',
    req: { locale: 'cs', payload: { update, findByID } },
    context: {},
    collection: { slug: 'page-categories' },
  })

  const expected = {
    cs: { slug: 'sluzby', fullPath: '/sluzby' },
    en: { slug: 'services', fullPath: '/services' },
  }
  expect(result.localizedSlugs).toEqual(expected)
  for (const call of update.mock.calls) {
    expect(call[0].data.localizedSlugs).toEqual(expected)
  }
})

test('keeps an explicit fullPath field value', async () => {
  const hook = createPopulateLocalizedSlugsHook({
    locales: ['cs'],
    slugField: 'slug',
    fullPathField: 'fullPath',
    enableLogging: false,
  })

  const result = await hook({
    doc: { slug: 'child', fullPath: '/parent/child' },
    operation: 'create',
    req: {},
    collection: { slug: 'pages' },
  })

  expect(result.localizedSlugs).toEqual({ cs: { slug: 'child', fullPath: '/parent/child' } })
})
