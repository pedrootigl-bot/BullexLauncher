import { apiConfig, shouldUseMocks } from './config'
import { ApiError, type ApiErrorBody } from './errors'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

type QueryValue = string | number | boolean | null | undefined

export type ApiRequestOptions = {
  method?: HttpMethod
  body?: unknown
  query?: Record<string, QueryValue>
  /** Sobrescreve Authorization; use `null` para omitir token. */
  token?: string | null
  signal?: AbortSignal
  headers?: Record<string, string>
}

type TokenGetter = () => string | null
type UnauthorizedHandler = () => void

let getAccessToken: TokenGetter = () => null
let onUnauthorized: UnauthorizedHandler | null = null

export function configureApiClient(options: {
  getAccessToken: TokenGetter
  onUnauthorized?: UnauthorizedHandler
}) {
  getAccessToken = options.getAccessToken
  onUnauthorized = options.onUnauthorized ?? null
}

function buildUrl(path: string, query?: Record<string, QueryValue>): string {
  const base = apiConfig.baseUrl
  const url = path.startsWith('http')
    ? new URL(path)
    : new URL(path.startsWith('/') ? path : `/${path}`, `${base}/`)

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === '') continue
      url.searchParams.set(key, String(value))
    }
  }

  return url.toString()
}

async function parseBody(response: Response): Promise<unknown> {
  if (response.status === 204) return null
  const contentType = response.headers.get('content-type') ?? ''
  if (contentType.includes('application/json')) {
    try {
      return await response.json()
    } catch {
      return null
    }
  }
  const text = await response.text()
  return text || null
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  if (shouldUseMocks()) {
    throw new ApiError(
      0,
      'API desabilitada: defina VITE_API_BASE_URL e VITE_USE_MOCKS=false para chamar o backend.',
    )
  }

  const method = options.method ?? (options.body !== undefined ? 'POST' : 'GET')
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...options.headers,
  }

  const token = options.token === undefined ? getAccessToken() : options.token
  if (token) headers.Authorization = `Bearer ${token}`

  let body: BodyInit | undefined
  if (options.body !== undefined && options.body !== null) {
    if (options.body instanceof FormData) {
      body = options.body
    } else {
      headers['Content-Type'] = 'application/json'
      body = JSON.stringify(options.body)
    }
  }

  const response = await fetch(buildUrl(path, options.query), {
    method,
    headers,
    body,
    signal: options.signal,
    credentials: 'include',
  })

  const payload = await parseBody(response)

  if (!response.ok) {
    const errBody = (payload && typeof payload === 'object' ? payload : undefined) as
      | ApiErrorBody
      | undefined
    const message =
      errBody?.message ||
      (typeof payload === 'string' && payload) ||
      `Erro HTTP ${response.status}`

    if (response.status === 401) onUnauthorized?.()

    throw new ApiError(response.status, message, errBody)
  }

  return payload as T
}

export const api = {
  get: <T>(path: string, options?: Omit<ApiRequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(path, { ...options, method: 'GET' }),

  post: <T>(path: string, body?: unknown, options?: Omit<ApiRequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(path, { ...options, method: 'POST', body }),

  put: <T>(path: string, body?: unknown, options?: Omit<ApiRequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(path, { ...options, method: 'PUT', body }),

  patch: <T>(path: string, body?: unknown, options?: Omit<ApiRequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(path, { ...options, method: 'PATCH', body }),

  delete: <T>(path: string, options?: Omit<ApiRequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(path, { ...options, method: 'DELETE' }),
}
