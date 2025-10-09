/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: ['../../.eslintrc.cjs'],
  ignorePatterns: ['dev/**', 'tests/**', 'scripts/**', '*.config.ts', '*.config.js'],
};
