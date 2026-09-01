import type { HttpHeaders, HttpQuery, HttpRawBody, HttpRawHeaders, HttpRequest } from './types'

const absoluteUrlPattern = /^[a-z][a-z\d+.-]*:/i

export const normalizeHeaders = (headers?: HttpHeaders): HttpRawHeaders => {
  const normalized: HttpRawHeaders = {}
  if (headers === undefined) return normalized
  for (const [name, value] of Object.entries(headers)) {
    normalized[name.toLowerCase()] = value
  }
  return normalized
}

export const mergeHeaders = (defaults?: HttpHeaders, overrides?: HttpHeaders): HttpHeaders => {
  return {
    ...normalizeHeaders(defaults),
    ...normalizeHeaders(overrides),
  }
}

export const buildUrl = (url: string, baseUrl?: string, query?: HttpQuery): string => {
  const resolvedUrl = resolveUrl(url, baseUrl)
  const serializedQuery = serializeQuery(query)
  if (serializedQuery.length === 0) return resolvedUrl

  const hashIndex = resolvedUrl.indexOf('#')
  const hash = hashIndex === -1 ? '' : resolvedUrl.slice(hashIndex)
  const path = hashIndex === -1 ? resolvedUrl : resolvedUrl.slice(0, hashIndex)
  const separator = path.includes('?') ? '&' : '?'

  return `${path}${separator}${serializedQuery}${hash}`
}

export const serializeRequestBody = (
  request: HttpRequest,
  headers: HttpHeaders
): {
  readonly body?: HttpRawBody
  readonly headers: HttpRawHeaders
} => {
  const normalizedHeaders = normalizeHeaders(headers)

  if ('json' in request) {
    const body = JSON.stringify(request.json)
    if (body === undefined) {
      throw new TypeError('HTTP JSON body is not serializable')
    }

    normalizedHeaders['content-type'] ??= 'application/json'
    return {
      body,
      headers: normalizedHeaders,
    }
  }

  if ('body' in request) {
    return {
      body: request.body,
      headers: normalizedHeaders,
    }
  }

  return {
    headers: normalizedHeaders,
  }
}

const resolveUrl = (url: string, baseUrl?: string): string => {
  if (baseUrl === undefined || baseUrl.length === 0 || absoluteUrlPattern.test(url) || url.startsWith('//')) {
    return url
  }
  return `${baseUrl.replace(/\/+$/, '')}/${url.replace(/^\/+/, '')}`
}

const serializeQuery = (query?: HttpQuery): string => {
  if (query === undefined) return ''
  const parameters = new URLSearchParams()
  for (const [name, value] of Object.entries(query)) {
    if (value === null || value === undefined) continue
    if (Array.isArray(value)) {
      for (const item of value) {
        parameters.append(name, String(item))
      }
      continue
    }
    parameters.append(name, String(value))
  }

  return parameters.toString()
}
