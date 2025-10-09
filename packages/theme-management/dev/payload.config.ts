import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { slateEditor } from '@payloadcms/richtext-slate'
import { MongoMemoryReplSet } from 'mongodb-memory-server'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { themeManagementPlugin } from '../src/index.js'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const buildConfigWithMemoryDB = async () => {
  if (process.env.NODE_ENV === 'test') {
    const memoryDB = await MongoMemoryReplSet.create({
      replSet: {
        count: 3,
        dbName: 'payloadmemory',
      },
    })

    process.env.DATABASE_URI = `${memoryDB.getUri()}&retryWrites=true`
  }

  return buildConfig({
    admin: {
      importMap: {
        baseDir: path.resolve(dirname),
      },
    },
    collections: [
      {
        slug: 'pages',
        fields: [
          {
            name: 'title',
            type: 'text',
            required: true,
          },
        ],
      },
    ],
    db: mongooseAdapter({
      url: process.env.DATABASE_URI || 'mongodb://127.0.0.1/test-theme-plugin',
    }),
    editor: slateEditor({}),
    plugins: [
      themeManagementPlugin({
        targetCollection: 'pages',
        enableAdvancedFeatures: true,
        enableLogging: true,
        includeColorModeToggle: true,
        includeCustomCSS: true,
      }),
    ],
    secret: process.env.PAYLOAD_SECRET || 'test-secret-key',
    sharp,
    typescript: {
      outputFile: path.resolve(dirname, 'payload-types.ts'),
    },
  })
}

export default buildConfigWithMemoryDB()
