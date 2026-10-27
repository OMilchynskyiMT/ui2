import { type AxiosAdapter, AxiosError, AxiosHeaders, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import { describe, expect, it, vi } from 'vitest'

import { createHttpClient } from '../createHttpClient'
import { ApiError } from '../errors'

const mockAdapter = (data: unknown, status = 200) => {
  const requests: InternalAxiosRequestConfig[] = []
  // eslint-disable-next-line @typescript-eslint/require-await
  const adapter: AxiosAdapter = async config => {
    requests.push(config)
    const response: AxiosResponse = {
      data,
      status,
      statusText: status >= 400 ? 'Error' : 'OK',
      headers: { 'content-type': 'application/json' },
      config,
    }
    if (!config.validateStatus || config.validateStatus(status)) return response
    throw new AxiosError(
      `Request failed with status code ${status}`,
      AxiosError.ERR_BAD_RESPONSE,
      config,
      undefined,
      response
    )
  }
  return { adapter, requests }
}

const success = <T>(result: T) => ({ code: 200, status: 'success', result })

describe('device HTTP client', () => {
  it('unwraps the authoritative API result and preserves Axios response metadata', async () => {
    const mock = mockAdapter(success({ user: 'admin' }))
    const http = createHttpClient({ adapter: mock.adapter, baseURL: '/api/', timeout: 15_000 })

    const response = await http.post<{ user: string }>(
      '/users',
      { name: 'John' },
      { params: { active: true, role: ['admin', 'manager'], ignored: null } }
    )

    expect(response).toMatchObject({ data: { user: 'admin' }, status: 200 })
    expect(mock.requests[0]).toMatchObject({
      url: '/users',
      baseURL: '/api/',
      method: 'post',
      timeout: 15_000,
      data: '{"name":"John"}',
    })
    expect(http.getUri(mock.requests[0])).toBe('/api/users?active=true&role=admin&role=manager')
  })

  it('serializes the real device API field query using Axios', () => {
    const http = createHttpClient({ baseURL: 'https://192.168.2.1' })

    expect(http.getUri({ url: '/api', params: { fields: 'status,system/dbDirty', inactivity: true } })).toBe(
      'https://192.168.2.1/api?fields=status,system%2FdbDirty&inactivity=true'
    )
  })

  it('supports overriding headers, timeout and other native Axios options', async () => {
    const mock = mockAdapter(success(true))
    const http = createHttpClient({ adapter: mock.adapter, headers: { 'X-Token': 'default' }, timeout: 5000 })

    await http.get<boolean>('/status', { headers: { 'x-token': 'override' }, timeout: 0, withCredentials: true })

    expect(mock.requests[0]?.timeout).toBe(0)
    expect(AxiosHeaders.from(mock.requests[0]?.headers).get('x-token')).toBe('override')
    expect(mock.requests[0]?.withCredentials).toBe(true)
  })

  it('returns native Blob, text and ArrayBuffer responses without unwrapping', async () => {
    const file = new Blob(['config'])
    const mock = mockAdapter(file)
    const http = createHttpClient({ adapter: mock.adapter })
    const { data } = await http.get<Blob>('/config', { responseType: 'blob' })

    expect(data).toBe(file)
    expect(mock.requests[0]?.responseType).toBe('blob')

    const log = createHttpClient({ adapter: mockAdapter('log text').adapter })
    const bytes = new Uint8Array([1, 2]).buffer
    const binary = createHttpClient({ adapter: mockAdapter(bytes).adapter })
    const logResponse = await log.get<string>('/log', { responseType: 'text' })
    const binaryResponse = await binary.get<ArrayBuffer>('/raw', { responseType: 'arraybuffer' })

    expect(logResponse.data).toBe('log text')
    expect(binaryResponse.data).toBe(bytes)
  })

  it('passes FormData, request cancellation and progress callbacks directly to Axios', async () => {
    const mock = mockAdapter(success({ accepted: true }))
    const http = createHttpClient({ adapter: mock.adapter })
    const controller = new AbortController()
    const uploadProgress = vi.fn()
    const downloadProgress = vi.fn()
    const form = new FormData()
    form.append('name', 'test')

    await http.put('/upload', form, {
      signal: controller.signal,
      onUploadProgress: uploadProgress,
      onDownloadProgress: downloadProgress,
    })

    expect(mock.requests[0]?.data).toBe(form)
    expect(mock.requests[0]?.signal).toBe(controller.signal)
    expect(mock.requests[0]?.onUploadProgress).toBe(uploadProgress)
    expect(mock.requests[0]?.onDownloadProgress).toBe(downloadProgress)
  })

  it('allows requesting unwrapped JSON when it is not a device API endpoint', async () => {
    const payload = { name: 'configuration' }
    const http = createHttpClient({ adapter: mockAdapter(payload).adapter })
    const response = await http.get<typeof payload>('/config.json', { skipApiEnvelope: true })

    expect(response.data).toEqual(payload)
  })

  it('reports HTTP-200 API failures using the application code and message', async () => {
    const http = createHttpClient({
      adapter: mockAdapter({ code: 409, status: 'fail', error: 'Session conflict' }).adapter,
    })

    await expect(http.get('/login')).rejects.toMatchObject({
      name: 'ApiError',
      code: 409,
      httpStatus: 200,
      message: 'Session conflict',
    })
  })

  it('preserves the API failure code on non-2xx responses', async () => {
    const http = createHttpClient({
      adapter: mockAdapter({ code: 403, status: 'fail', error: 'Access denied' }, 401).adapter,
    })

    await expect(http.get('/private')).rejects.toMatchObject({ code: 403, httpStatus: 401, message: 'Access denied' })
  })

  it('supports legacy HTTP error bodies with only an error field', async () => {
    const http = createHttpClient({ adapter: mockAdapter({ error: 'Maximum users reached' }, 409).adapter })

    await expect(http.get('/login')).rejects.toMatchObject({
      name: 'ApiError',
      code: 409,
      httpStatus: 409,
      message: 'Maximum users reached',
    })
  })

  it('respects custom Axios validateStatus without unwrapping non-2xx JSON', async () => {
    const payload = { message: 'Not found' }
    const http = createHttpClient({ adapter: mockAdapter(payload, 404).adapter, validateStatus: () => true })

    await expect(http.get('/missing')).resolves.toMatchObject({ status: 404, data: payload })
  })

  it('preserves native Axios errors for HTTP failures without an API error', async () => {
    const http = createHttpClient({ adapter: mockAdapter('Unavailable', 503).adapter })

    await expect(http.get('/policy', { responseType: 'text' })).rejects.toMatchObject({
      name: 'AxiosError',
      response: { status: 503, data: 'Unavailable' },
    })
  })

  it('does not inspect a failed binary download as JSON', async () => {
    const failure = new Blob(['failure'])
    const http = createHttpClient({ adapter: mockAdapter(failure, 404).adapter })

    await expect(http.get<Blob>('/missing', { responseType: 'blob' })).rejects.toMatchObject({
      name: 'AxiosError',
      response: { status: 404, data: failure },
    })
  })

  it('expires the session only when the request permits session handling', async () => {
    const onUnauthorized = vi.fn()
    const mock = mockAdapter({ code: 401, status: 'fail', error: 'Unauthorized' })
    const http = createHttpClient({ adapter: mock.adapter, onUnauthorized })

    await expect(http.get('/login', { skipSessionExpiration: true })).rejects.toBeInstanceOf(ApiError)
    expect(onUnauthorized).not.toHaveBeenCalled()
    await expect(http.get('/private')).rejects.toBeInstanceOf(ApiError)
    expect(onUnauthorized).toHaveBeenCalledOnce()
  })

  it('expires the session on HTTP 401 even for binary requests', async () => {
    const onUnauthorized = vi.fn()
    const http = createHttpClient({ adapter: mockAdapter(new Blob(), 401).adapter, onUnauthorized })

    await expect(http.get<Blob>('/file', { responseType: 'blob' })).rejects.toBeInstanceOf(AxiosError)
    expect(onUnauthorized).toHaveBeenCalledOnce()
  })

  it('retains native Axios network, timeout and cancellation errors', async () => {
    // eslint-disable-next-line @typescript-eslint/require-await
    const adapter: AxiosAdapter = async config => {
      throw new AxiosError('Timeout', AxiosError.ETIMEDOUT, config)
    }
    const http = createHttpClient({ adapter })

    await expect(http.get('/status')).rejects.toMatchObject({ name: 'AxiosError', code: AxiosError.ETIMEDOUT })
  })

  it('handles empty API responses without reading an envelope', async () => {
    const http = createHttpClient({ adapter: mockAdapter('', 204).adapter })
    await expect(http.head('/status')).resolves.toMatchObject({ data: undefined })
    await expect(http.get('/nothing')).resolves.toMatchObject({ data: undefined })
  })
})
