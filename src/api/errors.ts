export type ApiErrorBody = {
  message?: string
  code?: string
  details?: unknown
}

export class ApiError extends Error {
  readonly status: number
  readonly code: string | undefined
  readonly body: ApiErrorBody | undefined

  constructor(status: number, message: string, body?: ApiErrorBody) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = body?.code
    this.body = body
  }

  get isUnauthorized(): boolean {
    return this.status === 401
  }

  get isForbidden(): boolean {
    return this.status === 403
  }
}

export function toErrorMessage(error: unknown, fallback = 'Falha na requisição'): string {
  if (error instanceof ApiError) return error.message
  if (error instanceof Error) return error.message
  return fallback
}
