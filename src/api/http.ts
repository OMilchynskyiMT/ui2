import { createAxiosTransport, createHttpClient, type HttpMiddleware, isHttpError } from '@/lib/http'
import { useUserSession } from '@/state/userSession'

import { ApiError, isApiError } from './errors'
import type { ApiResponse } from './types'

const unwrapApiResponse: HttpMiddleware = async (request, next) => {
  try {
    const response = await next(request)
    const data = response.data as ApiResponse

    if (data.status === 'error') {
      throw new ApiError(data.error, {
        code: data.code,
        httpStatus: response.status,
      })
    }

    return {
      ...response,
      data: data.result,
    }
  } catch (error) {
    // NOTE: not 2xx response codes are converted into HttpError by lib/http
    // before this middleware receives them. If such response also contains
    // a valid API error, normalize it into the same ApiError.
    if (isHttpError(error) && error.kind === 'response' && error.response !== undefined) {
      const data = error.response.data as ApiResponse
      if (data?.status === 'error') {
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
  middleware: [unwrapApiResponse],
})
export const http = createHttpClient({
  ...config,
  middleware: [handleExpiredSession, unwrapApiResponse],
})
