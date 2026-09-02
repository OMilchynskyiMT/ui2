export type ApiErrorOptions = {
  readonly code: number
  readonly httpStatus: number
  readonly cause?: unknown
}

export class ApiError extends Error {
  readonly code: number
  readonly httpStatus: number
  override readonly cause: unknown

  constructor(message: string, options: ApiErrorOptions) {
    super(message)
    this.name = 'ApiError'
    this.code = options.code
    this.httpStatus = options.httpStatus
    this.cause = options.cause
  }
}

export const isApiError = (error: unknown): error is ApiError => {
  return error instanceof ApiError
}
