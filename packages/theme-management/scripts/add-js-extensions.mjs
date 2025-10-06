#!/usr/bin/env node
/**
 * Add .js extensions to relative imports in TypeScript source files
 * This is required for ESM compatibility when using bundler moduleResolution
 */

import { readdir, readFile, writeFile } from 'fs/promises';
import { join, dirname, extname, relative } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const srcDir = join(__dirname, '..', 'src');

async function* walk(dir) {
  const files = await readdir(dir, { withFileTypes: true });
  for (const file of files) {
    const path = join(dir, file.name);
    if (file.isDirectory()) {
      yield* walk(path);
    } else if (file.name.endsWith('.ts') || file.name.endsWith('.tsx')) {
      yield path;
    }
  }
}

function convertAliasToRelative(aliasPath, currentFilePath) {
  // Convert @/ to relative path from current file
  const targetPath = join(srcDir, aliasPath.replace('@/', ''));
  const currentDir = dirname(currentFilePath);
  let relativePath = relative(currentDir, targetPath);
  
  // Normalize path separators to forward slashes
  relativePath = relativePath.replace(/\\/g, '/');
  
  // Ensure it starts with ./
  if (!relativePath.startsWith('.')) {
    relativePath = './' + relativePath;
  }
  
  return relativePath;
}

async function addJsExtensions() {
  console.log('🔧 Adding .js extensions to imports in source files...');
  let count = 0;

  for await (const filePath of walk(srcDir)) {
    let content = await readFile(filePath, 'utf-8');
    let modified = false;

    // Convert @/ aliases to relative paths
    content = content.replace(
      /from\s+(['"])@\/(.*?)(['"])/g,
      (match, quote1, aliasPath, quote2) => {
        modified = true;
        const relativePath = convertAliasToRelative(aliasPath, filePath);
        return `from ${quote1}${relativePath}.js${quote2}`;
      }
    );

    // Add .js to relative imports that don't have extensions
    // Matches: from './something' or from '../something'
    // Skips: from './file.json', from './file.css', from 'package'
    content = content.replace(
      /from\s+(['"])(\.\.[/\\].*?|\.\/.*?)(['"])/g,
      (match, quote1, importPath, quote2) => {
        // Skip if already has an extension
        const ext = extname(importPath);
        if (ext === '.js' || ext === '.json' || ext === '.css' || ext === '.scss') {
          return match;
        }
        modified = true;
        // Normalize path separators
        const normalizedPath = importPath.replace(/\\/g, '/');
        return `from ${quote1}${normalizedPath}.js${quote2}`;
      }
    );

    if (modified) {
      await writeFile(filePath, content, 'utf-8');
      count++;
      console.log(`  ✓ ${filePath.replace(srcDir, 'src')}`);
    }
  }

  console.log(`\n✅ Updated ${count} files`);
}

addJsExtensions().catch((err) => {
  console.error('❌ Error adding .js extensions:', err);
  process.exit(1);
});
