export type ApiResponse<T> =
  | {
      readonly code: number
      readonly status: 'success'
      readonly result: T
    }
  | {
      readonly code: number
      readonly status: 'fail'
      readonly error?: string
    }

declare module 'axios' {
  // module augmentation must use an interface to extend Axios's request options
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
  interface AxiosRequestConfig<D = any, P = any> {
    // do not expire the active session for this request (e.g. login or availability probes)
    // literally, just ignore session expiration handler
    skipSessionExpiration?: boolean
    // leave JSON as-is instead of extracting the device API envelope's result
    skipApiEnvelope?: boolean
  }
}
