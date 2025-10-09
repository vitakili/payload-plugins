import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'node',
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    setupFiles: ['./dev/vitest.setup.ts'],
    testTimeout: 60000,
    hookTimeout: 60000,
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      'tests/**',
    ],
    server: {
      deps: {
        external: ['react-image-crop', /\.css$/],
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
