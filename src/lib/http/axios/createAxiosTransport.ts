import axios, { AxiosError, type AxiosProgressEvent } from 'axios'

import { HttpTransportError } from '../errors'
import type { HttpProgress, HttpRawHeaders, HttpResponseType, HttpTransport, HttpTransportRequest } from '../types'

export const createAxiosTransport = (): HttpTransport => {
  const client = axios.create({
    adapter: 'xhr',
    headers: {
      Accept: undefined,
      'Content-Type': undefined,
    },
    validateStatus: null,
    withXSRFToken: false,
    transitional: {
      clarifyTimeoutError: true,
    },
  })

  return async request => {
    const body = prepareRequestBody(request)

    try {
      const response = await client.request({
        method: request.method,
        url: request.url,
        headers: body.headers,
        timeout: request.timeout ?? 0,
        ...(request.responseType !== undefined && { responseType: mapResponseType(request.responseType) }),
        ...(body.data !== undefined && { data: body.data }),
        ...(request.signal !== undefined && { signal: request.signal }),
        ...(request.onUploadProgress !== undefined && {
          onUploadProgress: (event: AxiosProgressEvent) => request.onUploadProgress?.(normalizeProgress(event)),
        }),
        ...(request.onDownloadProgress !== undefined && {
          onDownloadProgress: (event: AxiosProgressEvent) => request.onDownloadProgress?.(normalizeProgress(event)),
        }),
      })

      return {
        data: response.data,
        status: response.status,
        headers: normalizeAxiosHeaders(response.headers),
      }
    } catch (error) {
      throw normalizeAxiosError(error, request)
    }
  }
}

type PreparedRequestBody = {
  readonly headers: HttpRawHeaders
  readonly data?: unknown
}

const prepareRequestBody = (request: HttpTransportRequest): PreparedRequestBody => {
  const headers = { ...request.headers }

  if ('json' in request) {
    const data = JSON.stringify(request.json)
    if (data === undefined) throw new TypeError('HTTP JSON body is not serializable')

    headers['content-type'] ??= 'application/json'
    return { headers, data }
  }

  if ('body' in request && request.body !== undefined) {
    return {
      headers,
      data: request.body,
    }
  }

  return { headers }
}

const mapResponseType = (responseType: HttpResponseType): 'text' | 'blob' | 'arraybuffer' => {
  return responseType === 'arrayBuffer' ? 'arraybuffer' : responseType
}

const normalizeProgress = (event: AxiosProgressEvent): HttpProgress => {
  const ratio =
    event.total !== undefined && event.total > 0 ? Math.min(Math.max(event.loaded / event.total, 0), 1) : undefined

  return {
    loaded: event.loaded,
    ...(event.total !== undefined && { total: event.total }),
    ...(ratio !== undefined && { ratio }),
  }
}

const normalizeAxiosHeaders = (headers: unknown): HttpRawHeaders => {
  const source = getAxiosHeaderEntries(headers)
  const normalized: HttpRawHeaders = {}

  for (const [name, value] of Object.entries(source)) {
    if (([null, undefined, false] as unknown[]).includes(value)) continue
    normalized[name.toLowerCase()] = Array.isArray(value) ? value.join(', ') : String(value)
  }

  return normalized
}

const getAxiosHeaderEntries = (headers: unknown): Record<string, unknown> => {
  if (!isRecord(headers)) return {}
  const toJSON = headers.toJSON
  if (typeof toJSON !== 'function') return headers
  const result = toJSON.call(headers)
  return isRecord(result) ? result : {}
}

const normalizeAxiosError = (error: unknown, request: HttpTransportRequest): HttpTransportError => {
  if (!axios.isAxiosError(error)) {
    return new HttpTransportError('unknown', 'Unexpected Axios transport error', error)
  }

  if (error.code === AxiosError.ERR_CANCELED || request.signal?.aborted === true) {
    return new HttpTransportError('aborted', error.message, error)
  }

  if ([AxiosError.ETIMEDOUT, AxiosError.ECONNABORTED].includes(error.code!)) {
    return new HttpTransportError('timeout', error.message, error)
  }

  if (error.code === AxiosError.ERR_NETWORK) {
    return new HttpTransportError('network', error.message, error)
  }

  return new HttpTransportError('unknown', error.message, error)
}

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null
}
