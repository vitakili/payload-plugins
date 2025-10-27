import localizedSlugsPlugin from '../dist/index.js'

const options = {
  locales: ['cs','en'],
  defaultLocale: 'cs',
  collections: [
    {
      collection: 'pages',
      generateFromTitle: false,
    }
  ],
  enableLogging: false,
}

const plugin = localizedSlugsPlugin(options)

// Mock Payload Config
const mockConfig = {
  collections: [
    {
      slug: 'pages',
      fields: [],
      hooks: {
        afterChange: [],
      },
    },
  ],
}

const newConfig = plugin(mockConfig)

const collection = newConfig.collections[0]
const hasLocalizedField = collection.fields.some(f => f && f.name === 'localizedSlugs')
const afterChangeHooks = collection.hooks?.afterChange || []

console.log('collection.slug:', collection.slug)
console.log('hasLocalizedField:', hasLocalizedField)
console.log('afterChangeHooks.length:', afterChangeHooks.length)
console.log('afterChange hooks types:', afterChangeHooks.map(h => typeof h))

if (hasLocalizedField && afterChangeHooks.length > 0 && typeof afterChangeHooks[afterChangeHooks.length -1] === 'function') {
  console.log('\n✅ PASS: Hook injected and field added')
  process.exit(0)
} else {
  console.error('\n❌ FAIL: Hook or field not injected')
  process.exit(1)
}
