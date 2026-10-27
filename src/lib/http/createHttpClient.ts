import axios, { type AxiosResponse, type CreateAxiosDefaults } from 'axios'

import { ApiError } from './errors'
import type { ApiResponse } from './types'

type HttpClientConfig = CreateAxiosDefaults & {
  onUnauthorized?: () => void
}

const isApiJson = (response: AxiosResponse): boolean =>
  !response.config.skipApiEnvelope &&
  (response.config.responseType === undefined || response.config.responseType === 'json')

// API is authoritative! We only distinguish its success/failure envelope
const getApiError = (response: AxiosResponse): ApiError | undefined => {
  if (!isApiJson(response)) return

  const body = response.data as { code?: number; status?: 'success' | 'fail'; error?: string } | null
  if (body?.status !== 'fail' && !(response.status >= 400 && typeof body?.error === 'string')) return

  const code = body.code ?? response.status
  return new ApiError(body.error ?? `API request failed (${code})`, code, response.status)
}

export const createHttpClient = ({ onUnauthorized, ...defaults }: HttpClientConfig = {}) => {
  const client = axios.create({
    paramsSerializer: { indexes: null },
    withXSRFToken: false,
    transitional: { clarifyTimeoutError: true },
    ...defaults,
  })

  const notifyUnauthorized = (response: AxiosResponse, apiError?: ApiError): void => {
    if (!response.config.skipSessionExpiration && (response.status === 401 || apiError?.code === 401)) {
      onUnauthorized?.()
    }
  }

  client.interceptors.response.use(
    response => {
      const apiError = getApiError(response)
      notifyUnauthorized(response, apiError)
      if (apiError) throw apiError

      if (response.config.method === 'head' || response.status === 204 || response.status === 205) {
        return { ...response, data: undefined }
      }
      if (response.status >= 200 && response.status < 300 && isApiJson(response)) {
        const body = response.data as Extract<ApiResponse<unknown>, { status: 'success' }>
        return { ...response, data: body.result }
      }
      return response
    },
    (error: unknown) => {
      if (axios.isAxiosError(error) && error.response) {
        const apiError = getApiError(error.response)
        notifyUnauthorized(error.response, apiError)
        if (apiError) throw apiError
      }

      if (error instanceof Error) throw error
      throw new Error(String(error))
    }
  )

  return client
}
