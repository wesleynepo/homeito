import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'node',
    coverage: {
      provider: 'v8',
      thresholds: {
        statements: 60,
        branches: 70,
        functions: 60,
        lines: 60,
      },
    },
  },
  resolve: {
    alias: {
      '@ito/shared': path.resolve(__dirname, '../shared/src/index.ts'),
    },
  },
})
