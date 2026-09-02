export type ApiResponse<T = unknown> =
  | {
      code: number
      status: 'success'
      result: T
    }
  | {
      code: number
      status: 'error'
      error: string
    }
