export type ValidationErrorLeaf = string[]

export interface ValidationErrorBranch {
  _errors?: string[]
  [key: string]: ValidationErrorNode | string[] | undefined
}

export type ValidationErrorNode = ValidationErrorLeaf | ValidationErrorBranch
