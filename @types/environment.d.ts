/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TARGET_PLATFORM: 'mtcap3' | 'mtr3'
  readonly VITE_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
