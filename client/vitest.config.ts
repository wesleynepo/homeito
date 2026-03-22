import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    globals: true,
    coverage: {
      provider: 'v8',
      thresholds: {
        statements: 25,
        branches: 50,
        functions: 30,
        lines: 25,
      },
    },
  },
  resolve: {
    alias: {
      '@ito/shared': path.resolve(__dirname, '../shared/src/index.ts'),
    },
  },
})
