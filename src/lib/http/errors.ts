import type { HttpMethod, HttpResponse } from './types'

export type HttpTransportErrorKind = 'aborted' | 'timeout' | 'network' | 'unknown'
export class HttpTransportError extends Error {
  readonly kind: HttpTransportErrorKind
  override readonly cause: unknown

  constructor(kind: HttpTransportErrorKind, message: string, cause?: unknown) {
    super(message)
    this.name = 'HttpTransportError'
    this.kind = kind
    this.cause = cause
  }
}

export type HttpErrorKind = 'aborted' | 'timeout' | 'network' | 'response' | 'parse' | 'unknown'
export type HttpErrorOptions = {
  readonly kind: HttpErrorKind
  readonly method: HttpMethod
  readonly url: string
  readonly response?: HttpResponse<unknown>
  readonly cause?: unknown
}

export class HttpError extends Error {
  readonly kind: HttpErrorKind
  readonly method: HttpMethod
  readonly url: string
  readonly response: HttpResponse<unknown> | undefined
  override readonly cause: unknown

  constructor(message: string, options: HttpErrorOptions) {
    super(message)

    this.name = 'HttpError'
    this.kind = options.kind
    this.method = options.method
    this.url = options.url
    this.response = options.response
    this.cause = options.cause
  }
}

export const isHttpError = (error: unknown): error is HttpError => {
  return error instanceof HttpError
}

export const isHttpTransportError = (error: unknown): error is HttpTransportError => {
  return error instanceof HttpTransportError
}
