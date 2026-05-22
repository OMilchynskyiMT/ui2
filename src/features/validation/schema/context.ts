import type { ValidationIssue } from '../model/issues'
import type { ValidationObjectMode, ValidationOptions } from '../model/options'
import type { ValidationPath, ValidationPathSegment } from '../model/path'

export type NormalizedValidationOptions = {
  objectMode: ValidationObjectMode
}

export type IssueInput = {
  code: string
  message: string
  input?: unknown
  meta?: Record<string, unknown>
  path?: ValidationPath
}

export type ParseContext = {
  readonly path: ValidationPath
  readonly issues: ValidationIssue[]
  readonly options: NormalizedValidationOptions

  child: (segment: ValidationPathSegment) => ParseContext
  addIssue: (issue: IssueInput) => void
}

export type RefinementContext = {
  readonly path: ValidationPath
  addIssue: (issue: IssueInput) => void
}

export type ParseSuccess<T> = {
  ok: true
  value: T
}

export type ParseFailure = {
  ok: false
}

export type ParseResult<T> = ParseSuccess<T> | ParseFailure

export const ok = <T>(value: T): ParseSuccess<T> => ({
  ok: true,
  value,
})

export const fail = (): ParseFailure => ({
  ok: false,
})

export function normalizeValidationOptions(options?: ValidationOptions): NormalizedValidationOptions {
  return {
    objectMode: options?.objectMode ?? 'strip',
  }
}

function resolvePath(base: ValidationPath, relative?: ValidationPath): ValidationPath {
  if (!relative || relative.length === 0) return [...base]
  return [...base, ...relative]
}

class ParseContextImpl implements ParseContext {
  public readonly path: ValidationPath
  public readonly issues: ValidationIssue[]
  public readonly options: NormalizedValidationOptions

  public constructor(issues: ValidationIssue[], options: NormalizedValidationOptions, path: ValidationPath = []) {
    this.path = path
    this.issues = issues
    this.options = options
  }

  public child(segment: ValidationPathSegment): ParseContext {
    return createChildParseContext(this.issues, this.options, [...this.path, segment])
  }

  public addIssue(issue: IssueInput): void {
    this.issues.push({
      path: resolvePath(this.path, issue.path),
      code: issue.code,
      message: issue.message,
      input: issue.input,
      meta: issue.meta,
    })
  }
}

class RefinementContextImpl implements RefinementContext {
  public readonly path: ValidationPath
  private readonly parseContext: ParseContext

  public constructor(parseContext: ParseContext) {
    this.parseContext = parseContext
    this.path = parseContext.path
  }

  public addIssue(issue: IssueInput): void {
    this.parseContext.addIssue(issue)
  }
}

export function createParseContext(
  issues: ValidationIssue[] = [],
  options?: ValidationOptions,
  path: ValidationPath = []
): ParseContext {
  return new ParseContextImpl(issues, normalizeValidationOptions(options), path)
}

export function createChildParseContext(
  issues: ValidationIssue[],
  options: NormalizedValidationOptions,
  path: ValidationPath = []
): ParseContext {
  return new ParseContextImpl(issues, options, path)
}

export function createRefinementContext(parseContext: ParseContext): RefinementContext {
  return new RefinementContextImpl(parseContext)
}
