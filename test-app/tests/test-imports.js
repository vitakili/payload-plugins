#!/usr/bin/env node

const fs = require('node:fs')
const path = require('node:path')

console.log('\n╔════════════════════════════════════════════════════════════════╗')
console.log('║         PAYLOAD PLUGINS - IMPORT VERIFICATION TEST            ║')
console.log('╚════════════════════════════════════════════════════════════════╝\n')

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

console.log(`${colors.blue}Testing localized-slugs plugin imports:${colors.reset}\n`)

const localizedSlugsDist = path.resolve(__dirname, '../../packages/localized-slugs/dist')

// Test main entry point can be required
try {
  const mainModule = require(path.join(localizedSlugsDist, 'index.js'))
  const hasLocalizedSlugsPlugin = typeof mainModule.localizedSlugsPlugin === 'function'
  const hasCreateLocalizedSlugField = typeof mainModule.createLocalizedSlugField === 'function'
  const hasGenerateSlugFromTitle = typeof mainModule.generateSlugFromTitle === 'function'

  logTest('Can load main entry point (dist/index.js)', true, 'Module loaded successfully')

  logTest(
    'localizedSlugsPlugin is exported',
    hasLocalizedSlugsPlugin,
    hasLocalizedSlugsPlugin ? 'Function found' : 'Function not found',
  )

  logTest(
    'createLocalizedSlugField is exported',
    hasCreateLocalizedSlugField,
    hasCreateLocalizedSlugField ? 'Function found' : 'Function not found',
  )

  logTest(
    'generateSlugFromTitle is exported',
    hasGenerateSlugFromTitle,
    hasGenerateSlugFromTitle ? 'Function found' : 'Function not found',
  )
} catch (err) {
  logTest('Can load main entry point (dist/index.js)', false, err.message)
}

// Test utils can be imported
try {
  const utilsModule = require(path.join(localizedSlugsDist, 'utils', 'index.js'))
  const hasGenerateSlug = typeof utilsModule.generateSlugFromTitle === 'function'

  logTest('Can load utils/index.js', true, 'Utils module loaded successfully')

  logTest(
    'generateSlugFromTitle is available in utils',
    hasGenerateSlug,
    hasGenerateSlug ? 'Function found' : 'Function not found',
  )
} catch (err) {
  logTest('Can load utils/index.js', false, err.message)
}

// Test JSX files exist (can't require .jsx files directly in Node.js, but we can check they exist)
console.log(`\n${colors.blue}Testing provider component files:${colors.reset}\n`)

const providerIndexPath = path.join(localizedSlugsDist, 'providers', 'index.jsx')
const slugContextPath = path.join(localizedSlugsDist, 'providers', 'SlugContext.jsx')

logTest('providers/index.jsx file exists', fs.existsSync(providerIndexPath))

logTest('providers/SlugContext.jsx file exists', fs.existsSync(slugContextPath))

// Check content of JSX files
if (fs.existsSync(providerIndexPath)) {
  const content = fs.readFileSync(providerIndexPath, 'utf8')
  logTest(
    'providers/index.jsx contains "use client"',
    content.includes("'use client'"),
    'Client directive found',
  )

  logTest(
    'providers/index.jsx exports SlugProvider',
    content.includes('SlugProvider'),
    'SlugProvider export found',
  )
}

if (fs.existsSync(slugContextPath)) {
  const content = fs.readFileSync(slugContextPath, 'utf8')
  logTest(
    'SlugContext.jsx contains "use client"',
    content.includes("'use client'"),
    'Client directive found',
  )

  logTest(
    'SlugContext.jsx contains JSX syntax',
    content.includes('<SlugContext.Provider'),
    'JSX component found',
  )
}

console.log(`\n${colors.blue}Testing theme-management plugin imports:${colors.reset}\n`)

const themeManagementDist = path.resolve(__dirname, '../../packages/theme-management/dist')

try {
  const themeModule = require(path.join(themeManagementDist, 'index.js'))
  const hasThemeManagementPlugin = typeof themeModule.themeManagementPlugin === 'function'
  const hasThemeProvider = typeof themeModule.ThemeProvider === 'function'

  logTest('Can load theme-management main entry point', true, 'Module loaded successfully')

  logTest(
    'themeManagementPlugin is exported',
    hasThemeManagementPlugin,
    hasThemeManagementPlugin ? 'Function found' : 'Function not found',
  )

  logTest(
    'ThemeProvider is exported',
    hasThemeProvider,
    hasThemeProvider ? 'Component found' : 'Component not found',
  )
} catch (err) {
  logTest('Can load theme-management main entry point', false, err.message)
}

// Summary
console.log(`\n╔════════════════════════════════════════════════════════════════╗`)
console.log(
  `║${colors.blue}                        TEST SUMMARY${colors.reset}                         ║`,
)
console.log(`╚════════════════════════════════════════════════════════════════╝\n`)

console.log(`${colors.green}Passed: ${testsPassed}${colors.reset}`)
console.log(`${colors.red}Failed: ${testsFailed}${colors.reset}`)

if (testsFailed === 0) {
  console.log(
    `\n${colors.green}✓ All import tests passed! Plugins are ready for consumption.${colors.reset}\n`,
  )
  process.exit(0)
} else {
  console.log(
    `\n${colors.red}✗ Some tests failed. Please check the plugin configuration.${colors.reset}\n`,
  )
  process.exit(1)
}
