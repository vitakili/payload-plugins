import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  // Vite types can differ across workspace deps; cast to `any` to avoid cross-version type conflicts
  plugins: [react() as unknown as any],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    globals: true, // Enable global expect
  },
})
