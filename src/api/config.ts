/**
 * Configuração de ambiente do frontend.
 * Com `VITE_API_BASE_URL` preenchida e `VITE_USE_MOCKS` ≠ true → HTTP real.
 * Sem base URL (ou VITE_USE_MOCKS=true) → mocks locais (dev/demo).
 */

const rawBase = (import.meta.env.VITE_API_BASE_URL ?? '').trim().replace(/\/$/, '')
const useMocksFlag = (import.meta.env.VITE_USE_MOCKS ?? '').trim().toLowerCase()

export const apiConfig = {
  baseUrl: rawBase,
  /** Token JWT em memória + localStorage (ver sessionStore). */
  tokenStorageKey: 'bx-auth-token',
  userStorageKey: 'bx-auth-user',
} as const

export function shouldUseMocks(): boolean {
  if (useMocksFlag === 'true') return true
  if (useMocksFlag === 'false') return false
  return !apiConfig.baseUrl
}

export function isApiEnabled(): boolean {
  return !shouldUseMocks()
}
