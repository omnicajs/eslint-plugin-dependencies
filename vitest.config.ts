import { configDefaults, defineConfig, mergeConfig } from 'vitest/config'

import viteConfig from './vite.config'

export default defineConfig(
  mergeConfig(viteConfig, {
    test: {
      coverage: {
        thresholds: {
          statements: 100,
          functions: 100,
          branches: 100,
          lines: 100,
        },
        exclude: [...(configDefaults.coverage.exclude ?? []), 'vendor/**'],
        provider: 'v8',
      },
      exclude: [...configDefaults.exclude, 'vendor/**'],
    },
  }),
)
