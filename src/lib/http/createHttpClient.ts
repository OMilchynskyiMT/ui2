import { HttpError, HttpTransportError } from './errors'
import { buildUrl, mergeHeaders, serializeRequestBody } from './serialization'
import type {
  HttpClient,
  HttpClientConfig,
  HttpHandler,
  HttpMiddleware,
  HttpRequest,
  HttpRequestOptions,
  HttpRequestOptionsWithBody,
  HttpResponse,
  HttpResponseType,
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
  const serialized = serializeRequestBody(request, headers)
  const responseType = request.responseType ?? 'json'
  const transportRequest: HttpTransportRequest = {
    method: request.method,
    url,
    headers: serialized.headers,
    responseType: responseType === 'json' ? 'text' : responseType,
    ...(serialized.body !== undefined && { body: serialized.body }),
    ...(request.signal !== undefined && { signal: request.signal }),
    ...(!(timeout === null || timeout === undefined) && { timeout }),
    ...(request.onUploadProgress !== undefined && { onUploadProgress: request.onUploadProgress }),
    ...(request.onDownloadProgress !== undefined && { onDownloadProgress: request.onDownloadProgress }),
  }

  let transportResponse: HttpTransportResponse
  try {
    transportResponse = await config.transport(transportRequest)
  } catch (error) {
    throw normalizeTransportError(error, request)
  }

  const parsed = parseResponse(transportResponse, responseType)
  if (!isSuccessfulStatus(transportResponse.status)) {
    throw new HttpError(`HTTP ${transportResponse.status}: ${request.method} ${request.url}`, {
      kind: 'response',
      method: request.method,
      url: request.url,
      response: {
        data: parsed.ok ? parsed.data : transportResponse.data,
        status: transportResponse.status,
        headers: transportResponse.headers,
      },
      ...(!parsed.ok && { cause: parsed.error }),
    })
  }

  if (!parsed.ok) {
    throw new HttpError(`Failed to parse HTTP response: ${request.method} ${request.url}`, {
      kind: 'parse',
      method: request.method,
      url: request.url,
      response: {
        data: transportResponse.data,
        status: transportResponse.status,
        headers: transportResponse.headers,
      },
      cause: parsed.error,
    })
  }

  return {
    data: parsed.data,
    status: transportResponse.status,
    headers: transportResponse.headers,
  }
}

const parseResponse = (
  response: HttpTransportResponse,
  responseType: HttpResponseType
): { readonly ok: true; readonly data: unknown } | { readonly ok: false; readonly error: unknown } => {
  if (responseType !== 'json') {
    return { ok: true, data: response.data }
  }

  if ((['', null, undefined] as unknown[]).includes(response.data)) {
    return { ok: true, data: undefined }
  }

  if (typeof response.data !== 'string') {
    return {
      ok: false,
      error: new TypeError('Expected text response for JSON deserialization'),
    }
  }

  const text = response.data.replace(/^\u{FEFF}/u, '')
  if (text.trim().length === 0) {
    return { ok: true, data: undefined }
  }

  try {
    return { ok: true, data: JSON.parse(text) }
  } catch (error) {
    return { ok: false, error }
  }
}

const normalizeTransportError = (error: unknown, request: HttpRequest): HttpError => {
  if (error instanceof HttpTransportError) {
    return new HttpError(transportErrorMessage(error.kind, request), {
      kind: error.kind,
      method: request.method,
      url: request.url,
      cause: error.cause ?? error,
    })
  }

  return new HttpError(`HTTP request failed: ${request.method} ${request.url}`, {
    kind: 'unknown',
    method: request.method,
    url: request.url,
    cause: error,
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
