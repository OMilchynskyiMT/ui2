/* eslint-disable unicorn/consistent-function-scoping */
/* eslint-disable @typescript-eslint/require-await */
import { describe, expect, it } from 'vitest'

import { createHttpClient } from '../createHttpClient'
import { HttpError, HttpTransportError, isHttpError } from '../errors'
import type { HttpMiddleware, HttpTransport, HttpTransportRequest, HttpTransportResponse } from '../types'

const transportResponse = (data: unknown, status = 200): HttpTransportResponse => {
  return {
    data,
    status,
    headers: {
      'content-type': 'application/json',
    },
  }
}

describe('createHttpClient', () => {
  it('normalizes and serializes a JSON request before transport', async () => {
    let actualRequest: HttpTransportRequest | undefined

    const transport: HttpTransport = async request => {
      actualRequest = request
      return transportResponse('{"id":1}', 201)
    }

    const http = createHttpClient({
      transport,
      baseUrl: '/api/',
      timeout: 15_000,
      headers: {
        Accept: 'application/json',
        'X-Default': 'default',
      },
    })

    const response = await http.post<{ id: number }>('/users', {
      query: {
        active: true,
        role: ['admin', 'manager'],
        ignored: null,
      },
      headers: {
        'x-default': 'overridden',
      },
      json: {
        name: 'John',
      },
    })

    expect(actualRequest).toEqual({
      method: 'POST',
      url: '/api/users?active=true&role=admin&role=manager',
      headers: {
        accept: 'application/json',
        'x-default': 'overridden',
        'content-type': 'application/json',
      },
      body: '{"name":"John"}',
      timeout: 15_000,
      responseType: 'text',
    })

    expect(response).toEqual({
      data: { id: 1 },
      status: 201,
      headers: {
        'content-type': 'application/json',
      },
    })
  })

  it('allows a request to disable the client timeout', async () => {
    let actualRequest: HttpTransportRequest | undefined

    const transport: HttpTransport = async request => {
      actualRequest = request
      return transportResponse('{}')
    }

    const http = createHttpClient({
      transport,
      timeout: 15_000,
    })

    await http.get('/status', {
      timeout: null,
    })

    expect(actualRequest).toEqual({
      method: 'GET',
      url: '/status',
      headers: {},
      responseType: 'text',
    })
  })

  it('runs middleware in wrapping order', async () => {
    const order: string[] = []
    const first: HttpMiddleware = async (request, next) => {
      order.push('first:before')
      const response = await next(request)
      order.push('first:after')
      return response
    }
    const second: HttpMiddleware = async (request, next) => {
      order.push('second:before')
      const response = await next({
        ...request,
        headers: {
          ...request.headers,
          authorization: 'Bearer token',
        },
      })
      order.push('second:after')
      return response
    }

    const transport: HttpTransport = async request => {
      order.push(request.headers.authorization ?? 'missing-auth')
      return transportResponse('{}')
    }

    const http = createHttpClient({
      transport,
      middleware: [first, second],
    })

    await http.get('/users')
    expect(order).toEqual(['first:before', 'second:before', 'Bearer token', 'second:after', 'first:after'])
  })

  it('returns structured response errors with parsed JSON bodies', async () => {
    const transport: HttpTransport = async () => transportResponse('{"code":"user_exists"}', 409)
    const http = createHttpClient({ transport })

    try {
      await http.post('/users', {
        json: {
          name: 'John',
        },
      })

      throw new Error('Expected request to fail')
    } catch (error) {
      expect(error).toBeInstanceOf(HttpError)
      if (!(error instanceof HttpError)) throw error

      expect(error.kind).toBe('response')
      expect(error.response).toEqual({
        data: {
          code: 'user_exists',
        },
        status: 409,
        headers: {
          'content-type': 'application/json',
        },
      })
    }
  })

  it('preserves a malformed non-success response body', async () => {
    const transport: HttpTransport = async () => transportResponse('not-json', 500)
    const http = createHttpClient({ transport })

    try {
      await http.get('/status')
      throw new Error('Expected request to fail')
    } catch (error) {
      expect(error).toBeInstanceOf(HttpError)
      if (!(error instanceof HttpError)) throw error

      expect(error.kind).toBe('response')
      expect(error.response?.data).toBe('not-json')
      expect(error.cause).toBeInstanceOf(SyntaxError)
    }
  })

  it('reports malformed successful JSON as a parse error', async () => {
    const transport: HttpTransport = async () => transportResponse('not-json')
    const http = createHttpClient({ transport })

    try {
      await http.get('/status')
      throw new Error('Expected request to fail')
    } catch (error) {
      expect(error).toBeInstanceOf(HttpError)
      if (!isHttpError(error)) throw error

      expect(error.kind).toBe('parse')
      expect(error.response?.status).toBe(200)
      expect(error.response?.data).toBe('not-json')
    }
  })

  it('normalizes transport failures', async () => {
    const transport: HttpTransport = async () => {
      throw new HttpTransportError('timeout', 'Timed out')
    }

    const http = createHttpClient({ transport })

    try {
      await http.get('/status')
      throw new Error('Expected request to fail')
    } catch (error) {
      expect(error).toBeInstanceOf(HttpError)
      if (!(error instanceof HttpError)) throw error

      expect(error.kind).toBe('timeout')
      expect(error.method).toBe('GET')
      expect(error.url).toBe('/status')
    }
  })
})
