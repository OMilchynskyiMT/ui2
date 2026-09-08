import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    globals: true,
    include: ['src/**/__tests__/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: [
        'src/lib/validation/**/*.ts',
        'src/composables/useAsyncResource.ts',
        'src/composables/useChangeTracker.ts',
        'src/composables/usePageModel.ts',
        'src/composables/usePageNavigationGuard.ts',
        'src/composables/usePolling.ts',
      ],
      exclude: [
        'src/lib/validation/index.ts',
        'src/lib/validation/model/**/*.ts',
      ],
    },
  },
})
