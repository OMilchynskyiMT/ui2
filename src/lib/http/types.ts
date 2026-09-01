export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS'
export type HttpResponseType = 'json' | 'text' | 'blob' | 'arrayBuffer'
export type HttpQueryPrimitive = string | number | boolean
export type HttpQueryValue = HttpQueryPrimitive | readonly HttpQueryPrimitive[] | null | undefined
export type HttpQuery = Readonly<Record<string, HttpQueryValue>>
export type HttpRawHeaders = Record<string, string>
export type HttpHeaders = Readonly<HttpRawHeaders>

export type HttpProgress = {
  readonly loaded: number
  readonly total?: number
  readonly ratio?: number
}

export type HttpRawBody = string | Blob | FormData | URLSearchParams | ArrayBuffer | ArrayBufferView
export type HttpRequestOptions = {
  readonly query?: HttpQuery
  readonly headers?: HttpHeaders
  readonly signal?: AbortSignal
  readonly timeout?: number | null
  readonly responseType?: HttpResponseType
  readonly onUploadProgress?: (progress: HttpProgress) => void
  readonly onDownloadProgress?: (progress: HttpProgress) => void
}

export type HttpRequestBodyOptions =
  | {
      readonly json: unknown
      readonly body?: never
    }
  | {
      readonly body: HttpRawBody
      readonly json?: never
    }
  | {
      readonly json?: never
      readonly body?: never
    }

export type HttpRequestOptionsWithBody = HttpRequestOptions & HttpRequestBodyOptions
export type HttpRequest =
  | ({
      readonly method: 'GET' | 'HEAD'
      readonly url: string
    } & HttpRequestOptions)
  | ({
      readonly method: Exclude<HttpMethod, 'GET' | 'HEAD'>
      readonly url: string
    } & HttpRequestOptionsWithBody)

export type HttpResponse<T = unknown> = {
  readonly data: T
  readonly status: number
  readonly headers: HttpHeaders
}

export type HttpHandler = (request: HttpRequest) => Promise<HttpResponse<unknown>>
export type HttpMiddleware = (request: HttpRequest, next: HttpHandler) => Promise<HttpResponse<unknown>>
export type HttpTransportResponseType = Exclude<HttpResponseType, 'json'>
export type HttpTransportRequest = {
  readonly method: HttpMethod
  readonly url: string
  readonly headers: HttpHeaders
  readonly body?: HttpRawBody
  readonly signal?: AbortSignal
  readonly timeout?: number
  readonly responseType: HttpTransportResponseType
  readonly onUploadProgress?: (progress: HttpProgress) => void
  readonly onDownloadProgress?: (progress: HttpProgress) => void
}

export type HttpTransportResponse = {
  readonly data: unknown
  readonly status: number
  readonly headers: HttpHeaders
}

export type HttpTransport = (request: HttpTransportRequest) => Promise<HttpTransportResponse>
export type HttpClientConfig = {
  readonly transport: HttpTransport
  readonly baseUrl?: string
  readonly timeout?: number | null
  readonly headers?: HttpHeaders
  readonly middleware?: readonly HttpMiddleware[]
}

export type HttpClient = {
  request<T = unknown>(request: HttpRequest): Promise<HttpResponse<T>>
  get<T = unknown>(url: string, options?: HttpRequestOptions): Promise<HttpResponse<T>>
  post<T = unknown>(url: string, options?: HttpRequestOptionsWithBody): Promise<HttpResponse<T>>
  put<T = unknown>(url: string, options?: HttpRequestOptionsWithBody): Promise<HttpResponse<T>>
  patch<T = unknown>(url: string, options?: HttpRequestOptionsWithBody): Promise<HttpResponse<T>>
  delete<T = unknown>(url: string, options?: HttpRequestOptionsWithBody): Promise<HttpResponse<T>>
}
