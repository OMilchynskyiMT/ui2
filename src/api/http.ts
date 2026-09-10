import { createAxiosTransport, createHttpClient, type HttpMiddleware, isHttpError } from '@/lib/http'
import { useUserSession } from '@/state/userSession'

import { ApiError, isApiError } from './errors'
import type { ApiResponse } from './types'

const isRecord = (value: unknown): value is Record<PropertyKey, unknown> => typeof value === 'object' && value !== null
const isApiResponse = (data: unknown): data is ApiResponse => {
  if (!isRecord(data) || typeof data.code !== 'number') return false
  if (data.status === 'success' && 'result' in data) return true
  if (data.status === 'error' && 'error' in data && typeof data.error === 'string') return true
  return false
}

const handleApiResponse: HttpMiddleware = async (request, next) => {
  try {
    const response = await next(request)

    // API specific non-envelope responses pass through unchanged
    if (!isApiResponse(response.data)) return response

    if (response.data.status === 'error') {
      throw new ApiError(response.data.error, {
        code: response.data.code,
        httpStatus: response.status,
      })
    }

    return {
      ...response,
      data: response.data.result,
    }
  } catch (error) {
    // NOTE: not 2xx response codes are converted into HttpError by lib/http
    // before this middleware receives them. If such response also contains
    // a valid API error, normalize it into the same ApiError.
    if (
      isHttpError(error) &&
      error.kind === 'response' &&
      error.response !== undefined &&
      isApiResponse(error.response.data)
    ) {
      const data = error.response.data
      if (data.status === 'error') {
        throw new ApiError(data.error, {
          code: data.code,
          httpStatus: error.response.status,
          cause: error,
        })
      }
    }

    throw error
  }
}

const handleExpiredSession: HttpMiddleware = async (request, next) => {
  try {
    return await next(request)
  } catch (error) {
    const isUnauthorizedApiResponse = isApiError(error) && error.code === 401
    const isUnauthorizedHttpResponse = isHttpError(error) && error.kind === 'response' && error.response?.status === 401
    if (isUnauthorizedApiResponse || isUnauthorizedHttpResponse) {
      useUserSession().expire()
    }

    throw error
  }
}

const transport = createAxiosTransport()
const config = {
  transport,
  baseUrl: import.meta.env.VITE_API_URL,
  timeout: 2 * 60 * 1000,
}

export const publicHttp = createHttpClient({
  ...config,
  middleware: [handleApiResponse],
})
export const http = createHttpClient({
  ...config,
  middleware: [handleExpiredSession, handleApiResponse],
})
