/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DEV_API_BASE_URL: string
  readonly VITE_API_BASE_URL: string
  readonly NODE_ENV: 'development' | 'production' | 'test'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
