/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL da API (ex.: https://api.bullverse.com). Vazio = modo mock. */
  readonly VITE_API_BASE_URL?: string
  /** Force mocks even with API URL (`true`) or force API (`false`). */
  readonly VITE_USE_MOCKS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
