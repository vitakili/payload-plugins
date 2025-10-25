#!/usr/bin/env node

const fs = require('node:fs')
const path = require('node:path')

console.log('\n╔════════════════════════════════════════════════════════════════╗')
console.log('║                 PAYLOAD PLUGINS TEST SUITE                    ║')
console.log('╚════════════════════════════════════════════════════════════════╝\n')

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
}

let testsPassed = 0
let testsFailed = 0

function logTest(name, passed, message = '') {
  if (passed) {
    console.log(`${colors.green}✓${colors.reset} ${name}`)
    if (message) console.log(`  └─ ${message}`)
    testsPassed++
  } else {
    console.log(`${colors.red}✗${colors.reset} ${name}`)
    if (message) console.log(`  └─ ${colors.red}${message}${colors.reset}`)
    testsFailed++
  }
}

// Test 1: Check if dist folders exist
console.log(`${colors.blue}1. Directory Structure Tests${colors.reset}`)
const localizedSlugsDist = '../packages/localized-slugs/dist'
const themeManagementDist = '../packages/theme-management/dist'

logTest(
  'localized-slugs dist folder exists',
  fs.existsSync(localizedSlugsDist),
  path.resolve(localizedSlugsDist),
)

logTest(
  'theme-management dist folder exists',
  fs.existsSync(themeManagementDist),
  path.resolve(themeManagementDist),
)

// Test 2: Check main entry points
console.log(`\n${colors.blue}2. Entry Point Tests${colors.reset}`)

const localizedIndex = path.join(localizedSlugsDist, 'index.js')
const themeIndex = path.join(themeManagementDist, 'index.js')

logTest('localized-slugs index.js exists', fs.existsSync(localizedIndex))

logTest('theme-management index.js exists', fs.existsSync(themeIndex))

// Test 3: Check providers
console.log(`\n${colors.blue}3. Provider Component Tests${colors.reset}`)

const localizedProviders = path.join(localizedSlugsDist, 'providers')
const localizedProviderIndex = path.join(localizedProviders, 'index.jsx')
const slugContext = path.join(localizedProviders, 'SlugContext.jsx')

logTest('localized-slugs providers directory exists', fs.existsSync(localizedProviders))

logTest('localized-slugs providers/index.jsx exists', fs.existsSync(localizedProviderIndex))

logTest('localized-slugs SlugContext.jsx exists', fs.existsSync(slugContext))

// Test 4: Check for 'use client' directives
console.log(`\n${colors.blue}4. Client Component Directive Tests${colors.reset}`)

const localizedProviderContent = fs.readFileSync(localizedProviderIndex, 'utf8')
const slugContextContent = fs.readFileSync(slugContext, 'utf8')

logTest(
  'localized-slugs providers/index.jsx has "use client"',
  localizedProviderContent.includes("'use client'"),
  'Client component directive found',
)

logTest(
  'localized-slugs SlugContext.jsx has "use client"',
  slugContextContent.includes("'use client'"),
  'Client component directive found',
)

// Test 5: Check exports
console.log(`\n${colors.blue}5. Export Tests${colors.reset}`)

const localizedIndexContent = fs.readFileSync(localizedIndex, 'utf8')
const themeIndexContent = fs.readFileSync(themeIndex, 'utf8')

logTest(
  'localized-slugs index.js exports from providers',
  localizedIndexContent.includes("from './providers"),
  'Providers are exported',
)

logTest(
  'localized-slugs index.js exports from utils',
  localizedIndexContent.includes("from './utils"),
  'Utils are exported',
)

logTest(
  'localized-slugs exports createLocalizedSlugField',
  localizedIndexContent.includes('createLocalizedSlugField'),
  'Field creation function exported',
)

logTest(
  'theme-management index.js exports ThemeProvider',
  themeIndexContent.includes('ThemeProvider'),
  'Theme provider exported',
)

// Test 6: Check for correct file extensions
console.log(`\n${colors.blue}6. File Extension Tests${colors.reset}`)

logTest(
  'localized-slugs uses .jsx for client components',
  fs.existsSync(path.join(localizedProviders, 'SlugContext.jsx')),
  'SlugContext.jsx found',
)

logTest(
  'localized-slugs uses .js for utilities',
  fs.existsSync(path.join(localizedSlugsDist, 'utils', 'slugUtils.js')),
  'slugUtils.js found',
)

logTest(
  'localized-slugs uses .js for hooks',
  fs.existsSync(path.join(localizedSlugsDist, 'hooks', 'populateLocalizedSlugs.js')),
  'populateLocalizedSlugs.js found',
)

// Test 7: Check type definitions
console.log(`\n${colors.blue}7. TypeScript Definition Tests${colors.reset}`)

logTest(
  'localized-slugs index.d.ts exists',
  fs.existsSync(path.join(localizedSlugsDist, 'index.d.ts')),
)

logTest(
  'localized-slugs providers/index.d.ts exists',
  fs.existsSync(path.join(localizedProviders, 'index.d.ts')),
)

logTest(
  'theme-management index.d.ts exists',
  fs.existsSync(path.join(themeManagementDist, 'index.d.ts')),
)

// Test 8: Check package.json exports
console.log(`\n${colors.blue}8. Package.json Export Configuration Tests${colors.reset}`)

const localizedPackageJson = JSON.parse(
  fs.readFileSync('../packages/localized-slugs/package.json', 'utf8'),
)
const themePackageJson = JSON.parse(
  fs.readFileSync('../packages/theme-management/package.json', 'utf8'),
)

logTest(
  'localized-slugs has main export configured',
  localizedPackageJson.exports && localizedPackageJson.exports['.'],
  `Main export: ${localizedPackageJson.main}`,
)

logTest(
  'localized-slugs has providers export configured',
  localizedPackageJson.exports && localizedPackageJson.exports['./providers/*'],
  'Providers subpath export configured',
)

logTest(
  'localized-slugs has utils export configured',
  localizedPackageJson.exports && localizedPackageJson.exports['./utils/*'],
  'Utils subpath export configured',
)

logTest(
  'theme-management has main export configured',
  themePackageJson.exports && themePackageJson.exports['.'],
  `Main export: ${themePackageJson.main}`,
)

// Summary
console.log(`\n╔════════════════════════════════════════════════════════════════╗`)
console.log(
  `║${colors.blue}                        TEST SUMMARY${colors.reset}                         ║`,
)
console.log(`╚════════════════════════════════════════════════════════════════╝\n`)

console.log(`${colors.green}Passed: ${testsPassed}${colors.reset}`)
console.log(`${colors.red}Failed: ${testsFailed}${colors.reset}`)

if (testsFailed === 0) {
  console.log(`\n${colors.green}✓ All tests passed! Plugins are ready for use.${colors.reset}\n`)
  process.exit(0)
} else {
  console.log(
    `\n${colors.red}✗ Some tests failed. Please check the configuration.${colors.reset}\n`,
  )
  process.exit(1)
}
