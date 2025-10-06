#!/usr/bin/env node
/**
 * Post-build script to add .js extensions to relative imports in compiled output
 * This is required for Node.js ESM module resolution
 */

import { readdir, readFile, writeFile } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const distDir = join(__dirname, '..', 'dist')

async function* walk(dir) {
  const files = await readdir(dir, { withFileTypes: true })
  for (const file of files) {
    const path = join(dir, file.name)
    if (file.isDirectory()) {
      yield* walk(path)
    } else if (file.name.endsWith('.js')) {
      yield path
    }
  }
}

async function fixImports() {
  console.log('🔧 Fixing ESM imports by adding .js extensions...')
  let count = 0

  for await (const filePath of walk(distDir)) {
    let content = await readFile(filePath, 'utf-8')
    let modified = false

    // Fix: from './something' -> from './something.js'
    // Fix: from '../something' -> from '../something.js'
    // But skip: from 'package-name', from '@scope/package', from './file.json', etc.
    const updated = content.replace(
      /from\s+['"](\.\.[\/\\].*?|\.\/.*?)['"];?/g,
      (match, importPath) => {
        // Skip if already has extension
        if (/\.(js|json|css|scss)['"]/.test(match)) {
          return match
        }
        modified = true
        return match.replace(importPath, importPath + '.js')
      }
    )

    if (modified) {
      await writeFile(filePath, updated, 'utf-8')
      count++
    }
  }

  console.log(`✅ Fixed ${count} files`)
}

fixImports().catch((err) => {
  console.error('❌ Error fixing imports:', err)
  process.exit(1)
})
