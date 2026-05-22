export type ValidationErrorLeaf = string[]

export type ValidationErrorBranch = {
  _errors?: string[]
  [key: string]: ValidationErrorNode | string[] | undefined
}

export type ValidationErrorNode = ValidationErrorLeaf | ValidationErrorBranch
