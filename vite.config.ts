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

// WARN: firmware bundle must never contain demo code
const verifyFirmwareBundle = (mode: string): Plugin => ({
  name: 'verify-firmware-bundle',
  apply: 'build',
  generateBundle(_options, bundle) {
    if (mode !== 'mtr3' && mode !== 'mtcap3') return
    for (const file of Object.values(bundle)) {
      if (file.type !== 'chunk') continue
      for (const id of Object.keys(file.modules)) {
        if (id.replaceAll('\\', '/').includes('/src/demo/')) {
          this.error(`Demo module included in firmware build: ${id}`)
        }
      }
    }
  },
})

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [vue(), basicSsl(), cascadeLayers(), verifyFirmwareBundle(mode)],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: true,
  },

  base: mode === 'demo' ? '/ui2/' : '/',
}))
