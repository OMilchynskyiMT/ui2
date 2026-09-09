import basicSsl from '@vitejs/plugin-basic-ssl'
import { fileURLToPath, URL } from 'node:url'

import { defineConfig, Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'

const cascadeLayers = (): Plugin => ({
  name: 'cascade-layer-order',
  apply: 'build',
  transformIndexHtml: {
    order: 'post',
    handler() {
      return [
        {
          tag: 'style',
          children: '@layer normalize, theme, base, components, utilities;',
          injectTo: 'head-prepend',
        },
      ]
    },
  },
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), basicSsl(), cascadeLayers()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: true,
  },

  base: '/ui2',
})
