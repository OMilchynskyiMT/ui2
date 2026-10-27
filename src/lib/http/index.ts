import { createHttpClient } from './createHttpClient'

let unauthorizedHandler: (() => void) | undefined

export const setHttpUnauthorizedHandler = (handler: () => void): void => {
  unauthorizedHandler = handler
}

export const http = createHttpClient({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 2 * 60 * 1000,
  onUnauthorized: () => unauthorizedHandler?.(),
})

export { createHttpClient } from './createHttpClient'
export { ApiError, isApiError } from './errors'
export type { ApiResponse } from './types'
