import { HttpError, HttpTransportError } from './errors'
import { buildUrl, mergeHeaders } from './serialization'
import type {
  HttpClient,
  HttpClientConfig,
  HttpHandler,
  HttpMiddleware,
  HttpRequest,
  HttpRequestBodyOptions,
  HttpRequestOptions,
  HttpRequestOptionsWithBody,
  HttpResponse,
  HttpTransportRequest,
  HttpTransportResponse,
} from './types'

export const createHttpClient = (config: HttpClientConfig): HttpClient => {
  validateTimeout(config.timeout)
  const terminal: HttpHandler = request => executeRequest(config, request)
  const handler = composeMiddleware(config.middleware ?? [], terminal)

  return {
    request<T>(request: HttpRequest): Promise<HttpResponse<T>> {
      return handler(request) as Promise<HttpResponse<T>>
    },

    get<T>(url: string, options?: HttpRequestOptions): Promise<HttpResponse<T>> {
      return handler({
        ...options,
        method: 'GET',
        url,
      }) as Promise<HttpResponse<T>>
    },

    post<T>(url: string, options?: HttpRequestOptionsWithBody): Promise<HttpResponse<T>> {
      return handler({
        ...options,
        method: 'POST',
        url,
      }) as Promise<HttpResponse<T>>
    },

    put<T>(url: string, options?: HttpRequestOptionsWithBody): Promise<HttpResponse<T>> {
      return handler({
        ...options,
        method: 'PUT',
        url,
      }) as Promise<HttpResponse<T>>
    },

    patch<T>(url: string, options?: HttpRequestOptionsWithBody): Promise<HttpResponse<T>> {
      return handler({
        ...options,
        method: 'PATCH',
        url,
      }) as Promise<HttpResponse<T>>
    },

    delete<T>(url: string, options?: HttpRequestOptionsWithBody): Promise<HttpResponse<T>> {
      return handler({
        ...options,
        method: 'DELETE',
        url,
      }) as Promise<HttpResponse<T>>
    },
  }
}

const composeMiddleware = (middleware: readonly HttpMiddleware[], terminal: HttpHandler): HttpHandler => {
  const dispatch = (index: number, request: Parameters<HttpHandler>[0]): ReturnType<HttpHandler> => {
    const current = middleware[index]
    if (current === undefined) return terminal(request)
    return current(request, nextRequest => dispatch(index + 1, nextRequest))
  }
  return request => dispatch(0, request)
}

const executeRequest = async (config: HttpClientConfig, request: HttpRequest): Promise<HttpResponse<unknown>> => {
  const timeout = request.timeout === undefined ? config.timeout : request.timeout

  validateTimeout(timeout)

  const url = buildUrl(request.url, config.baseUrl, request.query)
  const headers = mergeHeaders(config.headers, request.headers)
  const transportRequest = createTransportRequest(request, url, headers, timeout)

  let transportResponse: HttpTransportResponse
  try {
    transportResponse = await config.transport(transportRequest)
  } catch (error) {
    if (!(error instanceof HttpTransportError)) throw error
    throw normalizeTransportError(error, request)
  }

  const response = normalizeResponse(request, transportResponse)
  if (!isSuccessfulStatus(response.status)) {
    throw new HttpError(`HTTP ${response.status}: ${request.method} ${request.url}`, {
      kind: 'response',
      method: request.method,
      url: request.url,
      response,
    })
  }

  return response
}

const createTransportRequest = (
  request: HttpRequest,
  url: string,
  headers: HttpTransportRequest['headers'],
  timeout: number | null | undefined
): HttpTransportRequest => {
  return {
    method: request.method,
    url,
    headers,
    ...getRequestBody(request),
    ...(request.signal !== undefined && { signal: request.signal }),
    ...(!(timeout === null || timeout === undefined) && { timeout }),
    ...(request.responseType !== undefined && { responseType: request.responseType }),
    ...(request.onUploadProgress !== undefined && { onUploadProgress: request.onUploadProgress }),
    ...(request.onDownloadProgress !== undefined && { onDownloadProgress: request.onDownloadProgress }),
  }
}

const getRequestBody = (request: HttpRequest): HttpRequestBodyOptions => {
  if ('json' in request) return { json: request.json }
  if ('body' in request && request.body !== undefined) return { body: request.body }
  return {}
}

const normalizeResponse = (request: HttpRequest, response: HttpTransportResponse): HttpResponse<unknown> => {
  if (!hasResponseBody(request.method, response.status)) {
    return {
      ...response,
      data: undefined,
    }
  }

  return response
}

const hasResponseBody = (method: HttpRequest['method'], status: number): boolean => {
  return method !== 'HEAD' && ![204, 205, 304].includes(status)
}

const normalizeTransportError = (error: HttpTransportError, request: HttpRequest): HttpError => {
  return new HttpError(transportErrorMessage(error.kind, request), {
    kind: error.kind,
    method: request.method,
    url: request.url,
    cause: error.cause ?? error,
  })
}

const transportErrorMessage = (kind: HttpTransportError['kind'], request: HttpRequest): string => {
  const operation = `${request.method} ${request.url}`
  switch (kind) {
    case 'aborted': {
      return `HTTP request aborted: ${operation}`
    }
    case 'timeout': {
      return `HTTP request timed out: ${operation}`
    }
    case 'network': {
      return `HTTP network request failed: ${operation}`
    }
    case 'unknown': {
      return `HTTP request failed: ${operation}`
    }
  }
}

const isSuccessfulStatus = (status: number): boolean => status >= 200 && status < 300

const validateTimeout = (timeout: number | null | undefined): void => {
  if (timeout === null || timeout === undefined) return
  if (!Number.isFinite(timeout) || timeout <= 0) {
    throw new TypeError('HTTP timeout must be a positive finite number or null')
  }
}
